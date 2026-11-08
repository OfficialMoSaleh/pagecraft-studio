import React, { useState } from 'react';
import {
  DESIGN_THEMES,
  DEFAULT_SECTION_ORDER,
  DEFAULT_LAYOUTS,
  SECTION_LAYOUT_OPTIONS,
} from '../engine/templates';

const SECTION_NAMES_AR = {
  hero: 'القسم الرئيسي (Hero)',
  stats: 'شريط الإحصائيات',
  catalog: 'كتالوج المعروضات',
  features: 'قسم المميزات',
  process: 'خطوات العمل',
  pricing: 'باقات الأسعار',
  testimonial: 'آراء العملاء',
  faq: 'الأسئلة الشائعة',
  orderForm: 'نموذج الطلب',
};

export default function CanvasFrame({
  pageData,
  onUpdateField,
  onMoveSection,
  onChangeSectionLayout,
  onToggleSection,
  onOpenImagePicker,
  activeThemeKey,
  deviceView,
  isFullscreen,
}) {
  const theme = DESIGN_THEMES[activeThemeKey] || DESIGN_THEMES.editorial;
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

  const layouts = {
    ...DEFAULT_LAYOUTS,
    ...(pageData.layouts || {}),
  };

  // Interactive states inside the live landing page
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [cart, setCart] = useState({});
  const [selectedTier, setSelectedTier] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Customer Order Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const products = pageData.products || [];
  const productCategories = ['الكل', ...new Set(products.map((p) => p.category).filter(Boolean))];
  const filteredProducts =
    selectedCategory === 'الكل'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const currency = pageData.currency || 'ج.م';
  const deliveryFee = Number(pageData.deliveryFee) || 0;

  const updateCartQty = (prodId, delta) => {
    setCart((prev) => {
      const current = prev[prodId] || 0;
      const next = Math.max(0, current + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[prodId];
      else copy[prodId] = next;
      return copy;
    });
  };

  const cartItems = products
    .filter((p) => cart[p.id] > 0)
    .map((p) => ({
      ...p,
      qty: cart[p.id],
      lineTotal: (Number(p.price) || 0) * cart[p.id],
    }));

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const finalTotal = cartSubtotal + (cartSubtotal > 0 ? deliveryFee : 0);

  // Inline array update helpers
  const handleProductUpdate = (index, field, value) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateField('products', updated);
  };

  const handleAddProduct = () => {
    const newProd = {
      id: 'prod_' + Date.now(),
      name: 'منتج أو خدمة جديدة',
      category: 'عام',
      price: 300,
      oldPrice: 380,
      desc: 'اكتب وصفاً مختصراً يوضح مميزات هذا المنتج أو الخدمة للعميل.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      tag: 'جديد',
    };
    onUpdateField('products', [...products, newProd]);
  };

  const handleDeleteProduct = (id) => {
    onUpdateField(
      'products',
      products.filter((p) => p.id !== id)
    );
  };

  const handleStatUpdate = (index, field, value) => {
    const stats = [...(pageData.stats || [])];
    stats[index] = { ...stats[index], [field]: value };
    onUpdateField('stats', stats);
  };

  const handleFeatureUpdate = (index, field, value) => {
    const features = [...(pageData.features || [])];
    features[index] = { ...features[index], [field]: value };
    onUpdateField('features', features);
  };

  const handleProcessUpdate = (index, field, value) => {
    const steps = [...(pageData.processSteps || [])];
    steps[index] = { ...steps[index], [field]: value };
    onUpdateField('processSteps', steps);
  };

  const handleTierUpdate = (index, field, value) => {
    const tiers = [...(pageData.pricingTiers || [])];
    tiers[index] = { ...tiers[index], [field]: value };
    onUpdateField('pricingTiers', tiers);
  };

  const handleFaqUpdate = (index, field, value) => {
    const faqs = [...(pageData.faqs || [])];
    faqs[index] = { ...faqs[index], [field]: value };
    onUpdateField('faqs', faqs);
  };

  const handleAddFaq = () => {
    const faqs = [...(pageData.faqs || [])];
    faqs.push({
      q: 'سؤال جديد يهم العميل؟',
      a: 'اكتب الإجابة الواضحة والمختصرة هنا.',
    });
    onUpdateField('faqs', faqs);
    setOpenFaqIndex(faqs.length - 1);
  };

  const handleSendOrder = (e) => {
    e.preventDefault();
    const waPhone = pageData.whatsappPhone || '201000000000';
    let message = `${pageData.whatsappMessage || 'مرحباً، أود تأكيد الطلب التالي:'}\n\n`;
    message += `المشروع: ${pageData.brandName}\n`;

    if (selectedTier) {
      message += `الباقة المختارة: ${selectedTier.name} (${selectedTier.price})\n`;
    }

    if (cartItems.length > 0) {
      message += `\nالمنتجات المختارة:\n`;
      cartItems.forEach((item) => {
        message += `- ${item.name} (الكمية: ${item.qty}) = ${item.lineTotal} ${currency}\n`;
      });
      if (deliveryFee > 0) {
        message += `مصاريف التوصيل: ${deliveryFee} ${currency}\n`;
      }
      message += `الإجمالي الكلي: ${finalTotal} ${currency}\n`;
    }

    if (customerName) message += `\nالاسم: ${customerName}\n`;
    if (customerPhone) message += `الهاتف: ${customerPhone}\n`;
    if (customerAddress) message += `العنوان: ${customerAddress}\n`;

    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    setOrderSubmitted(true);
    setTimeout(() => setOrderSubmitted(false), 4000);
    window.open(waUrl, '_blank');
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // On-Canvas Floating Section Control Bar (visible on section hover in editor mode)
  const renderSectionControlBar = (sectionKey) => {
    if (isFullscreen) return null;
    const visibleOrder = sectionOrder.filter((k) => sections[k] !== false);
    const posIndex = visibleOrder.indexOf(sectionKey);
    const isFirst = posIndex <= 0;
    const isLast = posIndex === visibleOrder.length - 1;
    const layoutOptions = SECTION_LAYOUT_OPTIONS[sectionKey];
    const currentLayout = layouts[sectionKey];

    return (
      <div className="opacity-0 group-hover/section:opacity-100 transition-opacity duration-150 absolute top-2.5 left-3 z-20 flex items-center gap-1 bg-zinc-900/90 text-white px-2 py-1 rounded text-[11px] shadow-md backdrop-blur-sm">
        <span className="text-zinc-400 pl-1.5 border-l border-zinc-700 font-medium">
          {SECTION_NAMES_AR[sectionKey] || sectionKey}
        </span>

        {layoutOptions && (
          <select
            value={currentLayout}
            onChange={(e) => onChangeSectionLayout && onChangeSectionLayout(sectionKey, e.target.value)}
            className="bg-zinc-800 text-white text-[11px] px-1.5 py-0.5 rounded border border-zinc-700 focus:outline-none cursor-pointer"
            title="تغيير تخطيط هذا القسم"
          >
            {layoutOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                تخطيط: {opt.label}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          disabled={isFirst}
          onClick={() => onMoveSection && onMoveSection(sectionKey, 'up')}
          className="px-1.5 py-0.5 hover:bg-zinc-700 disabled:opacity-30 rounded cursor-pointer"
          title="تحريك القسم لأعلى"
        >
          ↑ لأعلى
        </button>

        <button
          type="button"
          disabled={isLast}
          onClick={() => onMoveSection && onMoveSection(sectionKey, 'down')}
          className="px-1.5 py-0.5 hover:bg-zinc-700 disabled:opacity-30 rounded cursor-pointer"
          title="تحريك القسم لأسفل"
        >
          ↓ لأسفل
        </button>

        <button
          type="button"
          onClick={() => onToggleSection && onToggleSection(sectionKey)}
          className="px-1.5 py-0.5 hover:bg-red-800/80 text-zinc-300 hover:text-white rounded cursor-pointer"
          title="إخفاء القسم"
        >
          إخفاء
        </button>
      </div>
    );
  };

  // SECTION RENDERERS WITH MULTIPLE LAYOUT VARIANTS

  // 1. HERO SECTION (3 Variants: 'editorial' | 'split' | 'centered')
  const renderHeroSection = () => {
    if (sections.hero === false) return null;
    const heroLayout = layouts.hero || 'editorial';

    return (
      <section
        key="hero"
        id="hero-section"
        className={`relative group/section border-b ${theme.borderClass}`}
      >
        {renderSectionControlBar('hero')}

        {heroLayout === 'split' ? (
          <div className="px-6 md:px-12 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-5">
              <div>
                <span
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField('category', e.currentTarget.innerText)}
                  className={`text-xs pb-1 inline-block font-medium ${theme.tagClass} focus:outline-none cursor-text`}
                >
                  {pageData.category}
                </span>
              </div>
              <h1
                contentEditable={!isFullscreen}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField('headline', e.currentTarget.innerText)}
                className={`text-2xl md:text-4xl font-bold leading-[1.3] ${theme.textMain} focus:outline-none cursor-text`}
              >
                {pageData.headline}
              </h1>
              <p
                contentEditable={!isFullscreen}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField('subheadline', e.currentTarget.innerText)}
                className={`text-sm md:text-base leading-relaxed ${theme.textMuted} focus:outline-none cursor-text`}
              >
                {pageData.subheadline}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => scrollToSection(sections.catalog ? 'catalog-section' : 'order-section')}
                  className={`px-6 py-3 rounded text-xs md:text-sm font-semibold transition-colors cursor-pointer ${theme.accentBtn}`}
                >
                  <span
                    contentEditable={!isFullscreen}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateField('primaryCta', e.currentTarget.innerText)}
                    onClick={(e) => e.stopPropagation()}
                    className="focus:outline-none"
                  >
                    {pageData.primaryCta}
                  </span>
                </button>
                <button
                  onClick={() => scrollToSection('pricing-section')}
                  className={`px-5 py-3 rounded text-xs md:text-sm font-medium transition-colors cursor-pointer ${theme.secondaryBtn}`}
                >
                  <span
                    contentEditable={!isFullscreen}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateField('secondaryCta', e.currentTarget.innerText)}
                    onClick={(e) => e.stopPropagation()}
                    className="focus:outline-none"
                  >
                    {pageData.secondaryCta}
                  </span>
                </button>
              </div>
            </div>

            {sections.heroImage && pageData.heroImage && (
              <div className="md:col-span-5">
                <div className={`relative group overflow-hidden rounded border ${theme.borderClass}`}>
                  <img
                    src={pageData.heroImage}
                    alt={pageData.brandName || ''}
                    className="w-full h-72 md:h-[380px] object-cover"
                  />
                  {!isFullscreen && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenImagePicker({
                          title: 'تغيير الصورة الرئيسية',
                          currentUrl: pageData.heroImage,
                          onSelect: (newUrl) => onUpdateField('heroImage', newUrl),
                        })
                      }
                      className="absolute bottom-3 left-3 px-3 py-1.5 bg-zinc-900/90 text-white text-xs font-medium rounded shadow cursor-pointer"
                    >
                      تغيير الصورة
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : heroLayout === 'centered' ? (
          <div className="px-6 md:px-12 pt-14 pb-12 text-center max-w-4xl mx-auto">
            <div className="mb-4">
              <span
                contentEditable={!isFullscreen}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField('category', e.currentTarget.innerText)}
                className={`text-xs px-3 py-1 rounded inline-block font-medium ${theme.badgeBg} focus:outline-none cursor-text`}
              >
                {pageData.category}
              </span>
            </div>
            <h1
              contentEditable={!isFullscreen}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField('headline', e.currentTarget.innerText)}
              className={`text-2xl md:text-4xl lg:text-5xl font-bold leading-[1.3] mb-5 max-w-3xl mx-auto ${theme.textMain} focus:outline-none cursor-text`}
            >
              {pageData.headline}
            </h1>
            <p
              contentEditable={!isFullscreen}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField('subheadline', e.currentTarget.innerText)}
              className={`text-sm md:text-base leading-relaxed mb-8 max-w-2xl mx-auto ${theme.textMuted} focus:outline-none cursor-text`}
            >
              {pageData.subheadline}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <button
                onClick={() => scrollToSection(sections.catalog ? 'catalog-section' : 'order-section')}
                className={`px-6 py-3 rounded text-xs md:text-sm font-semibold transition-colors cursor-pointer ${theme.accentBtn}`}
              >
                <span
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField('primaryCta', e.currentTarget.innerText)}
                  onClick={(e) => e.stopPropagation()}
                  className="focus:outline-none"
                >
                  {pageData.primaryCta}
                </span>
              </button>
              <button
                onClick={() => scrollToSection('pricing-section')}
                className={`px-5 py-3 rounded text-xs md:text-sm font-medium transition-colors cursor-pointer ${theme.secondaryBtn}`}
              >
                <span
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField('secondaryCta', e.currentTarget.innerText)}
                  onClick={(e) => e.stopPropagation()}
                  className="focus:outline-none"
                >
                  {pageData.secondaryCta}
                </span>
              </button>
            </div>

            {sections.heroImage && pageData.heroImage && (
              <div className={`relative group overflow-hidden rounded-lg border ${theme.borderClass}`}>
                <img
                  src={pageData.heroImage}
                  alt={pageData.brandName || ''}
                  className="w-full h-64 md:h-[400px] object-cover"
                />
                {!isFullscreen && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenImagePicker({
                        title: 'تغيير الصورة الرئيسية',
                        currentUrl: pageData.heroImage,
                        onSelect: (newUrl) => onUpdateField('heroImage', newUrl),
                      })
                    }
                    className="absolute bottom-3 left-3 px-3 py-1.5 bg-zinc-900/90 text-white text-xs font-medium rounded shadow cursor-pointer"
                  >
                    تغيير الصورة الرئيسية
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Default: 'editorial' */
          <div>
            <div className="px-6 md:px-12 pt-12 pb-10 max-w-3xl">
              <div className="mb-4">
                <span
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField('category', e.currentTarget.innerText)}
                  className={`text-xs pb-1 inline-block font-medium ${theme.tagClass} focus:outline-none cursor-text`}
                >
                  {pageData.category}
                </span>
              </div>
              <h1
                contentEditable={!isFullscreen}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField('headline', e.currentTarget.innerText)}
                className={`text-2xl md:text-4xl lg:text-[42px] font-bold leading-[1.3] mb-5 ${theme.textMain} focus:outline-none cursor-text`}
              >
                {pageData.headline}
              </h1>
              <p
                contentEditable={!isFullscreen}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField('subheadline', e.currentTarget.innerText)}
                className={`text-sm md:text-base leading-relaxed mb-8 max-w-2xl ${theme.textMuted} focus:outline-none cursor-text`}
              >
                {pageData.subheadline}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => scrollToSection(sections.catalog ? 'catalog-section' : 'order-section')}
                  className={`px-6 py-3 rounded text-xs md:text-sm font-semibold transition-colors cursor-pointer ${theme.accentBtn}`}
                >
                  <span
                    contentEditable={!isFullscreen}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateField('primaryCta', e.currentTarget.innerText)}
                    onClick={(e) => e.stopPropagation()}
                    className="focus:outline-none"
                  >
                    {pageData.primaryCta}
                  </span>
                </button>
                <button
                  onClick={() => scrollToSection('pricing-section')}
                  className={`px-5 py-3 rounded text-xs md:text-sm font-medium transition-colors cursor-pointer ${theme.secondaryBtn}`}
                >
                  <span
                    contentEditable={!isFullscreen}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateField('secondaryCta', e.currentTarget.innerText)}
                    onClick={(e) => e.stopPropagation()}
                    className="focus:outline-none"
                  >
                    {pageData.secondaryCta}
                  </span>
                </button>
              </div>
            </div>

            {sections.heroImage && pageData.heroImage && (
              <div className="px-6 md:px-12 pb-12">
                <div className={`relative group overflow-hidden rounded border ${theme.borderClass}`}>
                  <img
                    src={pageData.heroImage}
                    alt={pageData.brandName || ''}
                    className="w-full h-64 md:h-[420px] object-cover"
                  />
                  {!isFullscreen && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenImagePicker({
                          title: 'تغيير الصورة الرئيسية',
                          currentUrl: pageData.heroImage,
                          onSelect: (newUrl) => onUpdateField('heroImage', newUrl),
                        })
                      }
                      className="absolute bottom-3 left-3 px-3 py-1.5 bg-zinc-900/90 text-white text-xs font-medium rounded shadow cursor-pointer"
                    >
                      تغيير الصورة الرئيسية
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    );
  };

  // 2. STATS SECTION (3 Variants: 'strip' | 'cards' | 'minimal')
  const renderStatsSection = () => {
    if (!sections.stats || !pageData.stats || pageData.stats.length === 0) return null;
    const statsLayout = layouts.stats || 'strip';

    return (
      <section
        key="stats"
        className={`relative group/section px-6 md:px-12 py-8 border-b ${theme.borderClass} ${
          statsLayout === 'strip' ? theme.surfaceClass : ''
        }`}
      >
        {renderSectionControlBar('stats')}

        {statsLayout === 'cards' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pageData.stats.map((st, idx) => (
              <div key={idx} className={`p-5 rounded ${theme.cardClass} text-center space-y-1`}>
                <div
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatUpdate(idx, 'value', e.currentTarget.innerText)}
                  className={`text-xl md:text-2xl font-bold ${theme.textMain} focus:outline-none cursor-text`}
                >
                  {st.value}
                </div>
                <div
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatUpdate(idx, 'label', e.currentTarget.innerText)}
                  className={`text-xs ${theme.textMuted} focus:outline-none cursor-text`}
                >
                  {st.label}
                </div>
              </div>
            ))}
          </div>
        ) : statsLayout === 'minimal' ? (
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x md:divide-x-reverse ${theme.borderClass}`}>
            {pageData.stats.map((st, idx) => (
              <div key={idx} className="md:px-4 first:pr-0 space-y-1">
                <div
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatUpdate(idx, 'value', e.currentTarget.innerText)}
                  className={`text-2xl md:text-3xl font-bold ${theme.textMain} focus:outline-none cursor-text`}
                >
                  {st.value}
                </div>
                <div
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatUpdate(idx, 'label', e.currentTarget.innerText)}
                  className={`text-xs ${theme.textMuted} focus:outline-none cursor-text`}
                >
                  {st.label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {pageData.stats.map((st, idx) => (
              <div key={idx} className="space-y-1">
                <div
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatUpdate(idx, 'value', e.currentTarget.innerText)}
                  className={`text-xl md:text-2xl font-bold ${theme.textMain} focus:outline-none cursor-text`}
                >
                  {st.value}
                </div>
                <div
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatUpdate(idx, 'label', e.currentTarget.innerText)}
                  className={`text-xs ${theme.textMuted} focus:outline-none cursor-text`}
                >
                  {st.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  // Helper for Add-to-Cart Button
  const renderCartControl = (prod) => {
    const qtyInCart = cart[prod.id] || 0;
    if (qtyInCart === 0) {
      return (
        <button
          type="button"
          onClick={() => updateCartQty(prod.id, 1)}
          className={`text-xs px-4 py-2 rounded font-semibold transition-colors cursor-pointer shrink-0 ${theme.accentBtn}`}
        >
          أضف للطلب
        </button>
      );
    }
    return (
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => updateCartQty(prod.id, -1)}
          className={`w-7 h-7 rounded border ${theme.borderClass} flex items-center justify-center text-sm font-bold cursor-pointer`}
        >
          -
        </button>
        <span className={`text-xs font-bold w-4 text-center ${theme.textMain}`}>{qtyInCart}</span>
        <button
          type="button"
          onClick={() => updateCartQty(prod.id, 1)}
          className={`w-7 h-7 rounded border ${theme.borderClass} flex items-center justify-center text-sm font-bold cursor-pointer`}
        >
          +
        </button>
      </div>
    );
  };

  // 3. CATALOG SECTION (3 Variants: 'grid' | 'list' | 'featured')
  const renderCatalogSection = () => {
    if (!sections.catalog) return null;
    const catalogLayout = layouts.catalog || 'grid';

    return (
      <section
        key="catalog"
        id="catalog-section"
        className={`relative group/section px-6 md:px-12 py-14 border-b ${theme.borderClass}`}
      >
        {renderSectionControlBar('catalog')}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2
              contentEditable={!isFullscreen}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField('catalogTitle', e.currentTarget.innerText)}
              className={`text-xl md:text-2xl font-bold ${theme.textMain} mb-1.5 focus:outline-none cursor-text`}
            >
              {pageData.catalogTitle || 'المنتجات والخدمات المتاحة'}
            </h2>
            <p
              contentEditable={!isFullscreen}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField('catalogSubtitle', e.currentTarget.innerText)}
              className={`text-xs md:text-sm ${theme.textMuted} focus:outline-none cursor-text`}
            >
              {pageData.catalogSubtitle || 'اختر ما يناسبك وأضفه مباشرة إلى سلة طلبك'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {productCategories.length > 2 &&
              productCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? theme.accentBtn
                      : `${theme.surfaceClass} ${theme.textMuted}`
                  }`}
                >
                  {cat}
                </button>
              ))}

            {!isFullscreen && (
              <button
                type="button"
                onClick={handleAddProduct}
                className={`text-xs px-3 py-1.5 rounded border border-dashed ${theme.borderClass} ${theme.textMain} hover:opacity-80 cursor-pointer font-medium`}
              >
                + إضافة عنصر جديد
              </button>
            )}
          </div>
        </div>

        {/* Layout 1: Horizontal Editorial List ('list') */}
        {catalogLayout === 'list' ? (
          <div className="space-y-4">
            {filteredProducts.map((prod) => {
              const realIdx = products.findIndex((p) => p.id === prod.id);
              return (
                <div
                  key={prod.id}
                  className={`p-4 md:p-5 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 ${theme.cardClass} relative group`}
                >
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <div className="relative w-24 h-24 rounded overflow-hidden bg-zinc-100 shrink-0">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      {!isFullscreen && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenImagePicker({
                              title: `تغيير صورة: ${prod.name}`,
                              currentUrl: prod.image,
                              onSelect: (newUrl) => handleProductUpdate(realIdx, 'image', newUrl),
                            })
                          }
                          className="absolute inset-0 bg-black/60 text-white text-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                        >
                          تغيير الصورة
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          contentEditable={!isFullscreen}
                          suppressContentEditableWarning
                          onBlur={(e) => handleProductUpdate(realIdx, 'name', e.currentTarget.innerText)}
                          className={`text-sm md:text-base font-bold ${theme.textMain} focus:outline-none cursor-text`}
                        >
                          {prod.name}
                        </h3>
                        {prod.tag && (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${theme.badgeBg}`}>
                            {prod.tag}
                          </span>
                        )}
                      </div>
                      <p
                        contentEditable={!isFullscreen}
                        suppressContentEditableWarning
                        onBlur={(e) => handleProductUpdate(realIdx, 'desc', e.currentTarget.innerText)}
                        className={`text-xs leading-relaxed ${theme.textMuted} max-w-xl focus:outline-none cursor-text`}
                      >
                        {prod.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-200/50">
                    <div className="flex items-baseline gap-1">
                      <span
                        contentEditable={!isFullscreen}
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleProductUpdate(
                            realIdx,
                            'price',
                            Number(e.currentTarget.innerText.replace(/[^\d.]/g, '')) || prod.price
                          )
                        }
                        className={`text-base md:text-lg font-bold ${theme.textMain} focus:outline-none cursor-text`}
                      >
                        {prod.price}
                      </span>
                      <span className={`text-xs ${theme.textMuted}`}>{currency}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {renderCartControl(prod)}
                      {!isFullscreen && products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="text-[10px] text-red-700 hover:underline px-1 cursor-pointer"
                        >
                          حذف
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Layout 2 & 3: 'grid' or 'featured' (First item spotlight + grid) */
          <div className="space-y-6">
            {catalogLayout === 'featured' && filteredProducts.length > 0 && (() => {
              const firstProd = filteredProducts[0];
              const firstIdx = products.findIndex((p) => p.id === firstProd.id);
              return (
                <div className={`rounded overflow-hidden grid grid-cols-1 md:grid-cols-12 ${theme.cardClass} relative group`}>
                  <div className="md:col-span-6 relative h-64 md:h-auto bg-zinc-100">
                    <img src={firstProd.image} alt={firstProd.name} className="w-full h-full object-cover" />
                    {!isFullscreen && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenImagePicker({
                            title: `تغيير صورة: ${firstProd.name}`,
                            currentUrl: firstProd.image,
                            onSelect: (newUrl) => handleProductUpdate(firstIdx, 'image', newUrl),
                          })
                        }
                        className="absolute bottom-3 left-3 px-3 py-1 bg-zinc-900/90 text-white text-xs rounded cursor-pointer"
                      >
                        تغيير الصورة
                      </button>
                    )}
                  </div>
                  <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <span className={`text-xs px-2.5 py-1 rounded inline-block font-semibold ${theme.badgeBg}`}>
                        {firstProd.tag || 'إصدار رئيسي مختار'}
                      </span>
                      <h3
                        contentEditable={!isFullscreen}
                        suppressContentEditableWarning
                        onBlur={(e) => handleProductUpdate(firstIdx, 'name', e.currentTarget.innerText)}
                        className={`text-lg md:text-2xl font-bold ${theme.textMain} focus:outline-none cursor-text`}
                      >
                        {firstProd.name}
                      </h3>
                      <p
                        contentEditable={!isFullscreen}
                        suppressContentEditableWarning
                        onBlur={(e) => handleProductUpdate(firstIdx, 'desc', e.currentTarget.innerText)}
                        className={`text-xs md:text-sm leading-relaxed ${theme.textMuted} focus:outline-none cursor-text`}
                      >
                        {firstProd.desc}
                      </p>
                    </div>
                    <div className={`pt-4 border-t ${theme.borderClass} flex items-center justify-between`}>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          contentEditable={!isFullscreen}
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleProductUpdate(
                              firstIdx,
                              'price',
                              Number(e.currentTarget.innerText.replace(/[^\d.]/g, '')) || firstProd.price
                            )
                          }
                          className={`text-xl font-bold ${theme.textMain} focus:outline-none cursor-text`}
                        >
                          {firstProd.price}
                        </span>
                        <span className={`text-xs ${theme.textMuted}`}>{currency}</span>
                      </div>
                      {renderCartControl(firstProd)}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(catalogLayout === 'featured' ? filteredProducts.slice(1) : filteredProducts).map((prod) => {
                const realIdx = products.findIndex((p) => p.id === prod.id);
                return (
                  <div
                    key={prod.id}
                    className={`rounded overflow-hidden flex flex-col justify-between transition-all ${theme.cardClass} relative group`}
                  >
                    <div>
                      <div className="relative h-52 overflow-hidden bg-zinc-100">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        {prod.tag && (
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleProductUpdate(realIdx, 'tag', e.currentTarget.innerText)}
                            className={`absolute top-3 right-3 text-[11px] px-2.5 py-1 rounded font-medium ${theme.badgeBg} focus:outline-none`}
                          >
                            {prod.tag}
                          </span>
                        )}
                        {!isFullscreen && (
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() =>
                                onOpenImagePicker({
                                  title: `تغيير صورة: ${prod.name}`,
                                  currentUrl: prod.image,
                                  onSelect: (newUrl) => handleProductUpdate(realIdx, 'image', newUrl),
                                })
                              }
                              className="px-2.5 py-1 bg-zinc-900/90 text-white text-[11px] rounded cursor-pointer"
                            >
                              تغيير الصورة
                            </button>
                            {products.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="px-2 py-1 bg-red-900/90 text-white text-[11px] rounded cursor-pointer"
                              >
                                حذف
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3
                          contentEditable={!isFullscreen}
                          suppressContentEditableWarning
                          onBlur={(e) => handleProductUpdate(realIdx, 'name', e.currentTarget.innerText)}
                          className={`text-sm font-bold mb-2 ${theme.textMain} focus:outline-none cursor-text`}
                        >
                          {prod.name}
                        </h3>
                        <p
                          contentEditable={!isFullscreen}
                          suppressContentEditableWarning
                          onBlur={(e) => handleProductUpdate(realIdx, 'desc', e.currentTarget.innerText)}
                          className={`text-xs leading-relaxed mb-4 ${theme.textMuted} focus:outline-none cursor-text`}
                        >
                          {prod.desc}
                        </p>
                      </div>
                    </div>

                    <div className={`px-5 py-4 border-t ${theme.borderClass} flex items-center justify-between gap-2`}>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          contentEditable={!isFullscreen}
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleProductUpdate(
                              realIdx,
                              'price',
                              Number(e.currentTarget.innerText.replace(/[^\d.]/g, '')) || prod.price
                            )
                          }
                          className={`text-base font-bold ${theme.textMain} focus:outline-none cursor-text`}
                        >
                          {prod.price}
                        </span>
                        <span className={`text-xs ${theme.textMuted}`}>{currency}</span>
                      </div>
                      {renderCartControl(prod)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    );
  };

  // 4. FEATURES SECTION (3 Variants: 'columns' | 'rows' | 'cards')
  const renderFeaturesSection = () => {
    if (!sections.features || !pageData.features) return null;
    const featuresLayout = layouts.features || 'columns';

    return (
      <section
        key="features"
        id="features-section"
        className={`relative group/section px-6 md:px-12 py-14 border-b ${theme.borderClass}`}
      >
        {renderSectionControlBar('features')}

        <div className="mb-8">
          <h2 className={`text-lg md:text-xl font-bold ${theme.textMain}`}>معايير الجودة والعمل</h2>
        </div>

        {featuresLayout === 'rows' ? (
          <div className={`divide-y ${theme.borderClass} border-y ${theme.borderClass}`}>
            {pageData.features.map((feat, idx) => (
              <div key={idx} className="py-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
                <div className="md:col-span-4 flex items-baseline gap-3">
                  <span className={`text-xs font-mono ${theme.textMuted}`}>
                    {feat.num || `0${idx + 1}`}
                  </span>
                  <h3
                    contentEditable={!isFullscreen}
                    suppressContentEditableWarning
                    onBlur={(e) => handleFeatureUpdate(idx, 'title', e.currentTarget.innerText)}
                    className={`text-sm font-bold ${theme.textMain} focus:outline-none cursor-text`}
                  >
                    {feat.title}
                  </h3>
                </div>
                <p
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleFeatureUpdate(idx, 'desc', e.currentTarget.innerText)}
                  className={`md:col-span-8 text-xs md:text-sm leading-relaxed ${theme.textMuted} focus:outline-none cursor-text`}
                >
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        ) : featuresLayout === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pageData.features.map((feat, idx) => (
              <div key={idx} className={`p-6 rounded ${theme.cardClass} space-y-2.5`}>
                <span className={`text-xs font-mono px-2 py-0.5 rounded inline-block ${theme.badgeBg}`}>
                  {feat.num || `0${idx + 1}`}
                </span>
                <h3
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleFeatureUpdate(idx, 'title', e.currentTarget.innerText)}
                  className={`text-sm font-bold ${theme.textMain} focus:outline-none cursor-text`}
                >
                  {feat.title}
                </h3>
                <p
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleFeatureUpdate(idx, 'desc', e.currentTarget.innerText)}
                  className={`text-xs leading-relaxed ${theme.textMuted} focus:outline-none cursor-text`}
                >
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pageData.features.map((feat, idx) => (
              <div key={idx} className="space-y-2">
                <span className={`text-xs font-mono block ${theme.textMuted}`}>
                  {feat.num || `0${idx + 1}`}
                </span>
                <h3
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleFeatureUpdate(idx, 'title', e.currentTarget.innerText)}
                  className={`text-sm font-bold ${theme.textMain} focus:outline-none cursor-text`}
                >
                  {feat.title}
                </h3>
                <p
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleFeatureUpdate(idx, 'desc', e.currentTarget.innerText)}
                  className={`text-xs leading-relaxed ${theme.textMuted} focus:outline-none cursor-text`}
                >
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  // 5. PROCESS SECTION (2 Variants: 'cards' | 'timeline')
  const renderProcessSection = () => {
    if (!sections.process || !pageData.processSteps) return null;
    const processLayout = layouts.process || 'cards';

    return (
      <section
        key="process"
        className={`relative group/section px-6 md:px-12 py-14 border-b ${theme.borderClass} ${theme.surfaceClass}`}
      >
        {renderSectionControlBar('process')}

        <div className="mb-8">
          <h2 className={`text-lg md:text-xl font-bold ${theme.textMain}`}>خطوات الطلب والاستلام</h2>
        </div>

        {processLayout === 'timeline' ? (
          <div className={`max-w-2xl border-r-2 ${theme.borderClass} pr-6 space-y-8 mr-2`}>
            {pageData.processSteps.map((st, idx) => (
              <div key={idx} className="relative space-y-1.5">
                <span
                  className={`absolute -right-[33px] top-0.5 w-4 h-4 rounded-full border-2 ${theme.borderClass} ${theme.bgClass}`}
                />
                <span className={`text-xs font-mono block ${theme.textMuted}`}>
                  خطوة {st.step || `0${idx + 1}`}
                </span>
                <h3
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleProcessUpdate(idx, 'title', e.currentTarget.innerText)}
                  className={`text-sm font-bold ${theme.textMain} focus:outline-none cursor-text`}
                >
                  {st.title}
                </h3>
                <p
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleProcessUpdate(idx, 'desc', e.currentTarget.innerText)}
                  className={`text-xs leading-relaxed ${theme.textMuted} focus:outline-none cursor-text`}
                >
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pageData.processSteps.map((st, idx) => (
              <div key={idx} className={`p-5 rounded ${theme.cardClass} space-y-2`}>
                <span className={`text-xs font-mono px-2 py-0.5 rounded inline-block ${theme.badgeBg}`}>
                  خطوة {st.step || `0${idx + 1}`}
                </span>
                <h3
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleProcessUpdate(idx, 'title', e.currentTarget.innerText)}
                  className={`text-sm font-bold ${theme.textMain} focus:outline-none cursor-text`}
                >
                  {st.title}
                </h3>
                <p
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleProcessUpdate(idx, 'desc', e.currentTarget.innerText)}
                  className={`text-xs leading-relaxed ${theme.textMuted} focus:outline-none cursor-text`}
                >
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  // 6. PRICING SECTION (2 Variants: 'columns' | 'horizontal')
  const renderPricingSection = () => {
    if (!sections.pricing || !pageData.pricingTiers) return null;
    const pricingLayout = layouts.pricing || 'columns';

    return (
      <section
        key="pricing"
        id="pricing-section"
        className={`relative group/section px-6 md:px-12 py-14 border-b ${theme.borderClass}`}
      >
        {renderSectionControlBar('pricing')}

        <div className="mb-8">
          <h2 className={`text-xl md:text-2xl font-bold ${theme.textMain} mb-1.5`}>
            الباقات والأسعار
          </h2>
          <p className={`text-xs md:text-sm ${theme.textMuted}`}>
            اختر الباقة الأنسب لاحتياجك، ويمكنك تعديل أي سعر أو ميزة بالنقر عليها مباشرة
          </p>
        </div>

        {pricingLayout === 'horizontal' ? (
          <div className="space-y-4">
            {pageData.pricingTiers.map((tier, idx) => {
              const isSelected = selectedTier?.id === tier.id;
              return (
                <div
                  key={tier.id || idx}
                  className={`p-6 rounded grid grid-cols-1 md:grid-cols-12 gap-6 items-center ${
                    tier.highlighted ? `${theme.surfaceClass} border-2 border-current` : theme.cardClass
                  }`}
                >
                  <div className="md:col-span-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3
                        contentEditable={!isFullscreen}
                        suppressContentEditableWarning
                        onBlur={(e) => handleTierUpdate(idx, 'name', e.currentTarget.innerText)}
                        className={`text-base font-bold ${theme.textMain} focus:outline-none cursor-text`}
                      >
                        {tier.name}
                      </h3>
                      {tier.highlighted && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${theme.badgeBg}`}>
                          الأكثر اختياراً
                        </span>
                      )}
                    </div>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTierUpdate(idx, 'subtitle', e.currentTarget.innerText)}
                      className={`text-xs ${theme.textMuted} focus:outline-none cursor-text`}
                    >
                      {tier.subtitle}
                    </p>
                  </div>

                  <ul className="md:col-span-5 space-y-1.5 text-xs">
                    {(tier.features || []).map((fText, fIdx) => (
                      <li key={fIdx} className={`flex items-start gap-2 ${theme.textMuted}`}>
                        <span className={theme.textMain}>—</span>
                        <span
                          contentEditable={!isFullscreen}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const nextFeatures = [...tier.features];
                            nextFeatures[fIdx] = e.currentTarget.innerText;
                            handleTierUpdate(idx, 'features', nextFeatures);
                          }}
                          className="focus:outline-none cursor-text"
                        >
                          {fText}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between gap-3">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTierUpdate(idx, 'price', e.currentTarget.innerText)}
                      className={`text-xl md:text-2xl font-bold ${theme.textMain} focus:outline-none cursor-text`}
                    >
                      {tier.price}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTier(tier);
                        scrollToSection('order-section');
                      }}
                      className={`px-5 py-2.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected || tier.highlighted ? theme.accentBtn : theme.secondaryBtn
                      }`}
                    >
                      {isSelected ? 'تم اختيار الباقة' : 'اختيار الباقة'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pageData.pricingTiers.map((tier, idx) => {
              const isSelected = selectedTier?.id === tier.id;
              return (
                <div
                  key={tier.id || idx}
                  className={`p-6 rounded flex flex-col justify-between transition-all ${
                    tier.highlighted ? `${theme.surfaceClass} border-2 border-current` : theme.cardClass
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3
                        contentEditable={!isFullscreen}
                        suppressContentEditableWarning
                        onBlur={(e) => handleTierUpdate(idx, 'name', e.currentTarget.innerText)}
                        className={`text-sm font-bold ${theme.textMain} focus:outline-none cursor-text`}
                      >
                        {tier.name}
                      </h3>
                      {tier.highlighted && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${theme.badgeBg}`}>
                          الأكثر اختياراً
                        </span>
                      )}
                    </div>

                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTierUpdate(idx, 'subtitle', e.currentTarget.innerText)}
                      className={`text-xs ${theme.textMuted} mb-4 focus:outline-none cursor-text`}
                    >
                      {tier.subtitle}
                    </p>

                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTierUpdate(idx, 'price', e.currentTarget.innerText)}
                      className={`text-2xl font-bold ${theme.textMain} mb-5 pb-4 border-b ${theme.borderClass} focus:outline-none cursor-text`}
                    >
                      {tier.price}
                    </div>

                    <ul className="space-y-2.5 mb-6 text-xs">
                      {(tier.features || []).map((fText, fIdx) => (
                        <li key={fIdx} className={`flex items-start gap-2 ${theme.textMuted}`}>
                          <span className={theme.textMain}>—</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const nextFeatures = [...tier.features];
                              nextFeatures[fIdx] = e.currentTarget.innerText;
                              handleTierUpdate(idx, 'features', nextFeatures);
                            }}
                            className="focus:outline-none cursor-text"
                          >
                            {fText}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTier(tier);
                      scrollToSection('order-section');
                    }}
                    className={`w-full py-2.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected || tier.highlighted ? theme.accentBtn : theme.secondaryBtn
                    }`}
                  >
                    {isSelected ? 'تم اختيار هذه الباقة' : 'اختيار هذه الباقة'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  // 7. TESTIMONIAL SECTION (2 Variants: 'grid' | 'editorialQuote')
  const renderTestimonialSection = () => {
    if (!sections.testimonial || !pageData.testimonials || pageData.testimonials.length === 0) {
      return null;
    }
    const testimonialLayout = layouts.testimonial || 'grid';

    return (
      <section
        key="testimonial"
        className={`relative group/section px-6 md:px-12 py-14 border-b ${theme.borderClass}`}
      >
        {renderSectionControlBar('testimonial')}

        {testimonialLayout === 'editorialQuote' ? (
          <div className="max-w-3xl mx-auto text-center space-y-4 py-4">
            <span className={`text-xs font-medium px-3 py-1 rounded inline-block ${theme.badgeBg}`}>
              من تجارب عملائنا
            </span>
            <blockquote className={`text-lg md:text-2xl font-bold leading-relaxed ${theme.textMain}`}>
              «{pageData.testimonials[0].quote}»
            </blockquote>
            <footer className={`text-xs ${theme.textMuted}`}>
              <strong className={theme.textMain}>{pageData.testimonials[0].author}</strong>
              {pageData.testimonials[0].role ? ` — ${pageData.testimonials[0].role}` : ''}
            </footer>
          </div>
        ) : (
          <div>
            <h2 className={`text-lg md:text-xl font-bold ${theme.textMain} mb-6`}>
              تجارب وآراء العملاء
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pageData.testimonials.map((item, idx) => (
                <blockquote
                  key={idx}
                  className={`p-6 rounded ${theme.cardClass} flex flex-col justify-between space-y-3`}
                >
                  <p className={`text-xs md:text-sm leading-relaxed ${theme.textMain}`}>
                    «{item.quote}»
                  </p>
                  <footer className={`text-xs ${theme.textMuted}`}>
                    <strong className={theme.textMain}>{item.author}</strong>
                    {item.role ? ` — ${item.role}` : ''}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  };

  // 8. FAQ SECTION
  const renderFaqSection = () => {
    if (!sections.faq || !pageData.faqs) return null;

    return (
      <section
        key="faq"
        id="faq-section"
        className={`relative group/section px-6 md:px-12 py-14 border-b ${theme.borderClass}`}
      >
        {renderSectionControlBar('faq')}

        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg md:text-xl font-bold ${theme.textMain}`}>أسئلة وإجابات تفصيلية</h2>
          {!isFullscreen && (
            <button
              type="button"
              onClick={handleAddFaq}
              className={`text-xs px-3 py-1 rounded border border-dashed ${theme.borderClass} ${theme.textMain} cursor-pointer`}
            >
              + إضافة سؤال
            </button>
          )}
        </div>

        <div className={`divide-y ${theme.borderClass} border-y ${theme.borderClass}`}>
          {pageData.faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="py-4">
                <div
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  className="flex items-center justify-between gap-4 cursor-pointer"
                >
                  <h3
                    contentEditable={!isFullscreen}
                    suppressContentEditableWarning
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => handleFaqUpdate(idx, 'q', e.currentTarget.innerText)}
                    className={`text-sm font-bold ${theme.textMain} focus:outline-none`}
                  >
                    {faq.q}
                  </h3>
                  <span className={`text-xs font-mono ${theme.textMuted}`}>
                    {isOpen ? '—' : '+'}
                  </span>
                </div>

                {isOpen && (
                  <p
                    contentEditable={!isFullscreen}
                    suppressContentEditableWarning
                    onBlur={(e) => handleFaqUpdate(idx, 'a', e.currentTarget.innerText)}
                    className={`mt-2.5 text-xs leading-relaxed ${theme.textMuted} focus:outline-none cursor-text`}
                  >
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  // 9. ORDER FORM SECTION
  const renderOrderFormSection = () => {
    if (!sections.orderForm) return null;

    return (
      <section
        key="orderForm"
        id="order-section"
        className={`relative group/section px-6 md:px-12 py-14 ${theme.surfaceClass}`}
      >
        {renderSectionControlBar('orderForm')}

        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h2 className={`text-xl md:text-2xl font-bold ${theme.textMain} mb-1.5`}>
              إتمام الطلب والتواصل المباشر
            </h2>
            <p className={`text-xs ${theme.textMuted}`}>
              راجع اختياراتك وأدخل بياناتك لإرسال الطلب مفصلاً ومباشراً عبر واتساب
            </p>
          </div>

          <form onSubmit={handleSendOrder} className={`p-6 md:p-8 rounded ${theme.cardClass} space-y-5`}>
            {(selectedTier || cartItems.length > 0) ? (
              <div className={`p-4 rounded ${theme.surfaceClass} border ${theme.borderClass} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${theme.textMain}`}>ملخص اختياراتك:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCart({});
                      setSelectedTier(null);
                    }}
                    className={`text-[11px] underline ${theme.textMuted} cursor-pointer`}
                  >
                    إفراغ الاختيارات
                  </button>
                </div>

                {selectedTier && (
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className={theme.textMain}>الباقة: {selectedTier.name}</span>
                    <span className="font-bold">{selectedTier.price}</span>
                  </div>
                )}

                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2">
                      <span className={theme.textMain}>{item.name}</span>
                      <span className={theme.textMuted}>× {item.qty}</span>
                    </div>
                    <span className={`font-semibold ${theme.textMain}`}>
                      {item.lineTotal} {currency}
                    </span>
                  </div>
                ))}

                {cartSubtotal > 0 && (
                  <div className={`pt-2 border-t ${theme.borderClass} flex items-center justify-between text-xs font-bold ${theme.textMain}`}>
                    <span>الإجمالي شامل التوصيل ({deliveryFee} {currency}):</span>
                    <span className="text-sm">{finalTotal} {currency}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-3.5 rounded border border-dashed ${theme.borderClass} text-xs ${theme.textMuted}`}>
                لم تقم بتحديد منتجات معينة من الأعلى بعد — يمكنك إرسال استفسارك مباشرة أو اختيار منتجات من الكتالوج.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme.textMain}`}>
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="محمد أحمد..."
                  className={`w-full px-3 py-2 rounded text-xs border ${theme.borderClass} bg-transparent ${theme.textMain} focus:outline-none`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme.textMain}`}>
                  رقم الهاتف للتواصل
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01012345678"
                  className={`w-full px-3 py-2 rounded text-xs border ${theme.borderClass} bg-transparent ${theme.textMain} focus:outline-none`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${theme.textMain}`}>
                العنوان بالتفصيل أو الملاحظات الإضافية
              </label>
              <textarea
                rows="2"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="المدينة، المنطقة، وأي تفاصيل خاصة بطلبك..."
                className={`w-full px-3 py-2 rounded text-xs border ${theme.borderClass} bg-transparent ${theme.textMain} focus:outline-none`}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 rounded text-xs md:text-sm font-bold transition-colors cursor-pointer ${theme.accentBtn}`}
            >
              {orderSubmitted
                ? 'جاري تحويلك إلى واتساب لتأكيد الطلب...'
                : `تأكيد وإرسال الطلب عبر واتساب${cartSubtotal > 0 ? ` (${finalTotal} ${currency})` : ''}`}
            </button>
          </form>
        </div>
      </section>
    );
  };

  const sectionRenderMap = {
    hero: renderHeroSection,
    stats: renderStatsSection,
    catalog: renderCatalogSection,
    features: renderFeaturesSection,
    process: renderProcessSection,
    pricing: renderPricingSection,
    testimonial: renderTestimonialSection,
    faq: renderFaqSection,
    orderForm: renderOrderFormSection,
  };

  const containerWidth = isFullscreen
    ? 'w-full min-h-screen'
    : deviceView === 'mobile'
    ? 'w-[395px] rounded-[28px] border-[6px] border-zinc-800 shadow-2xl my-4'
    : 'w-full max-w-5xl rounded-lg border border-zinc-300/90 shadow-sm my-2';

  return (
    <div className={`mx-auto transition-all duration-300 overflow-hidden ${containerWidth}`}>
      <div
        className={`min-h-screen ${theme.bgClass} flex flex-col transition-colors duration-300 relative`}
        style={{ fontFamily: theme.fontFamily }}
      >
        {/* Top Announcement Bar */}
        {sections.announcement && pageData.announcement && (
          <div className={`px-4 py-2.5 text-center text-xs border-b ${theme.borderClass} ${theme.surfaceClass}`}>
            <span
              contentEditable={!isFullscreen}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField('announcement', e.currentTarget.innerText)}
              className={`${theme.textMain} font-medium focus:outline-none cursor-text`}
            >
              {pageData.announcement}
            </span>
          </div>
        )}

        {/* Navigation Bar */}
        <header className={`border-b ${theme.borderClass} px-6 md:px-12 py-5 flex items-center justify-between sticky top-0 z-20 ${theme.bgClass}/95 backdrop-blur-sm`}>
          <div className="flex items-center gap-6">
            <span
              contentEditable={!isFullscreen}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField('brandName', e.currentTarget.innerText)}
              className={`font-bold text-base md:text-lg tracking-tight ${theme.textMain} focus:outline-none cursor-text`}
            >
              {pageData.brandName || 'اسم المشروع'}
            </span>

            {deviceView !== 'mobile' && (
              <nav className={`hidden md:flex items-center gap-5 text-xs ${theme.textMuted}`}>
                {sections.catalog && (
                  <button onClick={() => scrollToSection('catalog-section')} className="hover:underline cursor-pointer">
                    المعروضات
                  </button>
                )}
                {sections.features && (
                  <button onClick={() => scrollToSection('features-section')} className="hover:underline cursor-pointer">
                    المميزات
                  </button>
                )}
                {sections.pricing && (
                  <button onClick={() => scrollToSection('pricing-section')} className="hover:underline cursor-pointer">
                    الباقات والأسعار
                  </button>
                )}
                {sections.faq && (
                  <button onClick={() => scrollToSection('faq-section')} className="hover:underline cursor-pointer">
                    الأسئلة الشائعة
                  </button>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {cartCount > 0 && (
              <button
                onClick={() => scrollToSection('order-section')}
                className={`text-xs px-3 py-2 rounded font-semibold border ${theme.borderClass} ${theme.surfaceClass} ${theme.textMain} cursor-pointer`}
              >
                سلة الطلب ({cartCount}) — {cartSubtotal} {currency}
              </button>
            )}
            <button
              onClick={() => scrollToSection('order-section')}
              className={`text-xs px-4 py-2 rounded font-semibold transition-colors cursor-pointer ${theme.accentBtn}`}
            >
              اطلب الآن
            </button>
          </div>
        </header>

        {/* Render Dynamic Ordered Sections */}
        {sectionOrder.map((secKey) => {
          const renderFn = sectionRenderMap[secKey];
          return renderFn ? renderFn() : null;
        })}

        {/* Minimal Editorial Footer */}
        <footer className={`mt-auto border-t ${theme.borderClass} px-6 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs ${theme.textMuted}`}>
          <span>{pageData.brandName} — جميع الحقوق محفوظة</span>
          <span>للتواصل المباشر: {pageData.whatsappPhone}</span>
        </footer>
      </div>
    </div>
  );
}
