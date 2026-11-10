import React, { useState, useEffect } from 'react';
import {
  DESIGN_THEMES,
  DEFAULT_SECTION_ORDER,
  DEFAULT_LAYOUTS,
  SECTION_LAYOUT_OPTIONS,
  DEFAULT_TYPOGRAPHY,
  ARABIC_FONTS,
  DEFAULT_CUSTOM_COLORS,
  buildDefaultEasyOrderConfig,
  detectNicheFromText,
} from '../engine/templates';
import { loadOrdersInbox } from '../engine/projects';

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
  onSubmitOrder,
  orders: propOrders,
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

  const typography = {
    ...DEFAULT_TYPOGRAPHY,
    ...(pageData.typography || {}),
  };

  const customColors = {
    ...DEFAULT_CUSTOM_COLORS,
    ...(pageData.customColors || {}),
  };

  const selectedFontObj = ARABIC_FONTS.find((f) => f.id === typography.fontFamily);
  const activeFontFamily = selectedFontObj ? selectedFontObj.css : theme.fontFamily;

  const isMobile = deviceView === 'mobile' && !isFullscreen;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Multi-Page Storefront Router ('home' | 'product' | 'checkout' | 'tracking')
  const [storePage, setStorePage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(() => pageData.products?.[0]?.id || null);
  const [activeThumbIdx, setActiveThumbIdx] = useState(0);
  const [productInfoTab, setProductInfoTab] = useState('specs');

  // Interactive states inside the live landing page
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [cart, setCart] = useState({});
  const [selectedTier, setSelectedTier] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Customer Order Form & EasyOrders COD State
  const detectedNiche =
    pageData.niche ||
    detectNicheFromText(
      `${pageData.brandName || ''} ${pageData.category || ''} ${pageData.headline || ''}`
    );
  const easyOrder = {
    ...buildDefaultEasyOrderConfig(detectedNiche, Number(pageData.products?.[0]?.price) || 340),
    ...(pageData.easyOrder || {}),
  };
  const bundleOffers = easyOrder.bundleOffers || [];
  const shippingRates = easyOrder.shippingRates || [];
  const variantOptions = easyOrder.variantOptions || ['الإصدار الأساسي'];

  const [selectedBundleIdx, setSelectedBundleIdx] = useState(1); // Default to 2-piece Most Popular offer
  const [pieceVariants, setPieceVariants] = useState([
    variantOptions[0] || '',
    variantOptions[1] || variantOptions[0] || '',
    variantOptions[2] || variantOptions[0] || '',
  ]);
  const [selectedGovId, setSelectedGovId] = useState(shippingRates[0]?.id || 'cairo_giza');
  const [includeOrderBump, setIncludeOrderBump] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [submittedReceipt, setSubmittedReceipt] = useState(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  // Order Tracking Page State ('tracking')
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackedOrderResult, setTrackedOrderResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Reset storefront state whenever the website idea / brand / niche changes so text never mixes
  useEffect(() => {
    const freshOpts = easyOrder.variantOptions || ['الإصدار الأساسي'];
    setPieceVariants([
      freshOpts[0] || '',
      freshOpts[1] || freshOpts[0] || '',
      freshOpts[2] || freshOpts[0] || '',
    ]);
    setSelectedCategory('الكل');
    setCart({});
    setSelectedTier(null);
    setSelectedProductId(pageData.products?.[0]?.id || null);
    setActiveThumbIdx(0);
    setSubmittedReceipt(null);
  }, [pageData.brandName, pageData.niche, pageData.headline]);

  const products = pageData.products || [];
  const activeProduct =
    products.find((p) => p.id === selectedProductId) || products[0] || {
      id: 'prod_default',
      name: pageData.brandName || 'المنتج الرئيسي',
      category: pageData.category || 'عام',
      price: 350,
      oldPrice: 420,
      desc: pageData.subheadline || '',
      image: pageData.heroImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      tag: 'الأكثر طلباً',
    };
  const activeProductIdx = Math.max(
    0,
    products.findIndex((p) => p.id === activeProduct.id)
  );
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

  // EasyOrders COD Calculation
  const activeBundle = bundleOffers[selectedBundleIdx] || bundleOffers[0] || {
    qty: 1,
    title: 'عرض قطعة واحدة',
    price: Number(pageData.products?.[0]?.price) || 340,
    freeShipping: false,
  };
  const activeQty = Number(activeBundle.qty) || 1;
  const freeShippingThreshold = 900;
  const parsePrice = (val) => Number(String(val || 0).replace(/[^\d.]/g, '')) || 0;

  const activeGov =
    shippingRates.find((g) => g.id === selectedGovId) ||
    shippingRates[0] || { name: 'القاهرة والجيزة', fee: deliveryFee || 50, days: 'خلال 48 ساعة' };

  const baseOrderSubtotal =
    cartSubtotal > 0
      ? cartSubtotal
      : easyOrder.enableBundleSelector !== false
      ? Number(activeBundle.price) || 0
      : Number(pageData.products?.[0]?.price) || 340;

  const isFreeShipping =
    easyOrder.enableBundleSelector !== false && cartSubtotal === 0 && Boolean(activeBundle.freeShipping);
  const effectiveShippingFee = isFreeShipping ? 0 : Number(activeGov.fee ?? deliveryFee);
  const bumpFee =
    easyOrder.enableOrderBump !== false && includeOrderBump
      ? Number(easyOrder.orderBump?.price) || 0
      : 0;
  const discountPercent = promoApplied ? Number(pageData.promoDiscountPercent) || 10 : 0;
  const discountAmount = Math.round((baseOrderSubtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, baseOrderSubtotal - discountAmount + effectiveShippingFee + bumpFee);

  // Inline array update helpers
  const handleProductUpdate = (indexOrId, field, value) => {
    const updated = [...products];
    const idx =
      typeof indexOrId === 'number'
        ? indexOrId
        : updated.findIndex((p) => p.id === indexOrId);
    if (idx === -1 || !updated[idx]) return;
    updated[idx] = { ...updated[idx], [field]: value };
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

  const handleApplyPromo = () => {
    const targetCode = (pageData.promoCode || 'WELCOME10').trim().toUpperCase();
    if (promoInput.trim().toUpperCase() === targetCode) {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoApplied(false);
      setPromoError('كود الخصم غير صحيح، جرب: ' + targetCode);
    }
  };

  const handlePieceVariantChange = (pieceIdx, val) => {
    setPieceVariants((prev) => {
      const next = [...prev];
      next[pieceIdx] = val;
      return next;
    });
  };

  const handleSendOrder = (e) => {
    e.preventDefault();
    const waPhone = pageData.whatsappPhone || '201000000000';
    const chosenQty = Number(activeBundle.qty) || 1;
    const chosenVariants =
      cartItems.length > 0
        ? cartItems.map((item) => `${item.name} × ${item.qty}`)
        : Array.from({ length: chosenQty }, (_, i) => pieceVariants[i] || variantOptions[0] || '');

    const orderSummaryTitle =
      cartItems.length > 0
        ? `سلة منتجات مخصصة (${cartCount} قطع)`
        : selectedTier
        ? `${selectedTier.name} (${selectedTier.price})`
        : activeBundle.title;

    let message = `${pageData.whatsappMessage || 'مرحباً، أود تأكيد طلب دفع عند الاستلام (COD):'}\n\n`;
    message += `المشروع: ${pageData.brandName}\n`;
    message += `العرض المختار: ${orderSummaryTitle}\n`;

    if (chosenVariants.length > 0) {
      message += `المواصفات المختارة:\n`;
      chosenVariants.forEach((v, i) => {
        message += `  • قطعة #${i + 1}: ${v}\n`;
      });
    }

    if (includeOrderBump && easyOrder.enableOrderBump !== false) {
      message += `إضافة خاصة: ${easyOrder.orderBump?.title} (+${bumpFee} ${currency})\n`;
    }

    if (promoApplied && discountAmount > 0) {
      message += `كود الخصم (${pageData.promoCode || 'WELCOME10'}): -${discountAmount} ${currency}\n`;
    }

    message += `المحافظة والشحن: ${activeGov.name} (${
      effectiveShippingFee === 0 ? 'شحن مجاني' : `${effectiveShippingFee} ${currency}`
    })\n`;
    message += `الإجمالي المطلوب عند الاستلام: ${finalTotal} ${currency}\n`;
    message += `\nبيانات العميل:\n`;
    message += `- الاسم: ${customerName}\n`;
    message += `- الهاتف: ${customerPhone}\n`;
    message += `- العنوان: ${activeGov.name} — ${customerAddress}\n`;
    if (customerNotes) {
      message += `- ملاحظات التوصيل: ${customerNotes}\n`;
    }
    message += `- طريقة الدفع: ${
      paymentMethod === 'instapay'
        ? 'إنستاباي / محفظة إلكترونية'
        : 'الدفع نقداً عند الاستلام (COD)'
    }\n`;

    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;

    const orderPayload = {
      projectName: pageData.brandName || 'المتجر',
      customerName,
      customerPhone,
      governorate: activeGov.name,
      address: customerAddress,
      notes: customerNotes,
      paymentMethod,
      bundleTitle: orderSummaryTitle,
      variantSelections: chosenVariants,
      orderBumpIncluded: Boolean(includeOrderBump && easyOrder.enableOrderBump !== false),
      orderBumpTitle: easyOrder.orderBump?.title || '',
      shippingFee: effectiveShippingFee,
      discountAmount,
      totalAmount: finalTotal,
      currency,
      waUrl,
    };

    let createdOrder = {
      id: 'ORD-' + Math.floor(1050 + Math.random() * 8900),
      status: 'new',
      createdAt: new Date().toISOString(),
      ...orderPayload,
    };
    if (onSubmitOrder) {
      const saved = onSubmitOrder(orderPayload);
      if (saved?.id) createdOrder = { ...saved, waUrl };
    }

    setSubmittedReceipt(createdOrder);
    setTrackOrderId(createdOrder.id);
    setTrackPhone(customerPhone);
    setTrackedOrderResult(createdOrder);
    setOrderSubmitted(true);
    setTimeout(() => setOrderSubmitted(false), 4000);
  };

  // Multi-Page Storefront Navigation Helpers
  const openProductDetails = (prodId) => {
    if (prodId) setSelectedProductId(prodId);
    setActiveThumbIdx(0);
    setStorePage('product');
  };

  const openCheckoutPage = () => {
    setStorePage('checkout');
  };

  const getAllStoreOrders = () => {
    const inboxList = Array.isArray(propOrders) && propOrders.length > 0 ? propOrders : loadOrdersInbox();
    if (submittedReceipt && !inboxList.some((o) => o.id === submittedReceipt.id)) {
      return [submittedReceipt, ...inboxList];
    }
    return inboxList;
  };

  const runOrderSearch = (orderIdInput, phoneInput) => {
    const cleanId = String(orderIdInput || '')
      .trim()
      .toUpperCase()
      .replace(/^#/, '');
    const cleanPhone = String(phoneInput || '')
      .trim()
      .replace(/\D/g, '');

    if (!cleanId && !cleanPhone) {
      setTrackError('يرجى إدخال رقم الطلب (مثال: ORD-1041) أو رقم الهاتف للاستعلام.');
      setTrackedOrderResult(null);
      return;
    }

    const allOrders = getAllStoreOrders();
    const matched = allOrders.find((ord) => {
      const ordIdUpper = String(ord.id || '').toUpperCase();
      const ordDigits = ordIdUpper.replace(/\D/g, '');
      const ordPhoneDigits = String(ord.customerPhone || '').replace(/\D/g, '');

      const idMatches =
        cleanId &&
        (ordIdUpper === cleanId ||
          ordIdUpper === `ORD-${cleanId}` ||
          (ordDigits && ordDigits === cleanId.replace(/\D/g, '')));
      const phoneMatches =
        cleanPhone &&
        cleanPhone.length >= 6 &&
        (ordPhoneDigits.includes(cleanPhone) || cleanPhone.includes(ordPhoneDigits));

      if (cleanId && cleanPhone) {
        return idMatches || phoneMatches;
      }
      return idMatches || phoneMatches;
    });

    if (matched) {
      setTrackedOrderResult(matched);
      setTrackError('');
    } else {
      setTrackedOrderResult(null);
      setTrackError('لم يتم العثور على طلب مطابق. تأكد من رقم الطلب (مثل ORD-1041) أو رقم الهاتف.');
    }
  };

  const openTrackingPage = (prefillOrderId = '', prefillPhone = '') => {
    setStorePage('tracking');
    if (prefillOrderId || prefillPhone) {
      setTrackOrderId(prefillOrderId);
      setTrackPhone(prefillPhone);
      runOrderSearch(prefillOrderId, prefillPhone);
    }
  };

  const scrollToSection = (id) => {
    if (storePage !== 'home') {
      setStorePage('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
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
          <div className="px-6 md:px-12 pt-10 pb-10 text-center max-w-4xl mx-auto">
            <div className="mb-3 flex items-center justify-center gap-2 flex-wrap">
              <span
                contentEditable={!isFullscreen}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField('category', e.currentTarget.innerText)}
                className={`text-xs px-3 py-1 rounded inline-block font-medium ${theme.badgeBg} focus:outline-none cursor-text`}
              >
                {pageData.category}
              </span>
              {pageData.price && (
                <span className={`text-xs px-2.5 py-1 rounded border ${theme.borderClass} ${theme.textMain} font-semibold`}>
                  الأسعار تبدأ من {pageData.price}
                </span>
              )}
            </div>
            <h1
              contentEditable={!isFullscreen}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField('headline', e.currentTarget.innerText)}
              className={`text-2xl md:text-4xl font-bold leading-[1.3] mb-4 max-w-3xl mx-auto ${theme.textMain} focus:outline-none cursor-text`}
            >
              {pageData.headline}
            </h1>
            <p
              contentEditable={!isFullscreen}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField('subheadline', e.currentTarget.innerText)}
              className={`text-sm md:text-base leading-relaxed mb-6 max-w-2xl mx-auto ${theme.textMuted} focus:outline-none cursor-text`}
            >
              {pageData.subheadline}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <button
                onClick={() => scrollToSection('order-section')}
                className={`px-6 py-2.5 rounded text-xs md:text-sm font-semibold transition-colors cursor-pointer ${theme.accentBtn}`}
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
                onClick={() => scrollToSection(sections.catalog ? 'catalog-section' : 'pricing-section')}
                className={`px-5 py-2.5 rounded text-xs md:text-sm font-medium transition-colors cursor-pointer ${theme.secondaryBtn}`}
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
                  className="w-full h-56 md:h-[310px] object-cover"
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
          /* Default: 'editorial' — Balanced 2-Column Above-the-Fold Layout */
          <div className="px-6 md:px-12 py-10 md:py-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className={sections.heroImage && pageData.heroImage ? 'md:col-span-7 space-y-4' : 'md:col-span-12 max-w-3xl space-y-4'}>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField('category', e.currentTarget.innerText)}
                  className={`text-xs px-2.5 py-1 rounded font-medium ${theme.badgeBg} focus:outline-none cursor-text`}
                >
                  {pageData.category}
                </span>
                {pageData.price && (
                  <span className={`text-xs font-semibold ${theme.textMuted}`}>
                    • يبدأ من <strong className={theme.textMain}>{pageData.price}</strong>
                  </span>
                )}
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
                className={`text-sm md:text-base leading-relaxed max-w-2xl ${theme.textMuted} focus:outline-none cursor-text`}
              >
                {pageData.subheadline}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => scrollToSection('order-section')}
                  className={`px-6 py-2.5 rounded text-xs md:text-sm font-semibold transition-colors cursor-pointer ${theme.accentBtn}`}
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
                  onClick={() => scrollToSection(sections.catalog ? 'catalog-section' : 'pricing-section')}
                  className={`px-5 py-2.5 rounded text-xs md:text-sm font-medium transition-colors cursor-pointer ${theme.secondaryBtn}`}
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

              {/* Clean Trust Badges Strip */}
              <div className={`pt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] ${theme.textMuted}`}>
                <span>✓ الدفع نقداً عند الاستلام</span>
                <span>✓ شحن سريع لجميع المحافظات</span>
                <span>✓ معاينة الطلب قبل الاستلام</span>
              </div>
            </div>

            {sections.heroImage && pageData.heroImage && (
              <div className="md:col-span-5">
                <div className={`relative group overflow-hidden rounded-lg border ${theme.borderClass} ${theme.cardClass} shadow-sm`}>
                  <img
                    src={pageData.heroImage}
                    alt={pageData.brandName || ''}
                    className="w-full h-60 md:h-[320px] object-cover"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pc-stats-grid">
            {pageData.stats.map((st, idx) => (
              <div key={idx} className={`p-5 rounded ${theme.cardClass} text-center space-y-1`}>
                <div
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatUpdate(idx, 'value', e.currentTarget.innerText)}
                  className={`text-xl md:text-2xl font-bold pc-price-val ${theme.textMain} focus:outline-none cursor-text`}
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
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x md:divide-x-reverse pc-stats-grid ${theme.borderClass}`}>
            {pageData.stats.map((st, idx) => (
              <div key={idx} className="md:px-4 first:pr-0 space-y-1">
                <div
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatUpdate(idx, 'value', e.currentTarget.innerText)}
                  className={`text-2xl md:text-3xl font-bold pc-price-val ${theme.textMain} focus:outline-none cursor-text`}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pc-stats-grid">
            {pageData.stats.map((st, idx) => (
              <div key={idx} className="space-y-1">
                <div
                  contentEditable={!isFullscreen}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatUpdate(idx, 'value', e.currentTarget.innerText)}
                  className={`text-xl md:text-2xl font-bold pc-price-val ${theme.textMain} focus:outline-none cursor-text`}
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

  // Helper for Product Details + Add-to-Cart Buttons
  const renderCartControl = (prod) => {
    const qtyInCart = cart[prod.id] || 0;
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => openProductDetails(prod.id)}
          className={`text-xs px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${theme.secondaryBtn}`}
        >
          التفاصيل
        </button>

        {qtyInCart === 0 ? (
          <button
            type="button"
            onClick={() => updateCartQty(prod.id, 1)}
            className={`text-xs px-3.5 py-1.5 rounded font-semibold transition-colors cursor-pointer ${theme.accentBtn}`}
          >
            أضف للسلة
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
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
        )}
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
                        className={`text-base md:text-lg font-bold pc-price-val ${theme.textMain} focus:outline-none cursor-text`}
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
                          className={`text-xl font-bold pc-price-val ${theme.textMain} focus:outline-none cursor-text`}
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
                          className={`text-base font-bold pc-price-val ${theme.textMain} focus:outline-none cursor-text`}
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
                      className={`text-xl md:text-2xl font-bold pc-price-val ${theme.textMain} focus:outline-none cursor-text`}
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
                      className={`text-2xl font-bold pc-price-val ${theme.textMain} mb-5 pb-4 border-b ${theme.borderClass} focus:outline-none cursor-text`}
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

  // 9. ORDER FORM SECTION (EasyOrders High-Conversion One-Page COD Checkout)
  const renderOrderFormSection = (forceShow = false) => {
    if (!sections.orderForm && !forceShow) return null;

    return (
      <section
        key="orderForm"
        id="order-section"
        className={`relative group/section px-6 md:px-12 py-14 ${theme.surfaceClass}`}
      >
        {renderSectionControlBar('orderForm')}

        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className={`text-xl md:text-2xl font-bold ${theme.textMain} mb-1.5`}>
                نموذج الشراء الفوري (الدفع عند الاستلام)
              </h2>
              <p className={`text-xs ${theme.textMuted}`}>
                اختر العرض والكمية المناسبة لك، وحدد محافظتك لحساب الفاتورة النهائية فوراً بدون تسجيل حساب
              </p>
            </div>
            <span className={`text-[11px] px-2.5 py-1 rounded font-semibold shrink-0 ${theme.badgeBg}`}>
              معاينة الطلب قبل الاستلام
            </span>
          </div>

          {/* Stock Scarcity Indicator */}
          {easyOrder.enableStockScarcity !== false && (
            <div className={`mb-5 p-3.5 rounded ${theme.cardClass} flex items-center justify-between gap-4`}>
              <div className="flex items-center gap-2.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                <span className={theme.textMain}>
                  متبقي <strong>{easyOrder.stockRemaining || 9} قطع فقط</strong> من هذه الدفعة بسعر العرض الحالي
                </span>
              </div>
              <div className="w-24 h-1.5 bg-zinc-200 rounded-full overflow-hidden shrink-0 hidden sm:block">
                <div className="w-1/3 h-full bg-amber-700 rounded-full" />
              </div>
            </div>
          )}

          {/* Instant Order Confirmation Receipt if submitted */}
          {submittedReceipt ? (
            <div className={`p-6 md:p-8 rounded ${theme.cardClass} space-y-5`}>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200/70">
                <div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                    تم تسجيل طلبك بنجاح
                  </span>
                  <h3 className={`text-base font-bold mt-1.5 ${theme.textMain}`}>
                    شكراً لك أ/ {submittedReceipt.customerName} — رقم الطلب ({submittedReceipt.id})
                  </h3>
                </div>
                <div className="text-left">
                  <div className={`text-xs ${theme.textMuted}`}>المطلوب عند الاستلام</div>
                  <div className={`text-lg font-bold pc-price-val ${theme.textMain}`}>
                    {submittedReceipt.totalAmount} {currency}
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded ${theme.surfaceClass} border ${theme.borderClass} text-xs space-y-2`}>
                <div className="flex justify-between">
                  <span className={theme.textMuted}>العرض المختار:</span>
                  <strong className={theme.textMain}>{submittedReceipt.bundleTitle}</strong>
                </div>
                {submittedReceipt.variantSelections?.length > 0 && (
                  <div className="flex justify-between">
                    <span className={theme.textMuted}>المواصفات:</span>
                    <span className={theme.textMain}>{submittedReceipt.variantSelections.join(' + ')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className={theme.textMuted}>عنوان التوصيل:</span>
                  <span className={theme.textMain}>
                    {submittedReceipt.governorate} — {submittedReceipt.address}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => openTrackingPage(submittedReceipt.id, submittedReceipt.customerPhone)}
                  className={`flex-1 py-3 rounded text-xs font-bold cursor-pointer ${theme.accentBtn}`}
                >
                  تتبع حالة طلبك الآن ({submittedReceipt.id}) ←
                </button>
                <button
                  type="button"
                  onClick={() => window.open(submittedReceipt.waUrl, '_blank')}
                  className={`px-4 py-3 rounded text-xs font-semibold cursor-pointer ${theme.secondaryBtn}`}
                >
                  تأكيد عبر واتساب ↗
                </button>
                <button
                  type="button"
                  onClick={() => setSubmittedReceipt(null)}
                  className={`px-4 py-3 rounded text-xs font-semibold cursor-pointer ${theme.secondaryBtn}`}
                >
                  طلب جديد
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendOrder} className={`p-5 md:p-8 rounded ${theme.cardClass} space-y-6`}>
              {/* STEP 1: EASYORDERS TIERED QUANTITY BUNDLES */}
              {easyOrder.enableBundleSelector !== false && cartItems.length === 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={`text-xs font-bold ${theme.textMain}`}>
                      ١. اختر عرض التوفير والكمية (وفّر أكثر مع الباقات):
                    </label>
                    <span className={`text-[11px] ${theme.textMuted}`}>الدفع نقداً عند الاستلام</span>
                  </div>

                  <div className="space-y-2.5">
                    {bundleOffers.map((bundle, bIdx) => {
                      const isChosen = selectedBundleIdx === bIdx;
                      return (
                        <div
                          key={bundle.id || bIdx}
                          onClick={() => setSelectedBundleIdx(bIdx)}
                          className={`p-3.5 md:p-4 rounded border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isChosen
                              ? `border-2 border-current ${theme.surfaceClass}`
                              : `border ${theme.borderClass} hover:opacity-90`
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="easyorder_bundle"
                              checked={isChosen}
                              onChange={() => setSelectedBundleIdx(bIdx)}
                              className="mt-1 accent-zinc-900 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs md:text-sm font-bold ${theme.textMain}`}>
                                  {bundle.title}
                                </span>
                                {bundle.badge && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${theme.badgeBg}`}>
                                    {bundle.badge}
                                  </span>
                                )}
                              </div>
                              <p className={`text-[11px] mt-0.5 ${theme.textMuted}`}>{bundle.subtitle}</p>
                            </div>
                          </div>

                          <div className="text-left shrink-0">
                            <div className={`text-base md:text-lg font-bold pc-price-val ${theme.textMain}`}>
                              {bundle.price} {currency}
                            </div>
                            {bundle.oldPrice > bundle.price && (
                              <div className={`text-[11px] line-through ${theme.textMuted}`}>
                                {bundle.oldPrice} {currency}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Per-Piece Variant Selectors (Piece #1, Piece #2, Piece #3) */}
                  {variantOptions.length > 0 && (
                    <div className={`p-4 rounded ${theme.surfaceClass} border ${theme.borderClass} space-y-3 mt-3`}>
                      <span className={`text-xs font-bold block ${theme.textMain}`}>
                        {easyOrder.variantLabel || 'حدد المواصفات (المقاس / النوع) لكل قطعة:'}
                      </span>
                      <div className="space-y-2">
                        {Array.from({ length: activeQty }, (_, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-3">
                            <span className={`text-xs font-medium w-20 shrink-0 ${theme.textMuted}`}>
                              القطعة #{pIdx + 1}:
                            </span>
                            <select
                              value={pieceVariants[pIdx] || variantOptions[0]}
                              onChange={(e) => handlePieceVariantChange(pIdx, e.target.value)}
                              className={`flex-1 px-3 py-2 rounded text-xs border ${theme.borderClass} ${theme.cardClass} ${theme.textMain} focus:outline-none cursor-pointer`}
                            >
                              {variantOptions.map((opt, oIdx) => (
                                <option key={oIdx} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* If customer selected items from the Catalog above */}
              {cartItems.length > 0 && (
                <div className={`p-4 rounded ${theme.surfaceClass} border ${theme.borderClass} space-y-2.5`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${theme.textMain}`}>
                      المنتجات المختارة من الكتالوج ({cartCount}):
                    </span>
                    <button
                      type="button"
                      onClick={() => setCart({})}
                      className={`text-[11px] underline ${theme.textMuted} cursor-pointer`}
                    >
                      العودة لعروض التوفير والكميات
                    </button>
                  </div>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-1">
                      <span className={theme.textMain}>
                        {item.name} × {item.qty}
                      </span>
                      <span className={`font-semibold ${theme.textMain}`}>
                        {item.lineTotal} {currency}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 2: CUSTOMER SHIPPING DETAILS & GOVERNORATE SELECTOR */}
              <div className="space-y-4 pt-2 border-t border-zinc-200/60">
                <label className={`text-xs font-bold block ${theme.textMain}`}>
                  ٢. بيانات المستلم وعنوان التوصيل:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${theme.textMain}`}>
                      الاسم بالكامل *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثال: محمد أحمد الشافعي"
                      className={`w-full px-3 py-2.5 rounded text-xs border ${theme.borderClass} bg-transparent ${theme.textMain} focus:outline-none`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${theme.textMain}`}>
                      رقم الموبايل (متاح واتساب ومكالمات) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01012345678"
                      className={`w-full px-3 py-2.5 rounded text-xs border ${theme.borderClass} bg-transparent ${theme.textMain} font-mono focus:outline-none`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  <div className="sm:col-span-5">
                    <label className={`block text-[11px] font-medium mb-1 ${theme.textMain}`}>
                      المحافظة (لحساب الشحن تلقائياً) *
                    </label>
                    <select
                      value={selectedGovId}
                      onChange={(e) => setSelectedGovId(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded text-xs border ${theme.borderClass} ${theme.cardClass} ${theme.textMain} focus:outline-none cursor-pointer`}
                    >
                      {shippingRates.map((gov) => (
                        <option key={gov.id} value={gov.id}>
                          {gov.name} ({isFreeShipping ? 'شحن مجاني' : `${gov.fee} ${currency}`})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-7">
                    <label className={`block text-[11px] font-medium mb-1 ${theme.textMain}`}>
                      العنوان بالتفصيل (المنطقة، الشارع، رقم العقار) *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="الحي، اسم الشارع، علامة مميزة بجوار المنزل..."
                      className={`w-full px-3 py-2.5 rounded text-xs border ${theme.borderClass} bg-transparent ${theme.textMain} focus:outline-none`}
                    />
                  </div>
                </div>

                {/* Delivery Notes & Payment Method Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1">
                  <div className="sm:col-span-6">
                    <label className={`block text-[11px] font-medium mb-1 ${theme.textMain}`}>
                      طريقة الدفع المفضلة
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`px-3 py-2 rounded text-[11px] font-semibold border transition-all cursor-pointer text-right ${
                          paymentMethod === 'cod'
                            ? `border-2 border-current ${theme.surfaceClass} ${theme.textMain}`
                            : `${theme.borderClass} ${theme.textMuted}`
                        }`}
                      >
                        الدفع عند الاستلام (COD)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('instapay')}
                        className={`px-3 py-2 rounded text-[11px] font-semibold border transition-all cursor-pointer text-right ${
                          paymentMethod === 'instapay'
                            ? `border-2 border-current ${theme.surfaceClass} ${theme.textMain}`
                            : `${theme.borderClass} ${theme.textMuted}`
                        }`}
                      >
                        إنستاباي / محفظة
                      </button>
                    </div>
                  </div>
                  <div className="sm:col-span-6">
                    <label className={`block text-[11px] font-medium mb-1 ${theme.textMain}`}>
                      ملاحظات التوصيل للمندوب (اختياري)
                    </label>
                    <input
                      type="text"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="مثال: الاتصال قبل الوصول بنصف ساعة، الدور الثالث..."
                      className={`w-full px-3 py-2 rounded text-xs border ${theme.borderClass} bg-transparent ${theme.textMain} focus:outline-none`}
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: ONE-CLICK ORDER BUMP (UPSELL) */}
              {easyOrder.enableOrderBump !== false && easyOrder.orderBump && (
                <label
                  className={`p-4 rounded border-2 border-dashed ${theme.borderClass} ${theme.surfaceClass} flex items-start gap-3 cursor-pointer transition-colors`}
                >
                  <input
                    type="checkbox"
                    checked={includeOrderBump}
                    onChange={(e) => setIncludeOrderBump(e.target.checked)}
                    className="mt-1 accent-zinc-900 w-4 h-4 cursor-pointer shrink-0"
                  />
                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`font-bold ${theme.textMain}`}>
                        عرض خاص إضافي: {easyOrder.orderBump.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${theme.badgeBg}`}>
                        +{easyOrder.orderBump.price} {currency} فقط
                      </span>
                    </div>
                    <p className={`text-[11px] ${theme.textMuted}`}>{easyOrder.orderBump.desc}</p>
                  </div>
                </label>
              )}

              {/* STEP 4: PROMO CODE + LIVE COD INVOICE SUMMARY */}
              <div className={`p-4 rounded ${theme.surfaceClass} border ${theme.borderClass} space-y-3`}>
                {/* Collapsible Promo Code Trigger */}
                {!showPromoInput && !promoApplied ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowPromoInput(true)}
                      className={`text-[11px] underline ${theme.textMuted} hover:opacity-80 cursor-pointer`}
                    >
                      + هل لديك كود خصم؟
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pb-3 border-b border-zinc-200/60">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder={`أدخل الكود (مثال: ${pageData.promoCode || 'WELCOME10'})`}
                      className={`flex-1 px-3 py-1.5 rounded text-xs border ${theme.borderClass} bg-transparent ${theme.textMain} focus:outline-none`}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className={`px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer ${theme.secondaryBtn}`}
                    >
                      تطبيق
                    </button>
                  </div>
                )}
                {promoError && <div className="text-[11px] text-amber-800">{promoError}</div>}
                {promoApplied && (
                  <div className="text-[11px] text-emerald-800 font-semibold">
                    تم تفعيل كود الخصم ({pageData.promoDiscountPercent || 10}%) بنجاح!
                  </div>
                )}

                {/* Itemized COD Invoice Breakdown */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className={theme.textMuted}>قيمة العرض / المنتجات:</span>
                    <span className={`font-semibold ${theme.textMain}`}>
                      {baseOrderSubtotal} {currency}
                    </span>
                  </div>

                  {includeOrderBump && easyOrder.enableOrderBump !== false && (
                    <div className="flex justify-between">
                      <span className={theme.textMuted}>الإضافة الخاصة:</span>
                      <span className={`font-semibold ${theme.textMain}`}>
                        +{bumpFee} {currency}
                      </span>
                    </div>
                  )}

                  {promoApplied && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-semibold">
                      <span>قيمة الخصم ({discountPercent}%):</span>
                      <span>
                        -{discountAmount} {currency}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className={theme.textMuted}>
                      شحن ({activeGov.name} — {activeGov.days}):
                    </span>
                    <span className={`font-semibold ${theme.textMain}`}>
                      {isFreeShipping ? (
                        <span>
                          <span className="line-through opacity-50 ml-1.5">
                            {activeGov.fee} {currency}
                          </span>
                          <strong className="text-emerald-800">شحن مجاني</strong>
                        </span>
                      ) : (
                        `${effectiveShippingFee} ${currency}`
                      )}
                    </span>
                  </div>

                  <div className={`pt-2.5 mt-2 border-t ${theme.borderClass} flex items-center justify-between`}>
                    <span className={`text-xs md:text-sm font-bold ${theme.textMain}`}>
                      الإجمالي المطلوب عند الاستلام:
                    </span>
                    <span className={`text-lg md:text-xl font-bold pc-price-val ${theme.textMain}`}>
                      {finalTotal} {currency}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 rounded text-xs md:text-sm font-bold transition-colors cursor-pointer ${theme.accentBtn}`}
              >
                {orderSubmitted
                  ? 'تم تسجيل طلبك بنجاح!'
                  : `تأكيد الطلب الآن — الدفع عند الاستلام (${finalTotal} ${currency})`}
              </button>
            </form>
          )}
        </div>
      </section>
    );
  };

  // ============================================================================
  // MULTI-PAGE STOREFRONT RENDERERS:
  // 1. Product Details Page (صفحة تفاصيل المنتج)
  // 2. Dedicated Checkout Page (صفحة إتمام الطلب والدفع)
  // 3. Order Tracking Page by Phone & Order ID (صفحة تتبع الطلب)
  // ============================================================================
  const renderProductDetailsPage = () => {
    const prod = activeProduct || {
      id: 'default-prod',
      name: pageData.brandName || 'المنتج الرئيسي',
      category: pageData.category || 'الإصدار الأساسي',
      price: bundleOffers[0]?.price || '450',
      oldPrice: bundleOffers[0]?.oldPrice || '600',
      badge: 'الأكثر مبيعاً',
      desc: pageData.subheadline || 'منتج أصلي عالي الجودة مصمم بعناية فائقة لتلبية احتياجاتك اليومية.',
      imageUrl: pageData.heroImageUrl,
    };

    const relatedProducts = products.filter((p) => p.id !== prod.id).slice(0, 3);
    const galleryImages = [
      prod.imageUrl || pageData.heroImageUrl,
      pageData.heroImageUrl || prod.imageUrl,
      products[(products.findIndex((p) => p.id === prod.id) + 1) % Math.max(1, products.length)]?.imageUrl ||
        prod.imageUrl,
    ].filter(Boolean);

    const activeGalleryImg = galleryImages[activeThumbIdx] || galleryImages[0];
    const prodPriceNum = parsePrice(prod.price);
    const prodOldPriceNum = parsePrice(prod.oldPrice);
    const savingsVal = prodOldPriceNum > prodPriceNum ? prodOldPriceNum - prodPriceNum : 0;

    return (
      <section className={`px-6 @md:px-14 py-8 @md:py-12 border-b ${theme.borderClass}`}>
        {/* Breadcrumb & Quick Product Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-200/60">
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setStorePage('home')}
              className={`${theme.textMuted} hover:${theme.textMain} cursor-pointer underline`}
            >
              الرئيسية
            </button>
            <span className={theme.textMuted}>/</span>
            <span className={theme.textMuted}>{prod.category || 'المنتجات'}</span>
            <span className={theme.textMuted}>/</span>
            <strong className={theme.textMain}>{prod.name}</strong>
          </div>

          {products.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] ${theme.textMuted}`}>تصفح منتج آخر:</span>
              {products.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedProductId(item.id);
                    setActiveThumbIdx(0);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    item.id === prod.id ? theme.accentBtn : `${theme.surfaceClass} ${theme.textMain}`
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main 2-Column Product Details Layout */}
        <div className="grid grid-cols-1 @md:grid-cols-12 gap-8 items-start">
          {/* Right/Left Column: Interactive Image Gallery */}
          <div className="@md:col-span-6 space-y-3">
            <div className={`rounded-lg overflow-hidden border ${theme.borderClass} ${theme.surfaceClass} relative`}>
              {prod.badge && (
                <span className={`absolute top-3 right-3 z-10 text-xs px-3 py-1 rounded font-bold ${theme.badgeBg}`}>
                  {prod.badge}
                </span>
              )}
              <img
                src={activeGalleryImg}
                alt={prod.name}
                className="w-full h-[290px] @md:h-[390px] object-cover block"
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="grid grid-cols-3 gap-2.5">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveThumbIdx(idx)}
                    className={`rounded overflow-hidden border-2 transition-all cursor-pointer h-20 ${
                      activeThumbIdx === idx
                        ? 'border-zinc-900 opacity-100'
                        : `${theme.borderClass} opacity-65 hover:opacity-95`
                    }`}
                  >
                    <img src={imgUrl} alt={`${prod.name} ${idx + 1}`} className="w-full h-full object-cover block" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details, Variants, Bundle Offers & Direct Checkout Actions */}
          <div className="@md:col-span-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[11px] px-2.5 py-0.5 rounded font-medium ${theme.badgeBg}`}>
                  {prod.category || pageData.category || 'إصدار حصري'}
                </span>
                <span className="text-[11px] text-amber-600 font-bold">★ 4.9 (تقييم موثق من العملاء)</span>
                <span className="text-[11px] text-emerald-700 font-semibold">• متوفر للشحن الفوري</span>
              </div>

              <h1
                contentEditable={!isFullscreen}
                suppressContentEditableWarning
                onBlur={(e) => handleProductUpdate(prod.id, 'name', e.currentTarget.innerText)}
                className={`text-2xl @md:text-3xl font-bold ${theme.textMain} focus:outline-none cursor-text`}
              >
                {prod.name}
              </h1>

              <div className="flex items-baseline gap-3 mt-3">
                <span className={`text-2xl font-bold pc-price-val ${theme.textMain}`}>
                  {prod.price} {currency}
                </span>
                {prod.oldPrice && (
                  <span className={`text-sm line-through ${theme.textMuted}`}>
                    {prod.oldPrice} {currency}
                  </span>
                )}
                {savingsVal > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                    وفّر {savingsVal} {currency}
                  </span>
                )}
              </div>
            </div>

            <p
              contentEditable={!isFullscreen}
              suppressContentEditableWarning
              onBlur={(e) => handleProductUpdate(prod.id, 'desc', e.currentTarget.innerText)}
              className={`text-sm leading-relaxed ${theme.textMuted} focus:outline-none cursor-text`}
            >
              {prod.desc}
            </p>

            {/* Tiered Quantity Bundles inside Product Page */}
            {easyOrder.enableBundleSelector !== false && (
              <div className={`p-4 rounded ${theme.surfaceClass} border ${theme.borderClass} space-y-2.5`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${theme.textMain}`}>اختر عرض التوفير والكمية:</span>
                  <span className={`text-[11px] ${theme.textMuted}`}>خصم إضافي للكميات</span>
                </div>
                <div className="space-y-2">
                  {bundleOffers.map((bundle, bIdx) => {
                    const isChosen = selectedBundleIdx === bIdx;
                    return (
                      <div
                        key={bundle.id || bIdx}
                        onClick={() => setSelectedBundleIdx(bIdx)}
                        className={`p-3 rounded border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isChosen
                            ? `border-2 border-current ${theme.cardClass}`
                            : `border ${theme.borderClass} hover:opacity-90`
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="product_page_bundle"
                            checked={isChosen}
                            onChange={() => setSelectedBundleIdx(bIdx)}
                            className="accent-zinc-900 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-xs font-bold ${theme.textMain}`}>{bundle.title}</span>
                              {bundle.badge && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${theme.badgeBg}`}>
                                  {bundle.badge}
                                </span>
                              )}
                            </div>
                            <span className={`text-[11px] block ${theme.textMuted}`}>{bundle.subtitle}</span>
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <span className={`text-sm font-bold ${theme.textMain}`}>
                            {bundle.price} {currency}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variant Selection per Piece */}
            {variantOptions.length > 0 && (
              <div className={`p-4 rounded ${theme.cardClass} space-y-2.5`}>
                <span className={`text-xs font-bold block ${theme.textMain}`}>
                  {easyOrder.variantLabel || 'حدد المواصفات المطلوبة:'}
                </span>
                <div className="space-y-2">
                  {Array.from({ length: activeQty }, (_, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2.5">
                      <span className={`text-xs font-medium w-20 shrink-0 ${theme.textMuted}`}>
                        القطعة #{pIdx + 1}:
                      </span>
                      <select
                        value={pieceVariants[pIdx] || variantOptions[0]}
                        onChange={(e) => handlePieceVariantChange(pIdx, e.target.value)}
                        className={`flex-1 px-3 py-2 rounded text-xs border ${theme.borderClass} ${theme.surfaceClass} ${theme.textMain} focus:outline-none cursor-pointer`}
                      >
                        {variantOptions.map((opt, oIdx) => (
                          <option key={oIdx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Primary CTA Buttons: Buy Now (Jump to Checkout) + Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => openCheckoutPage()}
                className={`flex-1 py-3.5 px-5 rounded text-xs md:text-sm font-bold cursor-pointer transition-colors ${theme.accentBtn}`}
              >
                اشترِ الآن — الدفع عند الاستلام ({finalTotal} {currency})
              </button>
              <button
                type="button"
                onClick={() => handleCartDelta(prod.id, 1)}
                className={`py-3.5 px-4 rounded text-xs font-semibold cursor-pointer transition-colors ${theme.secondaryBtn}`}
              >
                + أضف للسلة ({cart[prod.id] || 0})
              </button>
            </div>

            {/* Trust & Shipping Guarantees */}
            <div className={`grid grid-cols-3 gap-2 pt-2 text-center text-[11px] ${theme.textMuted}`}>
              <div className={`p-2.5 rounded ${theme.surfaceClass} border ${theme.borderClass}`}>
                <strong className={`block ${theme.textMain}`}>الدفع عند الاستلام</strong>
                <span>معاينة قبل الدفع</span>
              </div>
              <div className={`p-2.5 rounded ${theme.surfaceClass} border ${theme.borderClass}`}>
                <strong className={`block ${theme.textMain}`}>شحن سريع</strong>
                <span>خلال ٢ - ٤ أيام عمل</span>
              </div>
              <div className={`p-2.5 rounded ${theme.surfaceClass} border ${theme.borderClass}`}>
                <strong className={`block ${theme.textMain}`}>استبدال مجاني</strong>
                <span>ضمان ١٤ يوماً</span>
              </div>
            </div>

            {/* Detailed Product Tabs: Specifications / Shipping / Customer Reviews */}
            <div className={`pt-3 border-t ${theme.borderClass}`}>
              <div className="flex items-center gap-2 mb-3">
                {[
                  { id: 'specs', label: 'المواصفات والتفاصيل' },
                  { id: 'shipping', label: 'سياسة الشحن والاستبدال' },
                  { id: 'reviews', label: 'تقييمات المشترين' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setProductInfoTab(tab.id)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                      productInfoTab === tab.id ? theme.accentBtn : `${theme.surfaceClass} ${theme.textMuted}`
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className={`p-4 rounded ${theme.surfaceClass} border ${theme.borderClass} text-xs space-y-2`}>
                {productInfoTab === 'specs' && (
                  <ul className={`space-y-1.5 list-disc list-inside ${theme.textMain}`}>
                    <li>المنتج: {prod.name} — أصلي ومضمون ١٠٠٪ من {pageData.brandName}.</li>
                    <li>الخامات والجودة: مصنع وفق أعلى معايير الجودة مع تغليف محكم يحافظ على المنتج.</li>
                    {(pageData.features || []).slice(0, 2).map((f, idx) => (
                      <li key={idx}>
                        {f.title}: {f.desc}
                      </li>
                    ))}
                  </ul>
                )}
                {productInfoTab === 'shipping' && (
                  <div className={`space-y-1.5 ${theme.textMain}`}>
                    <p>• يتم توصيل الطلبات لجميع المحافظات خلال ٢ إلى ٤ أيام عمل.</p>
                    <p>
                      • الشحن مجاني للطلبات فوق {freeShippingThreshold} {currency}.
                    </p>
                    <p>• يحق للعميل معاينة الطلب والتأكد من مطابقته للمواصفات قبل سداد المبلغ للمندوب.</p>
                  </div>
                )}
                {productInfoTab === 'reviews' && (
                  <div className="space-y-2.5">
                    <div className={`p-2.5 rounded ${theme.cardClass}`}>
                      <div className="flex items-center justify-between mb-1">
                        <strong className={theme.textMain}>{pageData.testimonialAuthor || 'عميل موثق'}</strong>
                        <span className="text-amber-600 font-bold">★★★★★</span>
                      </div>
                      <p className={theme.textMuted}>
                        "{pageData.testimonialQuote || 'جودة ممتازة وتوصيل سريع جداً والتغليف فوق الرائع.'}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className={`mt-12 pt-8 border-t ${theme.borderClass}`}>
            <h2 className={`text-lg font-bold mb-4 ${theme.textMain}`}>منتجات أخرى قد تعجبك من {pageData.brandName}</h2>
            <div className="grid grid-cols-1 @sm:grid-cols-3 gap-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => openProductDetails(rel.id)}
                  className={`p-3.5 rounded ${theme.cardClass} cursor-pointer hover:opacity-95 transition-opacity flex flex-col justify-between`}
                >
                  <div>
                    {rel.imageUrl && (
                      <img src={rel.imageUrl} alt={rel.name} className="w-full h-36 object-cover rounded mb-3" />
                    )}
                    <h3 className={`text-sm font-bold ${theme.textMain}`}>{rel.name}</h3>
                    <p className={`text-xs mt-1 line-clamp-2 ${theme.textMuted}`}>{rel.desc}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-200/50">
                    <span className={`text-sm font-bold ${theme.textMain}`}>
                      {rel.price} {currency}
                    </span>
                    <span className={`text-[11px] underline ${theme.textMain}`}>عرض التفاصيل ←</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  };

  // 2. Dedicated Checkout Page (صفحة إتمام الطلب والدفع)
  const renderCheckoutPage = () => {
    return (
      <div className="py-4">
        <div className="px-6 @md:px-14 pt-4 pb-2 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setStorePage('home')}
              className={`${theme.textMuted} hover:${theme.textMain} cursor-pointer underline`}
            >
              الرئيسية
            </button>
            <span className={theme.textMuted}>/</span>
            <button
              type="button"
              onClick={() => setStorePage('product')}
              className={`${theme.textMuted} hover:${theme.textMain} cursor-pointer underline`}
            >
              تفاصيل المنتج
            </button>
            <span className={theme.textMuted}>/</span>
            <strong className={theme.textMain}>صفحة إتمام الطلب والدفع (Checkout)</strong>
          </div>

          <button
            type="button"
            onClick={() => openTrackingPage()}
            className={`text-xs px-3 py-1.5 rounded font-semibold cursor-pointer ${theme.secondaryBtn}`}
          >
            لديك طلب سابق؟ تتبع طلبك برقم الأوردر أو الهاتف ←
          </button>
        </div>

        {/* Render the Full Checkout Form & Live Invoice */}
        {renderOrderFormSection(true)}
      </div>
    );
  };

  // 3. Dedicated Order Tracking Page by Phone & Order ID (صفحة تتبع الطلب)
  const renderOrderTrackingPage = () => {
    const sampleOrders = getAllStoreOrders().slice(0, 3);
    const statusOrder = ['new', 'confirmed', 'shipped', 'delivered'];
    const currentStatusIdx = trackedOrderResult
      ? Math.max(0, statusOrder.indexOf(trackedOrderResult.status || 'new'))
      : 0;

    const statusSteps = [
      { key: 'new', title: 'تم استلام الطلب', desc: 'تم تسجيل الطلب في النظام ومراجعة الأصناف' },
      { key: 'confirmed', title: 'تم التأكيد هاتفياً', desc: 'تم التواصل مع العميل وتجهيز الشحنة للتغليف' },
      { key: 'shipped', title: 'خرج مع شركة الشحن', desc: 'الشحنة في الطريق إليك مع مندوب التوصيل' },
      { key: 'delivered', title: 'تم التسليم بنجاح', desc: 'تم استلام الطلب وسداد قيمة الفاتورة' },
    ];

    return (
      <section className={`px-6 @md:px-14 py-10 @md:py-14 border-b ${theme.borderClass}`}>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/70">
            <div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded font-bold ${theme.badgeBg}`}>
                خدمة تتبع الشحنات الفورية
              </span>
              <h1 className={`text-2xl @md:text-3xl font-bold mt-2 ${theme.textMain}`}>
                تتبع حالة طلبك برقم الأوردر أو رقم الهاتف
              </h1>
              <p className={`text-xs mt-1 ${theme.textMuted}`}>
                أدخل رقم الطلب (مثال: ORD-1041) أو رقم الموبايل المسجل في الطلب لمعرفة مرحلة الشحن الحالية فوراً
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStorePage('home')}
              className={`px-3.5 py-2 rounded text-xs font-semibold shrink-0 cursor-pointer ${theme.secondaryBtn}`}
            >
              ← العودة للمتجر
            </button>
          </div>

          {/* Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runOrderSearch(trackOrderId, trackPhone);
            }}
            className={`p-5 @md:p-6 rounded ${theme.cardClass} space-y-4`}
          >
            <div className="grid grid-cols-1 @sm:grid-cols-12 gap-3.5">
              <div className="@sm:col-span-5">
                <label className={`block text-xs font-bold mb-1.5 ${theme.textMain}`}>
                  رقم الطلب (Order ID)
                </label>
                <input
                  type="text"
                  value={trackOrderId}
                  onChange={(e) => setTrackOrderId(e.target.value)}
                  placeholder="مثال: ORD-1041"
                  dir="ltr"
                  className={`w-full px-3.5 py-2.5 rounded text-xs border ${theme.borderClass} bg-transparent ${theme.textMain} focus:outline-none text-right`}
                />
              </div>

              <div className="@sm:col-span-5">
                <label className={`block text-xs font-bold mb-1.5 ${theme.textMain}`}>
                  رقم الهاتف المسجل بالطلب
                </label>
                <input
                  type="tel"
                  value={trackPhone}
                  onChange={(e) => setTrackPhone(e.target.value)}
                  placeholder="01012345678"
                  dir="ltr"
                  className={`w-full px-3.5 py-2.5 rounded text-xs border ${theme.borderClass} bg-transparent ${theme.textMain} focus:outline-none text-right`}
                />
              </div>

              <div className="@sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className={`w-full py-2.5 px-4 rounded text-xs font-bold cursor-pointer transition-colors ${theme.accentBtn}`}
                >
                  بحث وتتبع
                </button>
              </div>
            </div>

            {/* Quick Sample Order Pills for Immediate Testing */}
            {sampleOrders.length > 0 && (
              <div className="pt-2 border-t border-zinc-200/60 flex items-center gap-2 flex-wrap text-[11px]">
                <span className={theme.textMuted}>جرب الاستعلام السريع عن طلب مسجل:</span>
                {sampleOrders.map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setTrackOrderId(ord.id);
                      setTrackPhone(ord.customerPhone);
                      runOrderSearch(ord.id, ord.customerPhone);
                    }}
                    className={`px-2.5 py-1 rounded border ${theme.borderClass} ${theme.surfaceClass} ${theme.textMain} hover:opacity-80 cursor-pointer font-medium`}
                  >
                    #{ord.id} ({ord.customerPhone})
                  </button>
                ))}
              </div>
            )}

            {trackError && (
              <div className="p-3 rounded bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
                {trackError}
              </div>
            )}
          </form>

          {/* Tracked Order Result Timeline & Shipment Card */}
          {trackedOrderResult && (
            <div className={`p-6 @md:p-8 rounded ${theme.cardClass} space-y-6`}>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200/70">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900">
                      طلب مسجل #{trackedOrderResult.id}
                    </span>
                    <span className={`text-xs ${theme.textMuted}`}>
                      بتاريخ {new Date(trackedOrderResult.createdAt || Date.now()).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <h2 className={`text-lg font-bold mt-1.5 ${theme.textMain}`}>
                    العميل: {trackedOrderResult.customerName} ({trackedOrderResult.customerPhone})
                  </h2>
                </div>

                <div className="text-left">
                  <span className={`text-[11px] block ${theme.textMuted}`}>إجمالي الفاتورة عند الاستلام</span>
                  <strong className={`text-lg font-bold pc-price-val ${theme.textMain}`}>
                    {trackedOrderResult.totalAmount} {trackedOrderResult.currency || currency}
                  </strong>
                </div>
              </div>

              {/* 4-Stage Visual Shipping Progress Stepper */}
              <div className="grid grid-cols-1 @sm:grid-cols-4 gap-3">
                {statusSteps.map((step, idx) => {
                  const isDone = idx <= currentStatusIdx;
                  const isCurrent = idx === currentStatusIdx;
                  return (
                    <div
                      key={step.key}
                      className={`p-3.5 rounded border transition-all ${
                        isCurrent
                          ? `border-2 border-emerald-700 ${theme.surfaceClass}`
                          : isDone
                          ? `border-emerald-600/50 ${theme.surfaceClass}`
                          : `${theme.borderClass} opacity-50`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                            isDone ? 'bg-emerald-700 text-white' : 'bg-zinc-200 text-zinc-700'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                            المرحلة الحالية
                          </span>
                        )}
                      </div>
                      <h3 className={`text-xs font-bold ${theme.textMain}`}>{step.title}</h3>
                      <p className={`text-[11px] mt-1 leading-relaxed ${theme.textMuted}`}>{step.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Full Order & Delivery Details */}
              <div className={`p-4 rounded ${theme.surfaceClass} border ${theme.borderClass} grid grid-cols-1 @sm:grid-cols-2 gap-3 text-xs`}>
                <div>
                  <span className={`block text-[11px] ${theme.textMuted}`}>العرض / المنتجات المطلوبة:</span>
                  <strong className={theme.textMain}>{trackedOrderResult.bundleTitle}</strong>
                  {trackedOrderResult.variantSelections?.length > 0 && (
                    <p className={`text-[11px] mt-0.5 ${theme.textMuted}`}>
                      المواصفات: {trackedOrderResult.variantSelections.join(' + ')}
                    </p>
                  )}
                </div>
                <div>
                  <span className={`block text-[11px] ${theme.textMuted}`}>عنوان التوصيل المسجل:</span>
                  <strong className={theme.textMain}>
                    {trackedOrderResult.governorate} — {trackedOrderResult.address}
                  </strong>
                  <p className={`text-[11px] mt-0.5 ${theme.textMuted}`}>
                    طريقة الدفع:{' '}
                    {trackedOrderResult.paymentMethod === 'instapay'
                      ? 'إنستاباي / محفظة إلكترونية'
                      : 'الدفع نقداً عند الاستلام (COD)'}
                  </p>
                </div>
              </div>
            </div>
          )}
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
    : isMobile
    ? 'w-[375px] max-w-full rounded-[34px] border-[7px] border-zinc-800 shadow-2xl my-3 bg-zinc-900'
    : 'w-full max-w-5xl rounded-lg border border-zinc-300/90 shadow-sm my-2';

  const heroFontPx = isMobile ? Math.max(20, Math.round(typography.heroSize * 0.72)) : typography.heroSize;
  const sectionFontPx = isMobile ? Math.max(17, Math.round(typography.sectionSize * 0.84)) : typography.sectionSize;
  const cardTitleFontPx = isMobile ? Math.max(13, Math.round(typography.cardTitleSize * 0.92)) : typography.cardTitleSize;
  const bodyFontPx = isMobile ? Math.max(12, Math.round(typography.bodySize * 0.94)) : typography.bodySize;
  const priceFontPx = isMobile ? Math.max(15, Math.round(typography.priceSize * 0.88)) : typography.priceSize;

  return (
    <div className={`@container mx-auto transition-all duration-300 overflow-hidden ${containerWidth}`}>
      {/* Phone Speaker Notch when in Mobile View */}
      {isMobile && (
        <div className="bg-zinc-900 py-2 flex items-center justify-center">
          <div className="w-20 h-1.5 rounded-full bg-zinc-700" />
        </div>
      )}

      {/* Dynamic Typography, Custom Brand Colors & Mobile Responsiveness Scoped Styles */}
      <style>{`
        .pagecraft-canvas,
        .pagecraft-canvas * {
          font-family: ${activeFontFamily} !important;
        }
        .pagecraft-canvas h1 {
          font-size: ${heroFontPx}px !important;
          line-height: 1.32 !important;
        }
        .pagecraft-canvas h2 {
          font-size: ${sectionFontPx}px !important;
          line-height: 1.38 !important;
        }
        .pagecraft-canvas h3 {
          font-size: ${cardTitleFontPx}px !important;
          line-height: 1.42 !important;
        }
        .pagecraft-canvas p,
        .pagecraft-canvas li,
        .pagecraft-canvas blockquote p {
          font-size: ${bodyFontPx}px !important;
          line-height: 1.65 !important;
        }
        .pagecraft-canvas .pc-price-val {
          font-size: ${priceFontPx}px !important;
        }
        ${customColors.enabled ? `
        .pagecraft-canvas,
        .pagecraft-canvas header {
          background-color: ${customColors.background} !important;
          color: ${customColors.text} !important;
        }
        .pagecraft-canvas h1,
        .pagecraft-canvas h2,
        .pagecraft-canvas h3,
        .pagecraft-canvas strong,
        .pagecraft-canvas .pc-price-val {
          color: ${customColors.text} !important;
        }
        .pagecraft-canvas [class*="bg-white"],
        .pagecraft-canvas [class*="bg-[#1C1C1A]"] {
          background-color: ${customColors.surface} !important;
        }
        .pagecraft-canvas button[class*="bg-[#1A1917]"],
        .pagecraft-canvas button[class*="bg-zinc-900"],
        .pagecraft-canvas button[class*="bg-[#1B3B2B]"],
        .pagecraft-canvas button[class*="bg-[#F2F0EC]"] {
          background-color: ${customColors.primary} !important;
          color: #ffffff !important;
        }
        ` : ''}
        ${isMobile ? `
        .pagecraft-mobile-mode section,
        .pagecraft-mobile-mode section > div {
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }
        .pagecraft-mobile-mode section {
          padding-top: 2rem !important;
          padding-bottom: 2rem !important;
        }
        .pagecraft-mobile-mode .grid {
          grid-template-columns: minmax(0, 1fr) !important;
          gap: 1rem !important;
        }
        .pagecraft-mobile-mode [class*="md:col-span-"] {
          grid-column: span 1 / span 1 !important;
        }
        .pagecraft-mobile-mode [class*="sm:flex-row"],
        .pagecraft-mobile-mode [class*="md:flex-row"] {
          flex-direction: column !important;
          align-items: stretch !important;
        }
        .pagecraft-mobile-mode .pc-stats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 0.75rem !important;
        }
        .pagecraft-mobile-mode img {
          max-height: 210px !important;
        }
        ` : ''}
      `}</style>

      <div
        className={`pagecraft-canvas ${isMobile ? 'pagecraft-mobile-mode' : ''} min-h-screen ${theme.bgClass} flex flex-col transition-colors duration-300 relative`}
        style={{ fontFamily: activeFontFamily }}
      >
        {/* Top Announcement Bar */}
        {sections.announcement && pageData.announcement && (
          <div className={`px-3 py-2 text-center text-[11px] border-b ${theme.borderClass} ${theme.surfaceClass}`}>
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

        {/* Navigation Bar — Multi-Page Storefront Header (Home | Product | Checkout | Tracking) */}
        <header className={`border-b ${theme.borderClass} ${isMobile ? 'px-4 py-3' : 'px-6 @md:px-12 py-3.5'} sticky top-0 z-20 ${theme.bgClass}/95 backdrop-blur-sm`}>
          <div className="flex items-center justify-between gap-3">
            {/* Zone 1 (Right): Brand Identity */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                contentEditable={!isFullscreen}
                suppressContentEditableWarning
                onClick={() => setStorePage('home')}
                onBlur={(e) => onUpdateField('brandName', e.currentTarget.innerText)}
                className={`font-bold ${isMobile ? 'text-sm' : 'text-base @md:text-lg'} tracking-tight ${theme.textMain} focus:outline-none cursor-pointer truncate`}
              >
                {pageData.brandName || 'اسم المشروع'}
              </span>
              {!isMobile && pageData.category && (
                <span className={`hidden @md:inline-block text-[10px] px-2 py-0.5 rounded ${theme.badgeBg} font-medium`}>
                  {pageData.category}
                </span>
              )}
            </div>

            {/* Zone 2 (Center): 4-Page Storefront Navigation Tabs */}
            {!isMobile && (
              <nav className={`hidden @md:flex items-center justify-center gap-1.5 p-1 rounded border ${theme.borderClass} ${theme.surfaceClass} text-xs`}>
                {[
                  { id: 'home', label: 'الرئيسية', action: () => setStorePage('home') },
                  { id: 'product', label: 'تفاصيل المنتج', action: () => openProductDetails(selectedProductId || products[0]?.id) },
                  { id: 'checkout', label: cartCount > 0 ? `إتمام الطلب (${cartCount})` : 'إتمام الطلب', action: () => openCheckoutPage() },
                  { id: 'tracking', label: 'تتبع طلبك', action: () => openTrackingPage() },
                ].map((tab) => {
                  const isActive = storePage === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={tab.action}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? theme.accentBtn
                          : `${theme.textMuted} hover:${theme.textMain}`
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Zone 3 (Left): Quick Track & Primary Checkout Action */}
            <div className="flex items-center gap-2 shrink-0">
              {!isMobile && (
                <button
                  type="button"
                  onClick={() => openTrackingPage()}
                  className={`text-[11px] px-2.5 py-1.5 rounded font-semibold border ${theme.borderClass} ${theme.surfaceClass} ${theme.textMain} cursor-pointer hover:opacity-85`}
                >
                  تتبع شحنتك
                </button>
              )}
              {cartCount > 0 && (
                <button
                  type="button"
                  onClick={() => openCheckoutPage()}
                  className={`text-[11px] px-2.5 py-1.5 rounded font-semibold border ${theme.borderClass} ${theme.surfaceClass} ${theme.textMain} cursor-pointer`}
                >
                  {isMobile ? `السلة (${cartCount})` : `السلة (${cartCount}) — ${cartSubtotal} ${currency}`}
                </button>
              )}
              <button
                type="button"
                onClick={() => openCheckoutPage()}
                className={`text-xs ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'} rounded font-semibold transition-colors cursor-pointer ${theme.accentBtn}`}
              >
                إتمام الطلب
              </button>
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`px-2 py-1.5 rounded border ${theme.borderClass} text-xs font-bold ${theme.textMain} cursor-pointer`}
                  title="صفحات المتجر"
                >
                  {mobileMenuOpen ? '×' : '☰'}
                </button>
              )}
            </div>
          </div>

          {/* Mobile 4-Page Storefront Switcher Bar (Always accessible on Mobile) */}
          {isMobile && (
            <div className={`mt-2.5 pt-2 border-t ${theme.borderClass} grid grid-cols-4 gap-1 text-[10px]`}>
              {[
                { id: 'home', label: 'الرئيسية', action: () => setStorePage('home') },
                { id: 'product', label: 'المنتج', action: () => openProductDetails(selectedProductId || products[0]?.id) },
                { id: 'checkout', label: 'الدفع', action: () => openCheckoutPage() },
                { id: 'tracking', label: 'تتبع طلبك', action: () => openTrackingPage() },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={tab.action}
                  className={`py-1.5 px-1 rounded font-bold text-center cursor-pointer transition-colors ${
                    storePage === tab.id ? theme.accentBtn : `${theme.surfaceClass} ${theme.textMain}`
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Collapsible Mobile Section Drawer */}
          {isMobile && mobileMenuOpen && (
            <nav className={`mt-2.5 pt-2.5 border-t ${theme.borderClass} flex flex-wrap gap-2 text-xs ${theme.textMain}`}>
              {sections.catalog && (
                <button
                  onClick={() => {
                    scrollToSection('catalog-section');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded ${theme.surfaceClass} cursor-pointer`}
                >
                  المعروضات
                </button>
              )}
              {sections.features && (
                <button
                  onClick={() => {
                    scrollToSection('features-section');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded ${theme.surfaceClass} cursor-pointer`}
                >
                  المميزات
                </button>
              )}
              {sections.pricing && (
                <button
                  onClick={() => {
                    scrollToSection('pricing-section');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded ${theme.surfaceClass} cursor-pointer`}
                >
                  الباقات والأسعار
                </button>
              )}
              {sections.faq && (
                <button
                  onClick={() => {
                    scrollToSection('faq-section');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded ${theme.surfaceClass} cursor-pointer`}
                >
                  الأسئلة الشائعة
                </button>
              )}
            </nav>
          )}
        </header>

        {/* Render Active Storefront Page: Home vs Product Details vs Checkout vs Order Tracking */}
        {storePage === 'product' ? (
          renderProductDetailsPage()
        ) : storePage === 'checkout' ? (
          renderCheckoutPage()
        ) : storePage === 'tracking' ? (
          renderOrderTrackingPage()
        ) : (
          sectionOrder.map((secKey) => {
            const renderFn = sectionRenderMap[secKey];
            return renderFn ? renderFn() : null;
          })
        )}

        {/* Minimal Editorial Footer with Quick Storefront Page Links */}
        <footer className={`mt-auto border-t ${theme.borderClass} ${isMobile ? 'px-4 py-5 flex-col text-center' : 'px-6 @md:px-12 py-6 flex-col @sm:flex-row'} flex items-center justify-between gap-3 text-xs ${theme.textMuted}`}>
          <span>{pageData.brandName} — جميع الحقوق محفوظة</span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button type="button" onClick={() => setStorePage('home')} className="hover:underline cursor-pointer">
              الرئيسية
            </button>
            <button
              type="button"
              onClick={() => openProductDetails(selectedProductId || products[0]?.id)}
              className="hover:underline cursor-pointer"
            >
              تفاصيل المنتج
            </button>
            <button type="button" onClick={() => openCheckoutPage()} className="hover:underline cursor-pointer">
              إتمام الطلب
            </button>
            <button type="button" onClick={() => openTrackingPage()} className="hover:underline cursor-pointer font-semibold">
              تتبع الطلب برقم الهاتف
            </button>
          </div>
          <span>للتواصل: {pageData.whatsappPhone}</span>
        </footer>

        {/* EasyOrders Sticky Bottom Conversion Bar (shown on Home & Product pages) */}
        {easyOrder.enableStickyBar !== false &&
          sections.orderForm !== false &&
          (storePage === 'home' || storePage === 'product') && (
            <div
              className={`sticky bottom-0 z-20 border-t ${theme.borderClass} ${theme.cardClass} px-4 md:px-10 py-3 flex items-center justify-between gap-3 shadow-lg`}
            >
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${theme.textMain}`}>
                  {activeBundle.title}
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className={`font-bold ${theme.textMain}`}>
                    {finalTotal} {currency}
                  </span>
                  {isFreeShipping && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${theme.badgeBg}`}>
                      شحن مجاني
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openTrackingPage()}
                  className={`hidden sm:inline-block px-3 py-2 rounded text-[11px] font-semibold cursor-pointer ${theme.secondaryBtn}`}
                >
                  تتبع طلبك
                </button>
                <button
                  type="button"
                  onClick={() => openCheckoutPage()}
                  className={`px-5 py-2.5 rounded text-xs font-bold shrink-0 cursor-pointer transition-colors ${theme.accentBtn}`}
                >
                  اطلب الآن — الدفع عند الاستلام
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Phone Home Indicator Bar when in Mobile View */}
      {isMobile && (
        <div className="bg-zinc-900 py-2.5 flex items-center justify-center">
          <div className="w-28 h-1 rounded-full bg-zinc-600" />
        </div>
      )}
    </div>
  );
}
