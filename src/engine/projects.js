import {
  generatePageData,
  DEFAULT_SECTION_ORDER,
  DEFAULT_LAYOUTS,
  DEFAULT_SECTIONS,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_CUSTOM_COLORS,
  buildDefaultEasyOrderConfig,
} from './templates';
import { buildStandaloneHTML } from '../components/CodeExportModal';

const STORAGE_KEY = 'pagecraft_projects_v1';
const ACTIVE_PROJECT_KEY = 'pagecraft_active_project_id';

const ARABIC_TO_LATIN_MAP = {
  أثر: 'athar-perfumes',
  أَثَر: 'athar-perfumes',
  قاف: 'qaf-roastery',
  نسيج: 'naseej-linen',
  نَسِيج: 'naseej-linen',
  طارق: 'dr-tarek-clinic',
  مدار: 'madar-studio',
  مَدَار: 'madar-studio',
  سكون: 'sukoon-brand',
};

export function sanitizeSlug(raw) {
  if (!raw || typeof raw !== 'string') return 'site-' + Math.random().toString(36).substring(2, 7);
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || 'site-' + Math.random().toString(36).substring(2, 7);
}

export function suggestSlugFromBrand(brandName, fallbackIndex = 1) {
  if (!brandName) return `project-${fallbackIndex}`;
  for (const [arKey, latinSlug] of Object.entries(ARABIC_TO_LATIN_MAP)) {
    if (brandName.includes(arKey)) {
      return latinSlug;
    }
  }
  const hasEnglish = /[a-zA-Z0-9]/.test(brandName);
  if (hasEnglish) {
    return sanitizeSlug(brandName);
  }
  return sanitizeSlug(brandName) || `project-${fallbackIndex}`;
}

export function normalizePageData(pageData) {
  if (!pageData) return generatePageData('دار عطور محلية باسم "أثر"', 'editorial');
  const fallbackBasePrice = Number(pageData.products?.[0]?.price) || 340;
  const defaultEasy = buildDefaultEasyOrderConfig('perfume', fallbackBasePrice);
  return {
    ...pageData,
    sectionOrder:
      Array.isArray(pageData.sectionOrder) && pageData.sectionOrder.length > 0
        ? pageData.sectionOrder
        : [...DEFAULT_SECTION_ORDER],
    layouts: { ...DEFAULT_LAYOUTS, ...(pageData.layouts || {}) },
    sections: { ...DEFAULT_SECTIONS, ...(pageData.sections || {}) },
    typography: { ...DEFAULT_TYPOGRAPHY, ...(pageData.typography || {}) },
    customColors: { ...DEFAULT_CUSTOM_COLORS, ...(pageData.customColors || {}) },
    easyOrder: {
      ...defaultEasy,
      ...(pageData.easyOrder || {}),
      orderBump: { ...defaultEasy.orderBump, ...(pageData.easyOrder?.orderBump || {}) },
      shippingRates:
        Array.isArray(pageData.easyOrder?.shippingRates) && pageData.easyOrder.shippingRates.length > 0
          ? pageData.easyOrder.shippingRates
          : defaultEasy.shippingRates,
      bundleOffers:
        Array.isArray(pageData.easyOrder?.bundleOffers) && pageData.easyOrder.bundleOffers.length > 0
          ? pageData.easyOrder.bundleOffers
          : defaultEasy.bundleOffers,
    },
  };
}

export function createInitialProjects() {
  const now = new Date().toISOString();

  // Check if user had single-project v4 data saved previously
  let primaryData = null;
  try {
    const legacy = localStorage.getItem('pagecraft_v4_data');
    if (legacy) {
      primaryData = normalizePageData(JSON.parse(legacy));
    }
  } catch {
    // ignore
  }

  if (!primaryData) {
    primaryData = generatePageData(
      'دار عطور محلية باسم "أثر" تعتمد على الزيوت الطبيعية الخالصة وتعتيق الأخشاب العطرية يدوياً بأسعار تبدأ من 340 ج.م',
      'editorial'
    );
  }

  const coffeeData = generatePageData(
    'محمصة قهوة مختصة باسم "قاف" تقدم محاصيل إثيوبية وكولومبية محمصة يومياً واشتراكات شهرية تبدأ من 290 ج.م',
    'forest'
  );

  const fashionData = generatePageData(
    'براند أزياء وملابس كتان طبيعي باسم "نسيج" بتصميمات مريحة وعصرية وشحن مجاني للطلبات فوق 900 ج.م',
    'minimal'
  );

  const firstProject = {
    id: 'proj_athar_1',
    name: primaryData.brandName || 'أَثَر للعطور',
    slug: suggestSlugFromBrand(primaryData.brandName, 1),
    prompt:
      'دار عطور محلية باسم "أثر" تعتمد على الزيوت الطبيعية الخالصة وتعتيق الأخشاب العطرية يدوياً بأسعار تبدأ من 340 ج.م',
    theme: primaryData.theme || 'editorial',
    pageData: primaryData,
    isPublished: true,
    publishedAt: now,
    updatedAt: now,
    publishedSnapshot: {
      pageData: primaryData,
      theme: primaryData.theme || 'editorial',
      publishedAt: now,
    },
  };

  const secondProject = {
    id: 'proj_qaf_2',
    name: coffeeData.brandName || 'مَحمصة قَاف',
    slug: 'qaf-roastery',
    prompt:
      'محمصة قهوة مختصة باسم "قاف" تقدم محاصيل إثيوبية وكولومبية محمصة يومياً واشتراكات شهرية تبدأ من 290 ج.م',
    theme: 'forest',
    pageData: coffeeData,
    isPublished: true,
    publishedAt: now,
    updatedAt: now,
    publishedSnapshot: {
      pageData: coffeeData,
      theme: 'forest',
      publishedAt: now,
    },
  };

  const thirdProject = {
    id: 'proj_naseej_3',
    name: fashionData.brandName || 'نَسِيج للكتان',
    slug: 'naseej-linen',
    prompt:
      'براند أزياء وملابس كتان طبيعي باسم "نسيج" بتصميمات مريحة وعصرية وشحن مجاني للطلبات فوق 900 ج.م',
    theme: 'minimal',
    pageData: fashionData,
    isPublished: false,
    publishedAt: null,
    updatedAt: now,
    publishedSnapshot: null,
  };

  return [firstProject, secondProject, thirdProject];
}

export function loadProjectsWorkspace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((proj) => ({
          ...proj,
          pageData: normalizePageData(proj.pageData),
        }));
      }
    }
  } catch {
    // ignore
  }
  const initial = createInitialProjects();
  saveProjectsWorkspace(initial);
  return initial;
}

export function saveProjectsWorkspace(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // ignore quota errors
  }
}

export function getSavedActiveProjectId(projects) {
  try {
    const savedId = localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (savedId && projects.some((p) => p.id === savedId)) {
      return savedId;
    }
  } catch {
    // ignore
  }
  return projects[0]?.id || null;
}

export function saveActiveProjectId(id) {
  try {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } catch {
    // ignore
  }
}

export function buildNewProject({ name, prompt, theme = 'editorial', existingSlugs = [] }) {
  const finalPrompt =
    prompt?.trim() ||
    `مشروع ${name || 'جديد'} يقدم منتجات وخدمات عالية الجودة بأسعار تنافسية`;
  const pageData = generatePageData(finalPrompt, theme);
  if (name && name.trim()) {
    pageData.brandName = name.trim();
  }

  let baseSlug = suggestSlugFromBrand(pageData.brandName, existingSlugs.length + 1);
  if (existingSlugs.includes(baseSlug)) {
    baseSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 5)}`;
  }

  const now = new Date().toISOString();
  return {
    id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: pageData.brandName || 'مشروع جديد',
    slug: baseSlug,
    prompt: finalPrompt,
    theme: pageData.theme || theme,
    pageData,
    isPublished: false,
    publishedAt: null,
    updatedAt: now,
    publishedSnapshot: null,
  };
}

export function cloneProject(sourceProject, existingSlugs = []) {
  const now = new Date().toISOString();
  const clonedPageData = JSON.parse(JSON.stringify(sourceProject.pageData));
  const newName = `${sourceProject.name || clonedPageData.brandName} (نسخة)`;
  clonedPageData.brandName = newName;

  let newSlug = `${sourceProject.slug || 'site'}-copy`;
  if (existingSlugs.includes(newSlug)) {
    newSlug = `${newSlug}-${Math.random().toString(36).substring(2, 5)}`;
  }

  return {
    id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: newName,
    slug: newSlug,
    prompt: sourceProject.prompt || '',
    theme: sourceProject.theme || 'editorial',
    pageData: clonedPageData,
    isPublished: false,
    publishedAt: null,
    updatedAt: now,
    publishedSnapshot: null,
  };
}

export const PUBLIC_GITHUB_PAGES_URL = 'https://officialmosaleh.github.io/pagecraft-studio/';

/**
 * Delta-based UTF-8 Base64URL encoder for serverless shareable links (?s=...)
 * Compares project.pageData against the deterministic template for (prompt, theme)
 * and encodes only the modified fields so the URL stays compact and fast.
 */
export function encodeShareableToken(project) {
  if (!project || !project.pageData) return '';
  const prompt = project.prompt || project.pageData.headline || 'مشروع جديد';
  const theme = project.theme || 'editorial';
  const baseData = generatePageData(prompt, theme);
  const currentData = project.pageData;

  const diff = {};
  for (const key of Object.keys(currentData)) {
    // Skip huge base64 data URLs in URL query string to keep link shareable
    if (key === 'heroImage' && typeof currentData[key] === 'string' && currentData[key].startsWith('data:')) {
      continue;
    }
    if (JSON.stringify(currentData[key]) !== JSON.stringify(baseData[key])) {
      diff[key] = currentData[key];
    }
  }

  const compactPayload = {
    n: project.name || currentData.brandName,
    s: project.slug || 'site',
    p: prompt,
    t: theme,
    d: diff,
  };

  const jsonStr = JSON.stringify(compactPayload);
  const bytes = new TextEncoder().encode(jsonStr);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeShareableToken(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    let base64 = token.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(jsonStr);

    const prompt = parsed.p || 'مشروع جديد';
    const theme = parsed.t || 'editorial';
    const baseData = generatePageData(prompt, theme);
    const mergedPageData = normalizePageData({
      ...baseData,
      ...(parsed.d || {}),
    });

    return {
      id: 'shared_' + (parsed.s || 'site'),
      slug: parsed.s || 'shared-site',
      name: parsed.n || mergedPageData.brandName || 'موقع مشترك',
      prompt,
      theme,
      pageData: mergedPageData,
      isPublished: true,
      isServerlessShare: true,
    };
  } catch {
    return null;
  }
}

export function getShareableCloudUrl(project, forcePublicDomain = true) {
  const token = encodeShareableToken(project);
  if (
    forcePublicDomain ||
    typeof window === 'undefined' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return `${PUBLIC_GITHUB_PAGES_URL}?s=${token}`;
  }
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}?s=${token}`;
}

export function getLiveShareUrl(slug) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  return `${origin}/p/${encodeURIComponent(slug)}`;
}

export async function publishProjectToServer(project) {
  const now = new Date().toISOString();
  const cleanSlug = sanitizeSlug(project.slug || project.name);
  const standaloneHtml = buildStandaloneHTML(project.pageData, project.theme);

  const updatedProject = {
    ...project,
    slug: cleanSlug,
    isPublished: true,
    publishedAt: now,
    updatedAt: now,
    publishedSnapshot: {
      pageData: JSON.parse(JSON.stringify(project.pageData)),
      theme: project.theme,
      publishedAt: now,
    },
  };

  // Attempt to sync with Express API server if running
  let serverSynced = false;
  try {
    const res = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: updatedProject.id,
        slug: cleanSlug,
        name: updatedProject.name,
        theme: updatedProject.theme,
        pageData: updatedProject.pageData,
        html: standaloneHtml,
        publishedAt: now,
      }),
    });
    if (res.ok) {
      serverSynced = true;
    }
  } catch {
    // Express backend is optional when running pure Vite frontend; local storage router handles /p/:slug seamlessly
  }

  return {
    project: updatedProject,
    liveUrl: getLiveShareUrl(cleanSlug),
    serverSynced,
  };
}

export async function resolvePublishedSite(slug) {
  const decodedSlug = decodeURIComponent(slug || '').trim();
  if (!decodedSlug) return null;

  // 1. Check local projects workspace first
  const localProjects = loadProjectsWorkspace();
  const foundLocal = localProjects.find(
    (p) => p.slug === decodedSlug || p.id === decodedSlug
  );
  if (foundLocal) {
    if (foundLocal.isPublished && foundLocal.publishedSnapshot) {
      return {
        id: foundLocal.id,
        slug: foundLocal.slug,
        name: foundLocal.name,
        theme: foundLocal.publishedSnapshot.theme || foundLocal.theme,
        pageData: normalizePageData(foundLocal.publishedSnapshot.pageData),
        publishedAt: foundLocal.publishedSnapshot.publishedAt || foundLocal.publishedAt,
        isPublished: true,
      };
    }
    // Even if draft locally, allow previewing if accessed by owner
    return {
      id: foundLocal.id,
      slug: foundLocal.slug,
      name: foundLocal.name,
      theme: foundLocal.theme,
      pageData: normalizePageData(foundLocal.pageData),
      publishedAt: foundLocal.updatedAt,
      isPublished: foundLocal.isPublished,
    };
  }

  // 2. Fallback to Express Backend API (/api/pages/:slug)
  try {
    const res = await fetch(`/api/pages/${encodeURIComponent(decodedSlug)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          id: json.data.id,
          slug: json.data.slug || decodedSlug,
          name: json.data.name || json.data.pageData?.brandName,
          theme: json.data.theme || 'editorial',
          pageData: normalizePageData(json.data.pageData),
          publishedAt: json.data.publishedAt || json.data.updatedAt,
          isPublished: true,
        };
      }
    }
  } catch {
    // ignore network error
  }

  return null;
}

const ORDERS_STORAGE_KEY = 'pagecraft_orders_v1';

export function createSampleOrders() {
  return [
    {
      id: 'ORD-1041',
      projectName: 'أَثَر للعطور',
      customerName: 'أحمد محمود الشافعي',
      customerPhone: '01012345678',
      governorate: 'القاهرة والجيزة',
      address: 'مدينة نصر، شارع عباس العقاد، عمارة 14، الدور الثالث',
      bundleTitle: 'عرض قطعتين (الأكثر طلباً)',
      variantSelections: [
        'عطر سَمَر — أخشاب الصندل والعنبر (50 مل)',
        'عطر أَثَر — عود ملكي معتق (50 مل)',
      ],
      orderBumpIncluded: true,
      orderBumpTitle: 'إضافة صندوق إهداء خشبي فاخر + عينات تجريبية',
      shippingFee: 0,
      discountAmount: 0,
      totalAmount: 650,
      currency: 'ج.م',
      status: 'confirmed',
      createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    },
    {
      id: 'ORD-1042',
      projectName: 'مَحمصة قَاف',
      customerName: 'سارة عبد الرحمن',
      customerPhone: '01123456789',
      governorate: 'الإسكندرية',
      address: 'سموحة، شارع فوزي معاذ، برج السرايا',
      bundleTitle: 'عرض قطعة واحدة (التجربة الأساسية)',
      variantSelections: ['إثيوبي ييرغاشيف — مطحون تقطير (V60 / Chemex)'],
      orderBumpIncluded: false,
      orderBumpTitle: '',
      shippingFee: 60,
      discountAmount: 0,
      totalAmount: 350,
      currency: 'ج.م',
      status: 'new',
      createdAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    },
  ];
}

export function loadOrdersInbox() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  const initial = createSampleOrders();
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(initial));
  } catch {
    // ignore
  }
  return initial;
}

export function saveOrdersInbox(orders) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

export function addOrderToInbox(orderPayload) {
  const current = loadOrdersInbox();
  const nextOrder = {
    id: 'ORD-' + Math.floor(1050 + Math.random() * 8900),
    status: 'new',
    createdAt: new Date().toISOString(),
    ...orderPayload,
  };
  const updated = [nextOrder, ...current];
  saveOrdersInbox(updated);
  return { order: nextOrder, allOrders: updated, list: updated };
}

export function buildOrdersCsvContent(orders) {
  const headers = [
    'رقم الطلب',
    'التاريخ',
    'المشروع',
    'اسم العميل',
    'رقم الهاتف',
    'المحافظة',
    'العنوان بالتفصيل',
    'العرض المختار',
    'المواصفات / القطع',
    'إضافة العرض الخاص',
    'مصاريف الشحن',
    'الإجمالي (COD)',
    'الحالة',
  ];

  const statusAr = {
    new: 'طلب جديد',
    confirmed: 'تم التأكيد هاتفياً',
    shipped: 'جاري الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
  };

  const rows = orders.map((o) => [
    o.id,
    new Date(o.createdAt).toLocaleString('ar-EG'),
    o.projectName || '',
    o.customerName || '',
    o.customerPhone || '',
    o.governorate || '',
    o.address || '',
    o.bundleTitle || '',
    (o.variantSelections || []).join(' + '),
    o.orderBumpIncluded ? 'نعم' : 'لا',
    `${o.shippingFee || 0} ${o.currency || 'ج.م'}`,
    `${o.totalAmount || 0} ${o.currency || 'ج.م'}`,
    statusAr[o.status] || o.status,
  ]);

  const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const csvLines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((r) => r.map(escapeCsv).join(',')),
  ];

  // Prepend UTF-8 BOM so Microsoft Excel opens Arabic text cleanly
  return '\uFEFF' + csvLines.join('\r\n');
}


