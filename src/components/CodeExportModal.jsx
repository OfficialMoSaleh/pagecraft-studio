import React, { useState } from 'react';
import {
  DESIGN_THEMES,
  DEFAULT_SECTION_ORDER,
  DEFAULT_LAYOUTS,
  DEFAULT_TYPOGRAPHY,
  ARABIC_FONTS,
  DEFAULT_CUSTOM_COLORS,
} from '../engine/templates';

export function buildStandaloneHTML(pageData, activeThemeKey) {
  const theme = DESIGN_THEMES[activeThemeKey] || DESIGN_THEMES.editorial;
  const typo = { ...DEFAULT_TYPOGRAPHY, ...(pageData.typography || {}) };
  const customColors = { ...DEFAULT_CUSTOM_COLORS, ...(pageData.customColors || {}) };
  const fontObj = ARABIC_FONTS.find((f) => f.id === typo.fontFamily);
  const activeFontCss = fontObj ? fontObj.css : theme.fontFamily;
  const currency = pageData.currency || 'ج.م';
  const waPhone = pageData.whatsappPhone || '201000000000';
  const sections = {
    announcement: true,
    hero: true,
    heroImage: true,
    stats: true,
    catalog: true,
    features: true,
    process: true,
    pricing: true,
    testimonial: true,
    faq: true,
    orderForm: true,
    ...(pageData.sections || {}),
  };

  const sectionOrder =
    Array.isArray(pageData.sectionOrder) && pageData.sectionOrder.length > 0
      ? pageData.sectionOrder
      : DEFAULT_SECTION_ORDER;

  const layouts = { ...DEFAULT_LAYOUTS, ...(pageData.layouts || {}) };

  const exportBuilders = {
    hero: () => {
      if (sections.hero === false) return '';
      if (layouts.hero === 'split') {
        return `
    <section class="px-6 md:px-12 py-14 border-b ${theme.borderClass} grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
      <div class="md:col-span-7 space-y-5">
        <span class="text-xs pb-1 inline-block font-medium ${theme.tagClass}">${pageData.category}</span>
        <h1 class="text-2xl md:text-4xl font-bold leading-snug ${theme.textMain}">${pageData.headline}</h1>
        <p class="text-sm md:text-base leading-relaxed ${theme.textMuted}">${pageData.subheadline}</p>
        <div class="flex flex-wrap items-center gap-3 pt-2">
          <a href="#catalog" class="px-6 py-3 rounded text-xs md:text-sm font-semibold ${theme.accentBtn}">${pageData.primaryCta}</a>
          <a href="#pricing" class="px-5 py-3 rounded text-xs md:text-sm font-medium ${theme.secondaryBtn}">${pageData.secondaryCta}</a>
        </div>
      </div>
      ${sections.heroImage && pageData.heroImage ? `
      <div class="md:col-span-5">
        <img src="${pageData.heroImage}" alt="${pageData.brandName}" class="w-full h-72 md:h-96 object-cover rounded border ${theme.borderClass}">
      </div>` : ''}
    </section>`;
      }
      if (layouts.hero === 'centered') {
        return `
    <section class="px-6 md:px-12 pt-14 pb-12 border-b ${theme.borderClass} text-center max-w-4xl mx-auto">
      <span class="text-xs px-3 py-1 rounded inline-block font-medium mb-4 ${theme.badgeBg}">${pageData.category}</span>
      <h1 class="text-2xl md:text-5xl font-bold leading-snug mb-5 ${theme.textMain}">${pageData.headline}</h1>
      <p class="text-sm md:text-base leading-relaxed mb-8 max-w-2xl mx-auto ${theme.textMuted}">${pageData.subheadline}</p>
      <div class="flex flex-wrap items-center justify-center gap-3 mb-10">
        <a href="#catalog" class="px-6 py-3 rounded text-xs md:text-sm font-semibold ${theme.accentBtn}">${pageData.primaryCta}</a>
        <a href="#pricing" class="px-5 py-3 rounded text-xs md:text-sm font-medium ${theme.secondaryBtn}">${pageData.secondaryCta}</a>
      </div>
      ${sections.heroImage && pageData.heroImage ? `
      <img src="${pageData.heroImage}" alt="${pageData.brandName}" class="w-full h-64 md:h-96 object-cover rounded-lg border ${theme.borderClass}">` : ''}
    </section>`;
      }
      return `
    <section class="border-b ${theme.borderClass}">
      <div class="px-6 md:px-12 pt-12 pb-10 max-w-3xl">
        <div class="mb-4"><span class="text-xs pb-1 inline-block font-medium ${theme.tagClass}">${pageData.category}</span></div>
        <h1 class="text-2xl md:text-4xl font-bold leading-snug mb-5 ${theme.textMain}">${pageData.headline}</h1>
        <p class="text-sm md:text-base leading-relaxed mb-8 max-w-2xl ${theme.textMuted}">${pageData.subheadline}</p>
        <div class="flex flex-wrap items-center gap-3">
          <a href="#catalog" class="px-6 py-3 rounded text-xs md:text-sm font-semibold ${theme.accentBtn}">${pageData.primaryCta}</a>
          <a href="#pricing" class="px-5 py-3 rounded text-xs md:text-sm font-medium ${theme.secondaryBtn}">${pageData.secondaryCta}</a>
        </div>
      </div>
      ${sections.heroImage && pageData.heroImage ? `
      <div class="px-6 md:px-12 pb-12">
        <img src="${pageData.heroImage}" alt="${pageData.brandName}" class="w-full h-64 md:h-[420px] object-cover rounded border ${theme.borderClass}">
      </div>` : ''}
    </section>`;
    },

    stats: () => {
      if (!sections.stats || !pageData.stats) return '';
      return `
    <section class="px-6 md:px-12 py-8 border-b ${theme.borderClass} ${layouts.stats === 'strip' ? theme.surfaceClass : ''}">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        ${pageData.stats.map(st => `
        <div class="${layouts.stats === 'cards' ? `p-5 rounded ${theme.cardClass} text-center` : ''}">
          <div class="text-xl md:text-2xl font-bold ${theme.textMain}">${st.value}</div>
          <div class="text-xs ${theme.textMuted}">${st.label}</div>
        </div>`).join('')}
      </div>
    </section>`;
    },

    catalog: () => {
      if (!sections.catalog || !pageData.products) return '';
      if (layouts.catalog === 'list') {
        return `
    <section id="catalog" class="px-6 md:px-12 py-14 border-b ${theme.borderClass}">
      <h2 class="text-xl md:text-2xl font-bold ${theme.textMain} mb-2">${pageData.catalogTitle || 'المعروضات'}</h2>
      <p class="text-xs md:text-sm ${theme.textMuted} mb-8">${pageData.catalogSubtitle || ''}</p>
      <div class="space-y-4">
        ${pageData.products.map(p => `
        <div class="p-4 md:p-5 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 ${theme.cardClass}">
          <div class="flex items-center gap-4">
            <img src="${p.image}" alt="${p.name}" class="w-20 h-20 rounded object-cover shrink-0">
            <div>
              <h3 class="text-sm font-bold ${theme.textMain} mb-1">${p.name}</h3>
              <p class="text-xs ${theme.textMuted}">${p.desc}</p>
            </div>
          </div>
          <div class="flex items-center gap-4 shrink-0">
            <span class="text-base font-bold ${theme.textMain}">${p.price} ${currency}</span>
            <a href="#order" class="text-xs px-4 py-2 rounded font-semibold ${theme.accentBtn}">اطلب الآن</a>
          </div>
        </div>`).join('')}
      </div>
    </section>`;
      }
      return `
    <section id="catalog" class="px-6 md:px-12 py-14 border-b ${theme.borderClass}">
      <h2 class="text-xl md:text-2xl font-bold ${theme.textMain} mb-2">${pageData.catalogTitle || 'المعروضات'}</h2>
      <p class="text-xs md:text-sm ${theme.textMuted} mb-8">${pageData.catalogSubtitle || ''}</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${pageData.products.map(p => `
        <div class="rounded overflow-hidden flex flex-col justify-between ${theme.cardClass}">
          <div>
            <div class="h-52 overflow-hidden bg-zinc-100">
              <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover">
            </div>
            <div class="p-5">
              <h3 class="text-sm font-bold ${theme.textMain} mb-2">${p.name}</h3>
              <p class="text-xs leading-relaxed ${theme.textMuted}">${p.desc}</p>
            </div>
          </div>
          <div class="px-5 py-4 border-t ${theme.borderClass} flex items-center justify-between">
            <span class="text-base font-bold ${theme.textMain}">${p.price} ${currency}</span>
            <a href="#order" class="text-xs px-4 py-2 rounded font-semibold ${theme.accentBtn}">اطلب الآن</a>
          </div>
        </div>`).join('')}
      </div>
    </section>`;
    },

    features: () => {
      if (!sections.features || !pageData.features) return '';
      if (layouts.features === 'rows') {
        return `
    <section class="px-6 md:px-12 py-14 border-b ${theme.borderClass}">
      <h2 class="text-lg md:text-xl font-bold ${theme.textMain} mb-6">معايير الجودة والعمل</h2>
      <div class="divide-y ${theme.borderClass} border-y ${theme.borderClass}">
        ${pageData.features.map((f, i) => `
        <div class="py-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
          <div class="md:col-span-4 flex items-baseline gap-3">
            <span class="text-xs font-mono ${theme.textMuted}">${f.num || `0${i + 1}`}</span>
            <h3 class="text-sm font-bold ${theme.textMain}">${f.title}</h3>
          </div>
          <p class="md:col-span-8 text-xs md:text-sm leading-relaxed ${theme.textMuted}">${f.desc}</p>
        </div>`).join('')}
      </div>
    </section>`;
      }
      return `
    <section class="px-6 md:px-12 py-14 border-b ${theme.borderClass}">
      <h2 class="text-lg md:text-xl font-bold ${theme.textMain} mb-8">معايير الجودة والعمل</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${pageData.features.map((f, i) => `
        <div class="${layouts.features === 'cards' ? `p-6 rounded ${theme.cardClass}` : ''} space-y-2">
          <span class="text-xs font-mono block ${theme.textMuted}">${f.num || `0${i + 1}`}</span>
          <h3 class="text-sm font-bold ${theme.textMain}">${f.title}</h3>
          <p class="text-xs leading-relaxed ${theme.textMuted}">${f.desc}</p>
        </div>`).join('')}
      </div>
    </section>`;
    },

    process: () => {
      if (!sections.process || !pageData.processSteps) return '';
      return `
    <section class="px-6 md:px-12 py-14 border-b ${theme.borderClass} ${theme.surfaceClass}">
      <h2 class="text-lg md:text-xl font-bold ${theme.textMain} mb-8">خطوات الطلب والاستلام</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${pageData.processSteps.map((st, i) => `
        <div class="p-5 rounded ${theme.cardClass} space-y-2">
          <span class="text-xs font-mono px-2 py-0.5 rounded inline-block ${theme.badgeBg}">خطوة ${st.step || `0${i + 1}`}</span>
          <h3 class="text-sm font-bold ${theme.textMain}">${st.title}</h3>
          <p class="text-xs leading-relaxed ${theme.textMuted}">${st.desc}</p>
        </div>`).join('')}
      </div>
    </section>`;
    },

    pricing: () => {
      if (!sections.pricing || !pageData.pricingTiers) return '';
      return `
    <section id="pricing" class="px-6 md:px-12 py-14 border-b ${theme.borderClass}">
      <h2 class="text-xl md:text-2xl font-bold ${theme.textMain} mb-8">الباقات والأسعار</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${pageData.pricingTiers.map(t => `
        <div class="p-6 rounded flex flex-col justify-between ${theme.cardClass}">
          <div>
            <h3 class="text-sm font-bold ${theme.textMain} mb-1">${t.name}</h3>
            <p class="text-xs ${theme.textMuted} mb-4">${t.subtitle}</p>
            <div class="text-2xl font-bold ${theme.textMain} mb-4 pb-4 border-b ${theme.borderClass}">${t.price}</div>
            <ul class="space-y-2 mb-6 text-xs ${theme.textMuted}">
              ${(t.features || []).map(f => `<li>— ${f}</li>`).join('')}
            </ul>
          </div>
          <a href="#order" class="w-full py-2.5 rounded text-xs font-semibold text-center ${theme.accentBtn}">اختيار الباقة</a>
        </div>`).join('')}
      </div>
    </section>`;
    },

    testimonial: () => {
      if (!sections.testimonial || !pageData.testimonials || pageData.testimonials.length === 0) return '';
      return `
    <section class="px-6 md:px-12 py-14 border-b ${theme.borderClass}">
      <h2 class="text-lg md:text-xl font-bold ${theme.textMain} mb-6">تجارب وآراء العملاء</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${pageData.testimonials.map(item => `
        <blockquote class="p-6 rounded ${theme.cardClass} space-y-3">
          <p class="text-xs md:text-sm leading-relaxed ${theme.textMain}">«${item.quote}»</p>
          <footer class="text-xs ${theme.textMuted}"><strong>${item.author}</strong>${item.role ? ` — ${item.role}` : ''}</footer>
        </blockquote>`).join('')}
      </div>
    </section>`;
    },

    faq: () => {
      if (!sections.faq || !pageData.faqs) return '';
      return `
    <section class="px-6 md:px-12 py-14 border-b ${theme.borderClass}">
      <h2 class="text-lg md:text-xl font-bold ${theme.textMain} mb-6">أسئلة وإجابات تفصيلية</h2>
      <div class="divide-y ${theme.borderClass} border-y ${theme.borderClass}">
        ${pageData.faqs.map(faq => `
        <div class="py-4">
          <h3 class="text-sm font-bold ${theme.textMain}">${faq.q}</h3>
          <p class="mt-2 text-xs leading-relaxed ${theme.textMuted}">${faq.a}</p>
        </div>`).join('')}
      </div>
    </section>`;
    },

    orderForm: () => {
      if (!sections.orderForm) return '';
      return `
    <section id="order" class="px-6 md:px-12 py-14 ${theme.surfaceClass}">
      <div class="max-w-xl mx-auto p-6 md:p-8 rounded ${theme.cardClass} space-y-4">
        <h2 class="text-lg font-bold ${theme.textMain}">تأكيد الطلب عبر واتساب</h2>
        <input id="custName" type="text" placeholder="الاسم الكامل" class="w-full px-3 py-2 rounded text-xs border ${theme.borderClass} bg-transparent ${theme.textMain}">
        <input id="custNotes" type="text" placeholder="المنتج المطلوب والعنوان" class="w-full px-3 py-2 rounded text-xs border ${theme.borderClass} bg-transparent ${theme.textMain}">
        <button onclick="sendWhatsApp()" class="w-full py-3 rounded text-xs font-bold ${theme.accentBtn} cursor-pointer">إرسال الطلب عبر واتساب</button>
      </div>
    </section>`;
    },
  };

  const orderedSectionsHtml = sectionOrder
    .map((secKey) => (exportBuilders[secKey] ? exportBuilders[secKey]() : ''))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageData.brandName || 'صفحة المشروع'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Readex+Pro:wght@400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
  <style>
    * { font-family: ${activeFontCss}; scroll-behavior: smooth; }
    main h1 { font-size: ${typo.heroSize}px !important; line-height: 1.32 !important; }
    main h2 { font-size: ${typo.sectionSize}px !important; line-height: 1.38 !important; }
    main h3 { font-size: ${typo.cardTitleSize}px !important; line-height: 1.42 !important; }
    main p, main li { font-size: ${typo.bodySize}px !important; line-height: 1.65 !important; }
    @media (max-width: 767px) {
      main h1 { font-size: ${Math.max(20, Math.round(typo.heroSize * 0.72))}px !important; }
      main h2 { font-size: ${Math.max(17, Math.round(typo.sectionSize * 0.84))}px !important; }
    }
    ${customColors.enabled ? `
    body, header { background-color: ${customColors.background} !important; color: ${customColors.text} !important; }
    main h1, main h2, main h3, strong { color: ${customColors.text} !important; }
    ` : ''}
  </style>
</head>
<body class="${theme.bgClass} min-h-screen flex flex-col">

  ${sections.announcement && pageData.announcement ? `
  <div class="px-4 py-2.5 text-center text-xs border-b ${theme.borderClass} ${theme.surfaceClass}">
    <span class="${theme.textMain} font-medium">${pageData.announcement}</span>
  </div>` : ''}

  <header class="border-b ${theme.borderClass} px-6 md:px-12 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
    <span class="font-bold text-base md:text-lg ${theme.textMain}">${pageData.brandName || 'اسم المشروع'}</span>
    <a href="#order" class="text-xs px-4 py-2 rounded font-semibold ${theme.accentBtn}">اطلب الآن</a>
  </header>

  <main class="max-w-6xl mx-auto w-full flex-1">
${orderedSectionsHtml}
  </main>

  <footer class="border-t ${theme.borderClass} px-6 md:px-12 py-6 max-w-6xl mx-auto w-full text-xs ${theme.textMuted}">
    <span>${pageData.brandName} — جميع الحقوق محفوظة</span>
  </footer>

  <script>
    function sendWhatsApp() {
      var name = document.getElementById('custName').value || '';
      var notes = document.getElementById('custNotes').value || '';
      var msg = 'مرحباً، أود تأكيد طلب من ${pageData.brandName}:\\nالاسم: ' + name + '\\nالتفاصيل: ' + notes;
      window.open('https://wa.me/${waPhone}?text=' + encodeURIComponent(msg), '_blank');
    }
  </script>
</body>
</html>`;
}

export default function CodeExportModal({
  isOpen,
  onClose,
  pageData,
  activeThemeKey,
}) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const standaloneHtml = buildStandaloneHTML(pageData, activeThemeKey);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(standaloneHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadFile = () => {
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white text-zinc-900 border border-zinc-200 rounded-lg max-w-2xl w-full p-6 shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 mb-4">
          <h3 className="text-sm font-bold">تصدير ملف الموقع الكامل (index.html)</h3>
          <button
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer"
          >
            إغلاق
          </button>
        </div>

        <p className="text-xs text-zinc-500 mb-3">
          يعكس هذا الكود الترتيب الحالي للأقسام والتخطيط المختار لكل قسم وكافة التعديلات النصية.
        </p>

        <div className="flex-1 min-h-0 bg-zinc-950 text-zinc-200 rounded p-4 overflow-auto font-mono text-[11px] leading-relaxed text-left dir-ltr mb-4">
          <pre>{standaloneHtml}</pre>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded transition-colors cursor-pointer"
          >
            {copied ? 'تم النسخ' : 'نسخ الكود'}
          </button>

          <button
            onClick={downloadFile}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            تحميل الملف (index.html)
          </button>
        </div>
      </div>
    </div>
  );
}
