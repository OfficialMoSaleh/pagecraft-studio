import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildStandaloneHTML } from '../src/engine/exportHtml.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
 * Configuration (environment variables)
 *   PORT                 default 3001
 *   HOST                 default 127.0.0.1 (local only). Set 0.0.0.0 only behind a proxy with HTTPS.
 *   PAGECRAFT_ADMIN_TOKEN  required for write/delete from any non-local request.
 *                          If unset, writes are accepted only from the local machine.
 *   ALLOWED_ORIGINS      comma-separated list of origins allowed by CORS (default: none, same-origin only)
 *   PAGECRAFT_DATA_DIR   where pages.json lives (default server/data)
 */
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '127.0.0.1';
const ADMIN_TOKEN = process.env.PAGECRAFT_ADMIN_TOKEN || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const DATA_DIR = process.env.PAGECRAFT_DATA_DIR || path.join(__dirname, 'data');
const PAGES_FILE = path.join(DATA_DIR, 'pages.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const MAX_BACKUPS = 20;

const SLUG_RE = /^[a-z0-9؀-ۿ_-]{1,80}$/;
const ALLOWED_THEMES = new Set(['editorial', 'minimal', 'forest', 'charcoal']);

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

// ---------- storage ----------
fs.mkdirSync(BACKUP_DIR, { recursive: true });
if (!fs.existsSync(PAGES_FILE)) fs.writeFileSync(PAGES_FILE, '{}', 'utf-8');

const readPages = () => {
  const raw = fs.readFileSync(PAGES_FILE, 'utf-8') || '{}';
  // Let a corrupt file throw instead of silently returning {} and then overwriting all data.
  return JSON.parse(raw);
};

function backupCurrentFile() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(PAGES_FILE, path.join(BACKUP_DIR, `pages-${stamp}.json`));
  const backups = fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith('pages-')).sort();
  for (const old of backups.slice(0, Math.max(0, backups.length - MAX_BACKUPS))) {
    fs.unlinkSync(path.join(BACKUP_DIR, old));
  }
}

const writePages = (pages) => {
  backupCurrentFile();
  const tmp = `${PAGES_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(pages, null, 2), 'utf-8');
  fs.renameSync(tmp, PAGES_FILE); // atomic replace on the same filesystem
};

// Serialize writes so two concurrent requests can't clobber each other.
let writeQueue = Promise.resolve();
const withWriteLock = (fn) => {
  const run = writeQueue.then(fn, fn);
  writeQueue = run.catch(() => {});
  return run;
};

const findPage = (pages, target) =>
  (Object.prototype.hasOwnProperty.call(pages, target) && pages[target]) ||
  Object.values(pages).find((p) => p.id === target || p.slug === target);

// ---------- app ----------
export const app = express();
app.disable('x-powered-by');
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || ALLOWED_ORIGINS.includes(origin)),
  })
);
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PageCraft Studio Live Publishing API', timestamp: new Date().toISOString() });
});

// List published projects (summary only)
app.get('/api/pages', (req, res) => {
  try {
    const pages = readPages();
    const data = Object.values(pages).map(({ id, slug, name, theme, publishedAt, updatedAt }) => ({
      id, slug, name, theme, publishedAt, updatedAt,
    }));
    res.json({ success: true, count: data.length, data });
  } catch {
    res.status(500).json({ success: false, error: 'خطأ في الخادم' });
  }
});

// Save or publish a project
app.post('/api/pages', requireWriteAccess, async (req, res) => {
  try {
    const { id, slug, name, pageData, theme } = req.body || {};
    if (!pageData || typeof pageData !== 'object' || Array.isArray(pageData)) {
      return res.status(400).json({ success: false, error: 'بيانات الصفحة مطلوبة' });
    }
    const pageSlug = cleanSlug(slug || id) || 'site-' + crypto.randomBytes(4).toString('hex');
    const safeTheme = ALLOWED_THEMES.has(theme) ? theme : 'editorial';

    const saved = await withWriteLock(() => {
      const pages = readPages();
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
      writePages(pages);
      return pages[pageSlug];
    });

    res.json({ success: true, slug: pageSlug, liveUrl: `/p/${encodeURIComponent(pageSlug)}`, data: saved });
  } catch {
    res.status(500).json({ success: false, error: 'تعذر حفظ الصفحة' });
  }
});

// Retrieve a published project
app.get('/api/pages/:slug', (req, res) => {
  try {
    const page = findPage(readPages(), req.params.slug);
    if (!page) return res.status(404).json({ success: false, error: 'الصفحة غير موجودة' });
    res.json({ success: true, data: page });
  } catch {
    res.status(500).json({ success: false, error: 'خطأ في الخادم' });
  }
});

// Delete a published project
app.delete('/api/pages/:slug', requireWriteAccess, async (req, res) => {
  try {
    const target = req.params.slug;
    await withWriteLock(() => {
      const pages = readPages();
      if (Object.prototype.hasOwnProperty.call(pages, target)) {
        delete pages[target];
        writePages(pages);
      }
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: 'تعذر حذف الصفحة' });
  }
});

const PUBLISHED_CSP = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
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
    page = findPage(readPages(), req.params.slug);
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
    if (!ADMIN_TOKEN) console.log('PAGECRAFT_ADMIN_TOKEN not set: write access limited to localhost.');
  });
}
