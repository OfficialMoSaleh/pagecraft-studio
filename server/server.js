import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildStandaloneHTML } from '../src/engine/exportHtml.js';
import { computeOrderPricing } from '../src/engine/orderPricing.js';
import { createJsonStore } from './store.js';
import { notifyStoreOwner, whatsappNotificationsConfigured } from './notify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
 * Configuration (environment variables)
 *   PORT                   default 3001
 *   HOST                   default 127.0.0.1 (local only). Use 0.0.0.0 only behind an HTTPS reverse proxy.
 *   PAGECRAFT_ADMIN_TOKEN  required for admin routes from any non-local request.
 *                          If unset, admin routes are accepted only from the local machine.
 *   ALLOWED_ORIGINS        comma-separated CORS allow-list (default: none, same-origin only)
 *   PAGECRAFT_DATA_DIR     where pages.json / orders.json live (default server/data)
 *   TRUST_PROXY            set to 1 when running behind a reverse proxy (correct client IPs for rate limits)
 *   EVOLUTION_API_URL / EVOLUTION_API_KEY / EVOLUTION_INSTANCE
 *                          optional: WhatsApp new-order alerts to each store's own number (see notify.js)
 */
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '127.0.0.1';
const ADMIN_TOKEN = process.env.PAGECRAFT_ADMIN_TOKEN || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const DATA_DIR = process.env.PAGECRAFT_DATA_DIR || path.join(__dirname, 'data');

const SLUG_RE = /^[a-z0-9؀-ۿ_-]{1,80}$/;
const ALLOWED_THEMES = new Set(['editorial', 'minimal', 'forest', 'charcoal']);
const ORDER_STATUSES = new Set(['new', 'confirmed', 'shipped', 'delivered', 'cancelled']);
const PAYMENT_METHODS = new Set(['cod', 'instapay']);

const pagesStore = createJsonStore(path.join(DATA_DIR, 'pages.json'));
const ordersStore = createJsonStore(path.join(DATA_DIR, 'orders.json'));

// ---------- helpers ----------
export function cleanSlug(raw) {
  const slug = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9؀-ۿ_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return SLUG_RE.test(slug) ? slug : '';
}

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const digitsOnly = (v) => String(v ?? '').replace(/\D/g, '');
const cleanText = (v, max) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);

function isLoopback(req) {
  const ip = req.socket.remoteAddress || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

function tokensMatch(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function requireWriteAccess(req, res, next) {
  if (ADMIN_TOKEN) {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (token && tokensMatch(token, ADMIN_TOKEN)) return next();
    return res.status(401).json({ success: false, error: 'غير مصرح' });
  }
  // No token configured: local development only.
  if (isLoopback(req)) return next();
  return res.status(403).json({ success: false, error: 'الكتابة متاحة محلياً فقط' });
}

/** Fixed-window in-memory rate limiter (per IP + bucket). */
function rateLimit({ windowMs, max, bucket }) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key);
  }, windowMs).unref();
  return (req, res, next) => {
    const key = `${bucket}:${req.ip}`;
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.reset - now) / 1000));
      return res.status(429).json({ success: false, error: 'طلبات كثيرة، حاول بعد قليل' });
    }
    return next();
  };
}

const findPage = (pages, target) =>
  (has(pages, target) && pages[target]) ||
  Object.values(pages).find((p) => p.id === target || p.slug === target);

function newOrderId(orders) {
  // 8 chars from an unambiguous alphabet: ~1e12 combinations, not guessable or sequential.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (;;) {
    const bytes = crypto.randomBytes(8);
    const id = 'ORD-' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
    if (!has(orders, id)) return id;
  }
}

/** Public, non-sensitive view of an order (no address, no full phone). */
const publicOrderView = (o) => ({
  id: o.id,
  status: o.status,
  createdAt: o.createdAt,
  updatedAt: o.updatedAt,
  projectName: o.projectName,
  bundleTitle: o.bundleTitle,
  variantSelections: o.variantSelections,
  governorate: o.governorate,
  totalAmount: o.totalAmount,
  currency: o.currency,
  customerPhoneMasked: o.customerPhone ? `••••${o.customerPhone.slice(-3)}` : '',
});

// ---------- app ----------
export const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || ALLOWED_ORIGINS.includes(origin)),
  })
);
// Orders are small; pages may contain uploaded images.
app.use('/api/sites', express.json({ limit: '32kb' }));
app.use('/api/orders', express.json({ limit: '32kb' }));
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PageCraft Studio Live Publishing API', timestamp: new Date().toISOString() });
});

// ----- pages -----
app.get('/api/pages', (req, res) => {
  try {
    const data = Object.values(pagesStore.read()).map(({ id, slug, name, theme, publishedAt, updatedAt }) => ({
      id, slug, name, theme, publishedAt, updatedAt,
    }));
    res.json({ success: true, count: data.length, data });
  } catch {
    res.status(500).json({ success: false, error: 'خطأ في الخادم' });
  }
});

app.post('/api/pages', requireWriteAccess, async (req, res) => {
  try {
    const { id, slug, name, pageData, theme } = req.body || {};
    if (!pageData || typeof pageData !== 'object' || Array.isArray(pageData)) {
      return res.status(400).json({ success: false, error: 'بيانات الصفحة مطلوبة' });
    }
    const pageSlug = cleanSlug(slug || id) || 'site-' + crypto.randomBytes(4).toString('hex');
    const safeTheme = ALLOWED_THEMES.has(theme) ? theme : 'editorial';

    const saved = await pagesStore.update((pages) => {
      const existing = pages[pageSlug];
      pages[pageSlug] = {
        id: typeof id === 'string' ? id.slice(0, 100) : pageSlug,
        slug: pageSlug,
        name: String(name || pageData.brandName || 'مشروع منشور').slice(0, 200),
        pageData,
        theme: safeTheme,
        publishedAt: existing?.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { value: pages[pageSlug] };
    });

    res.json({ success: true, slug: pageSlug, liveUrl: `/p/${encodeURIComponent(pageSlug)}`, data: saved });
  } catch {
    res.status(500).json({ success: false, error: 'تعذر حفظ الصفحة' });
  }
});

app.get('/api/pages/:slug', (req, res) => {
  try {
    const page = findPage(pagesStore.read(), req.params.slug);
    if (!page) return res.status(404).json({ success: false, error: 'الصفحة غير موجودة' });
    res.json({ success: true, data: page });
  } catch {
    res.status(500).json({ success: false, error: 'خطأ في الخادم' });
  }
});

app.delete('/api/pages/:slug', requireWriteAccess, async (req, res) => {
  try {
    const target = req.params.slug;
    await pagesStore.update((pages) => {
      if (!has(pages, target)) return { changed: false };
      delete pages[target];
      return {};
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: 'تعذر حذف الصفحة' });
  }
});

// ----- orders: public -----
app.post(
  '/api/sites/:slug/orders',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 10, bucket: 'order-create' }),
  async (req, res) => {
    try {
      const page = findPage(pagesStore.read(), req.params.slug);
      if (!page) return res.status(404).json({ success: false, error: 'المتجر غير منشور' });

      const body = req.body || {};
      const customerName = cleanText(body.customerName, 100);
      const customerPhone = digitsOnly(body.customerPhone).slice(0, 15);
      const address = cleanText(body.address, 300);
      const notes = cleanText(body.notes, 500);
      const paymentMethod = PAYMENT_METHODS.has(body.paymentMethod) ? body.paymentMethod : 'cod';

      if (customerName.length < 2) return res.status(400).json({ success: false, error: 'الاسم مطلوب' });
      if (customerPhone.length < 8) return res.status(400).json({ success: false, error: 'رقم الهاتف غير صحيح' });
      if (address.length < 5) return res.status(400).json({ success: false, error: 'العنوان مطلوب' });

      const sel = body.selection && typeof body.selection === 'object' ? body.selection : {};
      const pricing = computeOrderPricing(page.pageData, {
        bundleIdx: sel.bundleIdx,
        governorateId: typeof sel.governorateId === 'string' ? sel.governorateId : '',
        includeOrderBump: sel.includeOrderBump === true,
        promoCode: typeof sel.promoCode === 'string' ? sel.promoCode.slice(0, 40) : '',
        cart: sel.cart && typeof sel.cart === 'object' && !Array.isArray(sel.cart) ? sel.cart : {},
      });

      const variantOptions = Array.isArray(pricing.easyOrder.variantOptions) ? pricing.easyOrder.variantOptions : [];
      const variantSelections =
        pricing.cartItems.length > 0
          ? pricing.cartItems.map((item) => `${item.name} × ${item.qty}`)
          : (Array.isArray(body.variantSelections) ? body.variantSelections : [])
              .slice(0, Number(pricing.activeBundle.qty) || 1)
              .map((v) => cleanText(v, 120))
              .filter((v) => variantOptions.length === 0 || variantOptions.includes(v));

      const bundleTitle =
        pricing.cartItems.length > 0
          ? `سلة منتجات مخصصة (${pricing.cartCount} قطع)`
          : cleanText(pricing.activeBundle.title, 150);

      const now = new Date().toISOString();
      const order = await ordersStore.update((orders) => {
        const id = newOrderId(orders);
        orders[id] = {
          id,
          siteSlug: page.slug,
          projectName: cleanText(page.pageData?.brandName || page.name, 150),
          customerName,
          customerPhone,
          governorate: cleanText(pricing.activeGov.name, 100),
          address,
          notes,
          paymentMethod,
          bundleTitle,
          variantSelections,
          orderBumpIncluded: pricing.bumpIncluded,
          orderBumpTitle: pricing.bumpIncluded ? cleanText(pricing.easyOrder.orderBump?.title, 150) : '',
          subtotal: pricing.subtotal,
          shippingFee: pricing.shippingFee,
          discountAmount: pricing.discountAmount,
          totalAmount: pricing.total,
          currency: cleanText(page.pageData?.currency || 'ج.م', 10),
          status: 'new',
          createdAt: now,
          updatedAt: now,
        };
        return { value: orders[id] };
      });

      notifyStoreOwner(order, page.pageData); // fire-and-forget; never blocks or fails the order

      res.status(201).json({ success: true, data: { ...publicOrderView(order), customerName, address } });
    } catch {
      res.status(500).json({ success: false, error: 'تعذر تسجيل الطلب' });
    }
  }
);

// Tracking requires BOTH the order id and the phone number used on it.
app.post(
  '/api/orders/track',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 20, bucket: 'order-track' }),
  (req, res) => {
    try {
      const id = String(req.body?.id || '').trim().toUpperCase().replace(/^#/, '');
      const phone = digitsOnly(req.body?.phone);
      const fullId = id.startsWith('ORD-') ? id : `ORD-${id}`;
      const orders = ordersStore.read();
      const order = has(orders, fullId) ? orders[fullId] : null;
      const phoneOk =
        order && phone.length >= 8 && order.customerPhone.length >= 8 &&
        (order.customerPhone === phone || order.customerPhone.slice(-9) === phone.slice(-9));
      if (!phoneOk) return res.status(404).json({ success: false, error: 'لم يتم العثور على طلب مطابق' });
      res.json({ success: true, data: publicOrderView(order) });
    } catch {
      res.status(500).json({ success: false, error: 'خطأ في الخادم' });
    }
  }
);

// ----- orders: admin -----
app.get('/api/orders', requireWriteAccess, (req, res) => {
  try {
    const site = typeof req.query.site === 'string' ? req.query.site : '';
    const data = Object.values(ordersStore.read())
      .filter((o) => !site || o.siteSlug === site)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    res.json({ success: true, count: data.length, data });
  } catch {
    res.status(500).json({ success: false, error: 'خطأ في الخادم' });
  }
});

app.patch('/api/orders/:id', requireWriteAccess, async (req, res) => {
  try {
    const status = req.body?.status;
    if (!ORDER_STATUSES.has(status)) return res.status(400).json({ success: false, error: 'حالة غير صالحة' });
    const updated = await ordersStore.update((orders) => {
      if (!has(orders, req.params.id)) return { changed: false, value: null };
      orders[req.params.id] = { ...orders[req.params.id], status, updatedAt: new Date().toISOString() };
      return { value: orders[req.params.id] };
    });
    if (!updated) return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, error: 'تعذر تحديث الطلب' });
  }
});

app.delete('/api/orders/:id', requireWriteAccess, async (req, res) => {
  try {
    await ordersStore.update((orders) => {
      if (!has(orders, req.params.id)) return { changed: false };
      delete orders[req.params.id];
      return {};
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: 'تعذر حذف الطلب' });
  }
});

// ----- published pages -----
const PUBLISHED_CSP = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  'img-src https: data:',
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
].join('; ');

// Render the published page from stored data. Raw HTML from clients is never served.
app.get('/p/:slug', (req, res) => {
  let page;
  try {
    page = findPage(pagesStore.read(), req.params.slug);
  } catch {
    page = null;
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!page || !page.pageData) {
    return res.status(404).type('html').send(`<!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head><meta charset="UTF-8"><title>الصفحة غير موجودة</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:80px;">
        <h2>عذراً، هذا الموقع غير منشور حالياً</h2>
      </body>
      </html>`);
  }
  res.setHeader('Content-Security-Policy', PUBLISHED_CSP);
  res.type('html').send(buildStandaloneHTML(page.pageData, page.theme));
});

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  app.listen(PORT, HOST, () => {
    console.log(`PageCraft Studio API running at http://${HOST}:${PORT}`);
    if (!ADMIN_TOKEN) console.log('PAGECRAFT_ADMIN_TOKEN not set: admin routes limited to localhost.');
    if (!whatsappNotificationsConfigured()) console.log('WhatsApp order notifications disabled (EVOLUTION_* not set).');
  });
}
