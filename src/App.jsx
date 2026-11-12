import React, { useState, useEffect } from 'react';
import CanvasFrame from './components/CanvasFrame';
import CodeExportModal from './components/CodeExportModal';
import ImageEditorModal from './components/ImageEditorModal';
import ProjectsModal from './components/ProjectsModal';
import PublishModal from './components/PublishModal';
import PublishedSiteView from './components/PublishedSiteView';
import OrdersModal from './components/OrdersModal';
import {
  generatePageData,
  generateWithGeminiAI,
  DESIGN_THEMES,
  PRESET_PROMPTS,
  DEFAULT_SECTIONS,
  DEFAULT_SECTION_ORDER,
  DEFAULT_LAYOUTS,
  SECTION_LAYOUT_OPTIONS,
  DEFAULT_TYPOGRAPHY,
  TYPOGRAPHY_PRESETS,
  ARABIC_FONTS,
  DEFAULT_CUSTOM_COLORS,
  BRAND_COLOR_PRESETS,
  buildDefaultEasyOrderConfig,
} from './engine/templates';
import {
  loadProjectsWorkspace,
  saveProjectsWorkspace,
  getSavedActiveProjectId,
  saveActiveProjectId,
  buildNewProject,
  cloneProject,
  publishProjectToServer,
  getLiveShareUrl,
  decodeShareableToken,
  loadOrdersInbox,
  saveOrdersInbox,
  addOrderToInbox,
  fetchServerOrders,
  updateServerOrderStatus,
  deleteServerOrder,
} from './engine/projects';

const SECTION_LABELS = {
  hero: 'القسم الرئيسي (Hero)',
  stats: 'شريط الإحصائيات والأرقام',
  catalog: 'كتالوج المنتجات والخدمات',
  features: 'قسم معايير الجودة والمميزات',
  process: 'قسم خطوات الطلب والعمل',
  pricing: 'جدول الباقات والأسعار',
  testimonial: 'قسم تجارب وآراء العملاء',
  faq: 'قسم الأسئلة الشائعة',
  orderForm: 'نموذج السلة وإتمام الطلب',
};

function detectLiveRouteSlug() {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  if (path.startsWith('/p/')) {
    const raw = path.slice(3).replace(/\/+$/, '');
    if (raw) return decodeURIComponent(raw);
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get('p')) {
    return params.get('p');
  }
  return null;
}

function detectSharedSiteFromUrl() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const sParam = params.get('s');
  if (sParam) {
    return decodeShareableToken(sParam);
  }
  if (window.location.hash.startsWith('#s=')) {
    return decodeShareableToken(window.location.hash.slice(3));
  }
  return null;
}

export default function App() {
  // Check if visiting a serverless shared link (?s=...) or local preview (/p/:slug)
  const [sharedSite, setSharedSite] = useState(() => detectSharedSiteFromUrl());
  const [liveRouteSlug, setLiveRouteSlug] = useState(() => detectLiveRouteSlug());

  // Multi-Project Workspace State
  const [projects, setProjects] = useState(() => loadProjectsWorkspace());
  const [activeProjectId, setActiveProjectId] = useState(() => {
    const initialList = loadProjectsWorkspace();
    return getSavedActiveProjectId(initialList);
  });

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const [sidebarTab, setSidebarTab] = useState('prompt');
  const [openContentPanel, setOpenContentPanel] = useState('basic');
  const [openDesignPanel, setOpenDesignPanel] = useState('colors_fonts');
  const [promptInput, setPromptInput] = useState(
    activeProject?.prompt ||
      'دار عطور محلية باسم "أثر" تعتمد على الزيوت الطبيعية الخالصة وتعتيق الأخشاب العطرية يدوياً بأسعار تبدأ من 340 ج.م'
  );
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('pagecraft_gemini_key') || '');
  const [showKeyField, setShowKeyField] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const [activeThemeKey, setActiveThemeKey] = useState(activeProject?.theme || 'editorial');
  const [deviceView, setDeviceView] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  // EasyOrders COD Inbox State
  const [orders, setOrders] = useState(() => loadOrdersInbox());

  // Drag and Drop state for section reordering
  const [draggedSection, setDraggedSection] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);

  // Image Picker Modal State
  const [imagePickerConfig, setImagePickerConfig] = useState({
    isOpen: false,
    title: '',
    currentUrl: '',
    onSelect: null,
  });

  // Main Page Data State synced with active project
  const [pageData, setPageData] = useState(() => activeProject.pageData);
  const [canvasResetKey, setCanvasResetKey] = useState(0);

  const [history, setHistory] = useState([]);

  // Sync active project changes into the multi-project workspace
  useEffect(() => {
    setProjects((prevProjects) => {
      const updated = prevProjects.map((proj) => {
        if (proj.id !== activeProjectId) return proj;
        return {
          ...proj,
          name: pageData.brandName || proj.name,
          prompt: promptInput,
          theme: activeThemeKey,
          pageData,
          updatedAt: new Date().toISOString(),
        };
      });
      saveProjectsWorkspace(updated);
      return updated;
    });
    try {
      localStorage.setItem('pagecraft_v4_data', JSON.stringify(pageData));
    } catch {
      // ignore storage quota errors
    }
  }, [pageData, activeThemeKey, promptInput, activeProjectId]);

  // Listen to browser back/forward for /p/:slug
  useEffect(() => {
    const handlePopState = () => {
      setLiveRouteSlug(detectLiveRouteSlug());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Multi-Project Handlers
  const handleSelectProject = (projectId) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    setActiveProjectId(target.id);
    saveActiveProjectId(target.id);
    setPageData(target.pageData);
    setActiveThemeKey(target.theme || 'editorial');
    setPromptInput(target.prompt || '');
    setHistory([]);
    setCanvasResetKey((k) => k + 1);
  };

  const handleCreateProject = ({ name, prompt, theme }) => {
    const existingSlugs = projects.map((p) => p.slug);
    const created = buildNewProject({ name, prompt, theme, existingSlugs });
    const nextList = [created, ...projects];
    setProjects(nextList);
    saveProjectsWorkspace(nextList);
    setActiveProjectId(created.id);
    saveActiveProjectId(created.id);
    setPageData(created.pageData);
    setActiveThemeKey(created.theme);
    setPromptInput(created.prompt);
    setHistory([]);
    setCanvasResetKey((k) => k + 1);
  };

  const handleDuplicateProject = (projectId) => {
    const source = projects.find((p) => p.id === projectId);
    if (!source) return;
    const existingSlugs = projects.map((p) => p.slug);
    const cloned = cloneProject(source, existingSlugs);
    const nextList = [cloned, ...projects];
    setProjects(nextList);
    saveProjectsWorkspace(nextList);
    setActiveProjectId(cloned.id);
    saveActiveProjectId(cloned.id);
    setPageData(cloned.pageData);
    setActiveThemeKey(cloned.theme);
    setPromptInput(cloned.prompt);
    setHistory([]);
    setCanvasResetKey((k) => k + 1);
  };

  const handleDeleteProject = (projectId) => {
    if (projects.length <= 1) return;
    const remaining = projects.filter((p) => p.id !== projectId);
    setProjects(remaining);
    saveProjectsWorkspace(remaining);
    if (projectId === activeProjectId) {
      const nextActive = remaining[0];
      setActiveProjectId(nextActive.id);
      saveActiveProjectId(nextActive.id);
      setPageData(nextActive.pageData);
      setActiveThemeKey(nextActive.theme);
      setPromptInput(nextActive.prompt);
      setHistory([]);
    }
  };

  const handleRenameProject = (projectId, newName) => {
    const updated = projects.map((proj) => {
      if (proj.id !== projectId) return proj;
      const nextPageData = { ...proj.pageData, brandName: newName };
      return { ...proj, name: newName, pageData: nextPageData };
    });
    setProjects(updated);
    saveProjectsWorkspace(updated);
    if (projectId === activeProjectId) {
      setPageData((prev) => ({ ...prev, brandName: newName }));
    }
  };

  const handlePublishActiveProject = async (customSlug) => {
    const currentObj = {
      ...activeProject,
      slug: customSlug || activeProject.slug,
      name: pageData.brandName || activeProject.name,
      theme: activeThemeKey,
      pageData,
    };
    const result = await publishProjectToServer(currentObj);
    const nextList = projects.map((p) => (p.id === activeProjectId ? result.project : p));
    setProjects(nextList);
    saveProjectsWorkspace(nextList);
    return result;
  };

  const handleUnpublishActiveProject = () => {
    const nextList = projects.map((p) =>
      p.id === activeProjectId ? { ...p, isPublished: false } : p
    );
    setProjects(nextList);
    saveProjectsWorkspace(nextList);
  };

  const handleSaveKey = (val) => {
    setGeminiKey(val);
    localStorage.setItem('pagecraft_gemini_key', val);
  };

  const handleGenerate = async (textToUse, themeToUse) => {
    const finalPrompt = (textToUse ?? promptInput).trim();
    const finalTheme = themeToUse ?? activeThemeKey;
    if (!finalPrompt) return;

    setIsGenerating(true);
    setGenError('');
    setHistory((prev) => [...prev.slice(-9), pageData]);

    try {
      if (geminiKey.trim()) {
        const aiData = await generateWithGeminiAI(finalPrompt, geminiKey.trim(), finalTheme);
        setPageData(aiData);
        setCanvasResetKey((k) => k + 1);
      } else {
        await new Promise((r) => setTimeout(r, 200));
        const nextData = generatePageData(finalPrompt, finalTheme);
        setPageData(nextData);
        if (nextData.theme) setActiveThemeKey(nextData.theme);
        setCanvasResetKey((k) => k + 1);
      }
    } catch (err) {
      setGenError(err.message || 'حدث خطأ أثناء التوليد، تم استخدام المحرك المحلي.');
      const fallback = generatePageData(finalPrompt, finalTheme);
      setPageData(fallback);
      setCanvasResetKey((k) => k + 1);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setPromptInput(preset.prompt);
    setActiveThemeKey(preset.theme);
    handleGenerate(preset.prompt, preset.theme);
  };

  const handleUpdateField = (field, value) => {
    setPageData((prev) => ({ ...prev, [field]: value }));
  };

  // Section Visibility Toggle
  const handleToggleSection = (secKey) => {
    const currentSections = { ...DEFAULT_SECTIONS, ...(pageData.sections || {}) };
    handleUpdateField('sections', {
      ...currentSections,
      [secKey]: !currentSections[secKey],
    });
  };

  // Section Layout Variant Change
  const handleChangeSectionLayout = (secKey, layoutId) => {
    const currentLayouts = { ...DEFAULT_LAYOUTS, ...(pageData.layouts || {}) };
    handleUpdateField('layouts', {
      ...currentLayouts,
      [secKey]: layoutId,
    });
  };

  // Section Reordering (Up / Down buttons)
  const handleMoveSection = (secKey, direction) => {
    const currentOrder = [...(pageData.sectionOrder || DEFAULT_SECTION_ORDER)];
    const index = currentOrder.indexOf(secKey);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const swapped = [...currentOrder];
    const temp = swapped[index];
    swapped[index] = swapped[targetIndex];
    swapped[targetIndex] = temp;

    setHistory((prev) => [...prev.slice(-9), pageData]);
    handleUpdateField('sectionOrder', swapped);
  };

  // Drag and Drop Reordering
  const handleDragStart = (secKey) => {
    setDraggedSection(secKey);
  };

  const handleDragOver = (e, secKey) => {
    e.preventDefault();
    if (secKey !== draggedSection) {
      setDragOverSection(secKey);
    }
  };

  const handleDrop = (targetKey) => {
    if (!draggedSection || draggedSection === targetKey) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }

    const currentOrder = [...(pageData.sectionOrder || DEFAULT_SECTION_ORDER)];
    const fromIdx = currentOrder.indexOf(draggedSection);
    const toIdx = currentOrder.indexOf(targetKey);

    if (fromIdx !== -1 && toIdx !== -1) {
      const updated = [...currentOrder];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      setHistory((prev) => [...prev.slice(-9), pageData]);
      handleUpdateField('sectionOrder', updated);
    }

    setDraggedSection(null);
    setDragOverSection(null);
  };

  const handleResetLayoutAndOrder = () => {
    setHistory((prev) => [...prev.slice(-9), pageData]);
    setPageData((prev) => ({
      ...prev,
      sectionOrder: [...DEFAULT_SECTION_ORDER],
      layouts: { ...DEFAULT_LAYOUTS },
      sections: { ...DEFAULT_SECTIONS },
    }));
  };

  // One-Click Page Simplicity Presets ('single' | 'focused' | 'full')
  const handleApplyPagePreset = (mode) => {
    setHistory((prev) => [...prev.slice(-9), pageData]);
    if (mode === 'single') {
      handleUpdateField('sections', {
        ...DEFAULT_SECTIONS,
        announcement: true,
        hero: true,
        heroImage: true,
        stats: false,
        catalog: false,
        features: true,
        process: false,
        pricing: false,
        testimonial: false,
        faq: false,
        orderForm: true,
      });
    } else if (mode === 'focused') {
      handleUpdateField('sections', {
        ...DEFAULT_SECTIONS,
        announcement: true,
        hero: true,
        heroImage: true,
        stats: false,
        catalog: true,
        features: false,
        process: false,
        pricing: false,
        testimonial: true,
        faq: false,
        orderForm: true,
      });
    } else {
      handleUpdateField('sections', { ...DEFAULT_SECTIONS });
    }
  };

  const secFlags = { ...DEFAULT_SECTIONS, ...(pageData.sections || {}) };
  const activePageMode =
    !secFlags.catalog && !secFlags.pricing && !secFlags.stats && secFlags.orderForm
      ? 'single'
      : secFlags.catalog && !secFlags.pricing && !secFlags.stats && !secFlags.process
      ? 'focused'
      : 'full';

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setPageData(previous);
    setHistory((prev) => prev.slice(0, -1));
  };

  const openImagePicker = ({ title, currentUrl, onSelect }) => {
    setImagePickerConfig({
      isOpen: true,
      title,
      currentUrl,
      onSelect,
    });
  };

  const products = pageData.products || [];
  const updateProductItem = (idx, field, val) => {
    const copy = [...products];
    copy[idx] = { ...copy[idx], [field]: val };
    handleUpdateField('products', copy);
  };

  const addNewProductItem = () => {
    const next = [
      ...products,
      {
        id: 'p_' + Date.now(),
        name: 'منتج أو خدمة جديدة',
        category: 'عام',
        price: 350,
        oldPrice: 420,
        desc: 'وصف مختصر يوضح تفاصيل ومميزات هذا العنصر للعميل.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        tag: 'جديد',
      },
    ];
    handleUpdateField('products', next);
  };

  const deleteProductItem = (id) => {
    if (products.length <= 1) return;
    handleUpdateField(
      'products',
      products.filter((p) => p.id !== id)
    );
  };

  const currentSectionOrder = pageData.sectionOrder || DEFAULT_SECTION_ORDER;
  const currentLayouts = { ...DEFAULT_LAYOUTS, ...(pageData.layouts || {}) };
  const currentTypography = { ...DEFAULT_TYPOGRAPHY, ...(pageData.typography || {}) };
  const currentCustomColors = { ...DEFAULT_CUSTOM_COLORS, ...(pageData.customColors || {}) };

  const handleApplyTypographyPreset = (presetValues) => {
    handleUpdateField('typography', {
      ...presetValues,
      fontFamily: currentTypography.fontFamily || 'Cairo',
    });
  };

  const handleUpdateTypographyField = (field, val) => {
    handleUpdateField('typography', {
      ...currentTypography,
      scale: field === 'fontFamily' ? currentTypography.scale : 'custom',
      [field]: field === 'fontFamily' ? val : Number(val),
    });
  };

  const handleStepFontSizes = (delta) => {
    handleUpdateField('typography', {
      ...currentTypography,
      scale: 'custom',
      heroSize: Math.min(56, Math.max(20, currentTypography.heroSize + delta * 2)),
      sectionSize: Math.min(36, Math.max(15, currentTypography.sectionSize + delta * 2)),
      cardTitleSize: Math.min(24, Math.max(12, currentTypography.cardTitleSize + delta)),
      bodySize: Math.min(20, Math.max(11, currentTypography.bodySize + delta)),
      priceSize: Math.min(32, Math.max(14, currentTypography.priceSize + delta * 2)),
    });
  };

  const handleUpdateCustomColor = (field, value) => {
    handleUpdateField('customColors', {
      ...currentCustomColors,
      enabled: true,
      [field]: value,
    });
  };

  const handleApplyBrandColorPreset = (preset) => {
    handleUpdateField('customColors', {
      enabled: true,
      primary: preset.primary,
      background: preset.background,
      surface: preset.surface,
      text: preset.text,
    });
  };

  const handleDisableCustomColors = () => {
    handleUpdateField('customColors', {
      ...currentCustomColors,
      enabled: false,
    });
  };

  // EasyOrders COD Configuration & Inbox Handlers
  const currentEasyOrder = {
    ...buildDefaultEasyOrderConfig(pageData.niche || 'perfume', products[0]?.price || 350),
    ...(pageData.easyOrder || {}),
  };

  const handleUpdateEasyOrder = (field, value) => {
    handleUpdateField('easyOrder', {
      ...currentEasyOrder,
      [field]: value,
    });
  };

  const handleUpdateBundleOffer = (idx, field, value) => {
    const offers = [...(currentEasyOrder.bundleOffers || [])];
    offers[idx] = { ...offers[idx], [field]: value };
    handleUpdateEasyOrder('bundleOffers', offers);
  };

  const handleSubmitOrder = (orderPayload) => {
    const { order, list } = addOrderToInbox(orderPayload);
    setOrders(list);
    return order;
  };

  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    const target = orders.find((o) => o.id === orderId);
    if (target?.source === 'server') {
      try {
        await updateServerOrderStatus(orderId, nextStatus);
      } catch (err) {
        window.alert(`تعذر تحديث الطلب على الخادم: ${err.message}`);
        return;
      }
    }
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
    setOrders(updated);
    saveOrdersInbox(updated.filter((o) => o.source !== 'server'));
  };

  const handleDeleteOrder = async (orderId) => {
    const target = orders.find((o) => o.id === orderId);
    if (target?.source === 'server') {
      if (!window.confirm(`حذف الطلب ${orderId} نهائياً من الخادم؟ لا يمكن التراجع.`)) return;
      try {
        await deleteServerOrder(orderId);
      } catch (err) {
        window.alert(`تعذر حذف الطلب من الخادم: ${err.message}`);
        return;
      }
    }
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    saveOrdersInbox(updated.filter((o) => o.source !== 'server'));
  };

  // Pull real orders from the server whenever the inbox is opened (local demo orders stay as a fallback).
  useEffect(() => {
    if (!showOrdersModal) return;
    let active = true;
    fetchServerOrders().then((serverOrders) => {
      if (!active || !serverOrders) return;
      const local = loadOrdersInbox().filter((o) => o.source !== 'server');
      setOrders([...serverOrders, ...local]);
    });
    return () => {
      active = false;
    };
  }, [showOrdersModal]);

  // If visiting a serverless shared link (?s=...) or /p/:slug, render PublishedSiteView
  if (sharedSite || liveRouteSlug) {
    return (
      <PublishedSiteView
        slug={liveRouteSlug}
        sharedSite={sharedSite}
        onExitToStudio={() => {
          window.history.pushState({}, '', window.location.pathname.replace(/\/p\/.*$/, '') || '/');
          setLiveRouteSlug(null);
          setSharedSite(null);
          document.title = 'مِعمار الصفحات | استوديو تصميم صفحات الهبوط';
        }}
        onRemixSharedSite={(siteToRemix) => {
          setPageData(siteToRemix.pageData);
          setActiveThemeKey(siteToRemix.theme || 'editorial');
          setPromptInput(siteToRemix.prompt || '');
          window.history.pushState({}, '', window.location.pathname);
          setSharedSite(null);
          setLiveRouteSlug(null);
        }}
      />
    );
  }

  if (isFullscreen) {
    return (
      <div className="min-h-screen bg-zinc-100 relative">
        <button
          onClick={() => setIsFullscreen(false)}
          className="fixed bottom-5 left-5 z-50 px-4 py-2.5 bg-zinc-900 text-white text-xs font-semibold rounded shadow-xl hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          العودة إلى لوحة التعديل
        </button>
        <CanvasFrame
          key={`${activeProjectId}_${canvasResetKey}_fs`}
          pageData={pageData}
          onUpdateField={handleUpdateField}
          onMoveSection={handleMoveSection}
          onChangeSectionLayout={handleChangeSectionLayout}
          onToggleSection={handleToggleSection}
          onOpenImagePicker={openImagePicker}
          onSubmitOrder={handleSubmitOrder}
          orders={orders}
          activeThemeKey={activeThemeKey}
          deviceView="desktop"
          isFullscreen={true}
        />
      </div>
    );
  }

  const liveShareUrl = getLiveShareUrl(activeProject?.slug || 'site');
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  return (
    <div className="min-h-screen bg-[#ECEAE4] text-zinc-900 flex flex-col font-sans">
      {/* =====================================================================
          UNIFIED TOP STUDIO HEADER BAR (Single, Clean, Non-Duplicated)
         ===================================================================== */}
      <header className="h-14 bg-[#F7F6F2] border-b border-[#DFDDD6] px-4 lg:px-6 flex items-center justify-between gap-3 sticky top-0 z-40">
        {/* Right Zone: Brand Title + Active Project Switcher Pill */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-900 inline-block" />
            <h1 className="text-sm md:text-base font-bold tracking-tight text-zinc-900">
              مِعمار الصفحات
            </h1>
          </div>

          <span className="text-zinc-300 hidden sm:inline">|</span>

          {/* Active Project Button */}
          <button
            type="button"
            onClick={() => setShowProjectsModal(true)}
            className="px-3 py-1.5 rounded bg-white hover:bg-[#ECEAE3] border border-[#D8D5CD] flex items-center gap-2 text-xs transition-colors cursor-pointer max-w-[220px]"
            title="تبديل المشروع أو إنشاء مشروع جديد"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                activeProject?.isPublished ? 'bg-emerald-600' : 'bg-zinc-400'
              }`}
            />
            <span className="text-zinc-500 hidden sm:inline">المشروع:</span>
            <strong className="text-zinc-900 truncate">
              {pageData.brandName || activeProject?.name}
            </strong>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F1EFEA] text-zinc-600 font-mono shrink-0">
              {projects.length}
            </span>
          </button>

          {history.length > 0 && (
            <button
              type="button"
              onClick={handleUndo}
              className="px-2.5 py-1 rounded bg-white border border-[#D8D5CD] hover:bg-zinc-100 text-[11px] font-semibold text-zinc-700 cursor-pointer shrink-0"
              title="التراجع عن آخر خطوة"
            >
              ↩ تراجع
            </button>
          )}
        </div>

        {/* Center Zone: Viewport Switcher + Page Simplicity Mode + Quick Font Scale */}
        <div className="hidden md:flex items-center gap-3">
          {/* Segmented Device Switcher */}
          <div className="p-0.5 rounded bg-[#EAE8E1] border border-[#D8D5CD] flex items-center text-xs">
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                deviceView === 'desktop'
                  ? 'bg-white text-zinc-900 font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              سطح المكتب
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                deviceView === 'mobile'
                  ? 'bg-white text-zinc-900 font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              الجوال
            </button>
          </div>

          {/* 1-Click Website Simplicity Mode Switcher */}
          <div
            className="hidden xl:flex p-0.5 rounded bg-[#EAE8E1] border border-[#D8D5CD] items-center text-[11px]"
            title="اختر مدى بساطة أو شمولية أقسام الموقع بضغطة واحدة"
          >
            <button
              type="button"
              onClick={() => handleApplyPagePreset('single')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                activePageMode === 'single'
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              صفحة منتج واحد
            </button>
            <button
              type="button"
              onClick={() => handleApplyPagePreset('focused')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                activePageMode === 'focused'
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              متجر مختصر
            </button>
            <button
              type="button"
              onClick={() => handleApplyPagePreset('full')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                activePageMode === 'full'
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              موقع شامل
            </button>
          </div>

          {/* Quick Font Stepper */}
          <div className="flex items-center gap-1 bg-white border border-[#D8D5CD] rounded px-1.5 py-0.5">
            <button
              type="button"
              onClick={() => handleStepFontSizes(-1)}
              className="px-1.5 py-0.5 hover:bg-zinc-100 rounded text-zinc-800 font-bold text-[11px] cursor-pointer"
              title="تصغير الخطوط"
            >
              A-
            </button>
            <span className="text-zinc-300">|</span>
            <button
              type="button"
              onClick={() => handleStepFontSizes(1)}
              className="px-1.5 py-0.5 hover:bg-zinc-100 rounded text-zinc-800 font-bold text-[11px] cursor-pointer"
              title="تكبير الخطوط"
            >
              A+
            </button>
          </div>
        </div>

        {/* Left Zone: Orders Inbox + Fullscreen + Export + Publish */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowOrdersModal(true)}
            className="px-3 py-1.5 rounded bg-white hover:bg-[#ECEAE3] border border-[#D8D5CD] text-zinc-900 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            title="صندوق طلبات العملاء وتصدير شيت الشحن (EasyOrders)"
          >
            <span>الطلبات ({orders.length})</span>
            {newOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="hidden sm:inline-flex px-3 py-1.5 rounded bg-white hover:bg-[#ECEAE3] border border-[#D8D5CD] text-zinc-700 hover:text-zinc-900 text-xs font-medium transition-colors cursor-pointer"
          >
            معاينة كاملة
          </button>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="hidden lg:inline-flex px-3 py-1.5 rounded bg-white hover:bg-[#ECEAE3] border border-[#D8D5CD] text-zinc-700 hover:text-zinc-900 text-xs font-medium transition-colors cursor-pointer"
          >
            تصدير الكود
          </button>

          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="px-3.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            نشر ومشاركة الموقع
          </button>
        </div>
      </header>

      {/* =====================================================================
          MAIN WORKSPACE BODY (Right Sidebar + Left Live Preview Canvas)
         ===================================================================== */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Right Sidebar: Clean 3-Step Editor with Collapsible Accordions */}
        <aside className="w-full lg:w-[375px] xl:w-[400px] bg-[#F7F6F2] border-b lg:border-b-0 lg:border-l border-[#DFDDD6] flex flex-col shrink-0 lg:h-[calc(100vh-3.5rem)] lg:sticky lg:top-14">
          {/* Clean 3-Tab Navigation */}
          <div className="grid grid-cols-3 border-b border-[#E5E3DC] bg-[#F1EFEA] text-xs">
            <button
              type="button"
              onClick={() => setSidebarTab('prompt')}
              className={`py-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                sidebarTab === 'prompt'
                  ? 'border-zinc-900 text-zinc-900 bg-[#F7F6F2]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              ١. الفكرة والذكاء
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab('content')}
              className={`py-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                sidebarTab === 'content'
                  ? 'border-zinc-900 text-zinc-900 bg-[#F7F6F2]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              ٢. المنتجات والعروض
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab('design')}
              className={`py-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                sidebarTab === 'design'
                  ? 'border-zinc-900 text-zinc-900 bg-[#F7F6F2]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              ٣. المظهر والأقسام
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* ===============================================================
                TAB 1: PROMPT, PAGE SIMPLICITY MODE & PRESETS
               =============================================================== */}
            {sidebarTab === 'prompt' && (
              <div className="space-y-5">
                <div className="p-4 bg-white border border-[#DFDDD6] rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-900">
                      صف مشروعك ومنتجاتك لبناء الموقع
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowKeyField(!showKeyField)}
                      className="text-[11px] text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
                    >
                      {geminiKey ? 'مفتاح Gemini متصل' : 'ربط Gemini API'}
                    </button>
                  </div>

                  {showKeyField && (
                    <div className="p-2.5 bg-[#FAF9F6] border border-[#D8D5CD] rounded space-y-1">
                      <label className="text-[10px] font-medium text-zinc-600 block">
                        مفتاح Gemini API (اختياري):
                      </label>
                      <input
                        type="password"
                        value={geminiKey}
                        onChange={(e) => handleSaveKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-white border border-[#D8D5CD] rounded px-2.5 py-1 text-xs font-mono"
                      />
                    </div>
                  )}

                  <textarea
                    rows="3"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="مثال: براند عطور باسم سكون بأسعار تبدأ من 350 ج.م وشحن مجاني..."
                    className="w-full bg-[#FAF9F6] border border-[#D8D5CD] rounded p-3 text-xs text-zinc-900 leading-relaxed placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors resize-none"
                  />

                  {genError && <p className="text-[11px] text-amber-800">{genError}</p>}

                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handleGenerate()}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                  >
                    {isGenerating ? 'جاري بناء الموقع...' : 'توليد وتحديث الموقع الآن'}
                  </button>
                </div>

                {/* One-Click Page Simplicity Mode Card */}
                <div className="p-4 bg-white border border-[#DFDDD6] rounded-lg space-y-2.5">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">
                      نمط حجم وبساطة الموقع (بضغطة واحدة)
                    </span>
                    <p className="text-[11px] text-zinc-500">
                      اختر عدد الأقسام المعروضة لتبسيط التجربة على عملائك
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleApplyPagePreset('single')}
                      className={`p-2 rounded border text-center transition-all cursor-pointer ${
                        activePageMode === 'single'
                          ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                          : 'bg-[#FAF9F6] text-zinc-700 border-[#D8D5CD] hover:border-zinc-500'
                      }`}
                    >
                      <div>منتج واحد</div>
                      <div className="text-[9px] opacity-75 mt-0.5">٣ أقسام مركزة</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPagePreset('focused')}
                      className={`p-2 rounded border text-center transition-all cursor-pointer ${
                        activePageMode === 'focused'
                          ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                          : 'bg-[#FAF9F6] text-zinc-700 border-[#D8D5CD] hover:border-zinc-500'
                      }`}
                    >
                      <div>متجر مختصر</div>
                      <div className="text-[9px] opacity-75 mt-0.5">٤ أقسام أساسية</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPagePreset('full')}
                      className={`p-2 rounded border text-center transition-all cursor-pointer ${
                        activePageMode === 'full'
                          ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                          : 'bg-[#FAF9F6] text-zinc-700 border-[#D8D5CD] hover:border-zinc-500'
                      }`}
                    >
                      <div>موقع شامل</div>
                      <div className="text-[9px] opacity-75 mt-0.5">جميع الـ ٩ أقسام</div>
                    </button>
                  </div>
                </div>

                {/* Curated Industry Presets */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-800 block">
                    أو اختر نموذجاً جاهزاً للبدء السريع:
                  </span>
                  <div className="space-y-1.5">
                    {PRESET_PROMPTS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className="w-full text-right p-2.5 rounded bg-white hover:bg-[#ECEAE3] border border-[#E5E2DC] transition-colors cursor-pointer block"
                      >
                        <div className="text-xs font-bold text-zinc-800">{preset.title}</div>
                        <div className="text-[11px] text-zinc-500 truncate mt-0.5">{preset.prompt}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 2: ACCORDION-ORGANIZED PRODUCTS, BUNDLES & CONTENT
               =============================================================== */}
            {sidebarTab === 'content' && (
              <div className="space-y-2.5">
                {/* Accordion 1: Basic Brand & Hero Info */}
                <div className="bg-white border border-[#DFDDD6] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenContentPanel(openContentPanel === 'basic' ? '' : 'basic')
                    }
                    className="w-full px-4 py-3 flex items-center justify-between text-right hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-900">
                        ١. اسم البراند والصورة الرئيسية
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        العنوان الرئيسي، شريط الإعلان، والصورة
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {openContentPanel === 'basic' ? '−' : '+'}
                    </span>
                  </button>

                  {openContentPanel === 'basic' && (
                    <div className="p-4 pt-2 border-t border-zinc-100 space-y-3">
                      <div>
                        <span className="text-[11px] text-zinc-500 block mb-1">اسم العلامة التجارية</span>
                        <input
                          type="text"
                          value={pageData.brandName || ''}
                          onChange={(e) => handleUpdateField('brandName', e.target.value)}
                          className="w-full bg-[#FAF9F6] border border-[#D8D5CD] rounded px-2.5 py-1.5 text-xs text-zinc-900"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] text-zinc-500 block mb-1">العنوان الرئيسي (Headline)</span>
                        <textarea
                          rows="2"
                          value={pageData.headline || ''}
                          onChange={(e) => handleUpdateField('headline', e.target.value)}
                          className="w-full bg-[#FAF9F6] border border-[#D8D5CD] rounded p-2 text-xs text-zinc-900"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] text-zinc-500 block mb-1">شريط الإعلان العلوي</span>
                        <input
                          type="text"
                          value={pageData.announcement || ''}
                          onChange={(e) => handleUpdateField('announcement', e.target.value)}
                          className="w-full bg-[#FAF9F6] border border-[#D8D5CD] rounded px-2.5 py-1.5 text-xs text-zinc-900"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-zinc-600">الصورة الرئيسية للموقع</span>
                        <button
                          type="button"
                          onClick={() =>
                            openImagePicker({
                              title: 'تغيير الصورة الرئيسية للموقع',
                              currentUrl: pageData.heroImage,
                              onSelect: (url) => handleUpdateField('heroImage', url),
                            })
                          }
                          className="px-3 py-1.5 bg-zinc-900 text-white text-[11px] font-medium rounded cursor-pointer"
                        >
                          رفع أو اختيار صورة
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Products & Catalog */}
                <div className="bg-white border border-[#DFDDD6] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenContentPanel(openContentPanel === 'products' ? '' : 'products')
                    }
                    className="w-full px-4 py-3 flex items-center justify-between text-right hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-900">
                        ٢. قائمة المنتجات والخدمات ({products.length})
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        تعديل الأسعار، الصور، وإضافة منتجات جديدة
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {openContentPanel === 'products' ? '−' : '+'}
                    </span>
                  </button>

                  {openContentPanel === 'products' && (
                    <div className="p-4 pt-2 border-t border-zinc-100 space-y-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={addNewProductItem}
                          className="px-2.5 py-1 bg-zinc-900 text-white rounded text-[11px] font-semibold cursor-pointer"
                        >
                          + إضافة منتج جديد
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {products.map((prod, idx) => (
                          <div
                            key={prod.id}
                            className="p-3 bg-[#FAF9F6] border border-[#E5E3DC] rounded space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-10 h-10 rounded object-cover border border-zinc-200 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={prod.name}
                                  onChange={(e) => updateProductItem(idx, 'name', e.target.value)}
                                  className="w-full text-xs font-bold text-zinc-900 bg-transparent border-b border-transparent focus:border-zinc-400 focus:outline-none"
                                />
                                <div className="flex items-center gap-2 mt-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openImagePicker({
                                        title: `تغيير صورة: ${prod.name}`,
                                        currentUrl: prod.image,
                                        onSelect: (url) => updateProductItem(idx, 'image', url),
                                      })
                                    }
                                    className="text-[10px] text-zinc-600 underline cursor-pointer"
                                  >
                                    تغيير الصورة
                                  </button>
                                  {products.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => deleteProductItem(prod.id)}
                                      className="text-[10px] text-red-700 underline cursor-pointer"
                                    >
                                      حذف
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[10px] text-zinc-400 block">السعر</span>
                                <input
                                  type="number"
                                  value={prod.price}
                                  onChange={(e) =>
                                    updateProductItem(idx, 'price', Number(e.target.value) || 0)
                                  }
                                  className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs"
                                />
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-400 block">التصنيف</span>
                                <input
                                  type="text"
                                  value={prod.category || ''}
                                  onChange={(e) => updateProductItem(idx, 'category', e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 3: EasyOrders Bundles & Variants */}
                <div className="bg-white border border-[#DFDDD6] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenContentPanel(openContentPanel === 'bundles' ? '' : 'bundles')
                    }
                    className="w-full px-4 py-3 flex items-center justify-between text-right hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-900">
                        ٣. عروض التوفير والكميات (EasyOrders)
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        عرض قطعة / قطعتين / ٣ قطع ومواصفات كل قطعة
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {openContentPanel === 'bundles' ? '−' : '+'}
                    </span>
                  </button>

                  {openContentPanel === 'bundles' && (
                    <div className="p-4 pt-2 border-t border-zinc-100 space-y-3">
                      <div className="flex items-center justify-between text-xs pb-1">
                        <span className="text-zinc-700 font-medium">تفعيل عروض الكميات في الفورم</span>
                        <input
                          type="checkbox"
                          checked={currentEasyOrder.enableBundleSelector ?? true}
                          onChange={(e) =>
                            handleUpdateEasyOrder('enableBundleSelector', e.target.checked)
                          }
                          className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer"
                        />
                      </div>

                      {(currentEasyOrder.bundleOffers || []).map((offer, idx) => (
                        <div
                          key={offer.id || idx}
                          className="p-2.5 bg-[#FAF9F6] border border-[#E5E3DC] rounded space-y-2"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-zinc-400 block">
                                اسم العرض ({offer.qty} قطع)
                              </span>
                              <input
                                type="text"
                                value={offer.title}
                                onChange={(e) => handleUpdateBundleOffer(idx, 'title', e.target.value)}
                                className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-400 block">سعر العرض الإجمالي</span>
                              <input
                                type="number"
                                value={offer.price}
                                onChange={(e) =>
                                  handleUpdateBundleOffer(idx, 'price', Number(e.target.value) || 0)
                                }
                                className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs font-bold"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-zinc-600">شحن مجاني لهذا العرض</span>
                            <input
                              type="checkbox"
                              checked={offer.freeShipping ?? false}
                              onChange={(e) =>
                                handleUpdateBundleOffer(idx, 'freeShipping', e.target.checked)
                              }
                              className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer"
                            />
                          </div>
                        </div>
                      ))}

                      <div className="p-2.5 bg-[#FAF9F6] border border-[#E5E3DC] rounded space-y-2">
                        <div>
                          <span className="text-[10px] text-zinc-500 block mb-1">
                            عنوان خيارات القطعة (مثال: المقاس واللون)
                          </span>
                          <input
                            type="text"
                            value={currentEasyOrder.variantLabel || ''}
                            onChange={(e) => handleUpdateEasyOrder('variantLabel', e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block mb-1">
                            الخيارات المتاحة لكل قطعة (افصل بفاصلة ،)
                          </span>
                          <input
                            type="text"
                            value={(currentEasyOrder.variantOptions || []).join(' ، ')}
                            onChange={(e) =>
                              handleUpdateEasyOrder(
                                'variantOptions',
                                e.target.value
                                  .split(/[,،]/)
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              )
                            }
                            className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 4: Pricing Table Tiers */}
                {pageData.pricingTiers && (
                  <div className="bg-white border border-[#DFDDD6] rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenContentPanel(openContentPanel === 'pricing' ? '' : 'pricing')
                      }
                      className="w-full px-4 py-3 flex items-center justify-between text-right hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-zinc-900">
                          ٤. باقات الأسعار المقارنة
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          تعديل جدول الباقات الثلاث في قسم الأسعار
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400 font-mono">
                        {openContentPanel === 'pricing' ? '−' : '+'}
                      </span>
                    </button>

                    {openContentPanel === 'pricing' && (
                      <div className="p-4 pt-2 border-t border-zinc-100 space-y-2.5">
                        {pageData.pricingTiers.map((tier, idx) => (
                          <div
                            key={tier.id || idx}
                            className="p-2.5 bg-[#FAF9F6] border border-[#E5E3DC] rounded grid grid-cols-2 gap-2"
                          >
                            <div>
                              <span className="text-[10px] text-zinc-400 block">اسم الباقة</span>
                              <input
                                type="text"
                                value={tier.name}
                                onChange={(e) => {
                                  const copy = [...pageData.pricingTiers];
                                  copy[idx] = { ...copy[idx], name: e.target.value };
                                  handleUpdateField('pricingTiers', copy);
                                }}
                                className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-400 block">السعر المعروض</span>
                              <input
                                type="text"
                                value={tier.price}
                                onChange={(e) => {
                                  const copy = [...pageData.pricingTiers];
                                  copy[idx] = { ...copy[idx], price: e.target.value };
                                  handleUpdateField('pricingTiers', copy);
                                }}
                                className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs font-bold"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===============================================================
                TAB 3: ACCORDION-ORGANIZED APPEARANCE, SECTIONS & COD SETTINGS
               =============================================================== */}
            {sidebarTab === 'design' && (
              <div className="space-y-2.5">
                {/* Accordion 1: Colors & Arabic Fonts */}
                <div className="bg-white border border-[#DFDDD6] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDesignPanel(
                        openDesignPanel === 'colors_fonts' ? '' : 'colors_fonts'
                      )
                    }
                    className="w-full px-4 py-3 flex items-center justify-between text-right hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-900">
                        ١. ألوان الهوية والخط العربي
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        الثيمات الجاهزة، تخصيص الألوان، و٦ خطوط عربية
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {openDesignPanel === 'colors_fonts' ? '−' : '+'}
                    </span>
                  </button>

                  {openDesignPanel === 'colors_fonts' && (
                    <div className="p-4 pt-2 border-t border-zinc-100 space-y-4">
                      {/* Themes */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-zinc-700">السمات الجاهزة:</span>
                          {currentCustomColors.enabled && (
                            <button
                              type="button"
                              onClick={handleDisableCustomColors}
                              className="text-[10px] text-zinc-500 underline cursor-pointer"
                            >
                              إلغاء الألوان المخصصة
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {Object.keys(DESIGN_THEMES).map((key) => {
                            const th = DESIGN_THEMES[key];
                            const isSelected = activeThemeKey === key && !currentCustomColors.enabled;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  setActiveThemeKey(key);
                                  handleDisableCustomColors();
                                }}
                                className={`py-2 px-2.5 rounded text-xs font-medium border text-right transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-zinc-900 bg-zinc-900 text-white'
                                    : 'border-[#D8D5CD] bg-[#FAF9F6] text-zinc-700 hover:bg-zinc-100'
                                }`}
                              >
                                {th.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Brand Swatches + Color Pickers */}
                      <div className="space-y-2 pt-2 border-t border-zinc-100">
                        <span className="text-[11px] font-bold text-zinc-700 block">
                          لوحات ألوان البراندات:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {BRAND_COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleApplyBrandColorPreset(preset)}
                              className="flex items-center gap-1.5 px-2 py-1 rounded border border-[#D8D5CD] hover:border-zinc-900 bg-[#FAF9F6] text-[10px] font-medium text-zinc-800 cursor-pointer"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: preset.primary }}
                              />
                              <span>{preset.name}</span>
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <label className="flex items-center justify-between p-1.5 rounded bg-[#FAF9F6] border border-[#E5E3DC] cursor-pointer">
                            <span className="text-[10px] text-zinc-700 font-medium">لون الأزرار</span>
                            <input
                              type="color"
                              value={currentCustomColors.primary}
                              onChange={(e) => handleUpdateCustomColor('primary', e.target.value)}
                              className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                            />
                          </label>
                          <label className="flex items-center justify-between p-1.5 rounded bg-[#FAF9F6] border border-[#E5E3DC] cursor-pointer">
                            <span className="text-[10px] text-zinc-700 font-medium">لون الخلفية</span>
                            <input
                              type="color"
                              value={currentCustomColors.background}
                              onChange={(e) => handleUpdateCustomColor('background', e.target.value)}
                              className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                            />
                          </label>
                          <label className="flex items-center justify-between p-1.5 rounded bg-[#FAF9F6] border border-[#E5E3DC] cursor-pointer">
                            <span className="text-[10px] text-zinc-700 font-medium">لون البطاقات</span>
                            <input
                              type="color"
                              value={currentCustomColors.surface}
                              onChange={(e) => handleUpdateCustomColor('surface', e.target.value)}
                              className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                            />
                          </label>
                          <label className="flex items-center justify-between p-1.5 rounded bg-[#FAF9F6] border border-[#E5E3DC] cursor-pointer">
                            <span className="text-[10px] text-zinc-700 font-medium">لون النصوص</span>
                            <input
                              type="color"
                              value={currentCustomColors.text}
                              onChange={(e) => handleUpdateCustomColor('text', e.target.value)}
                              className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Arabic Font Family */}
                      <div className="space-y-2 pt-2 border-t border-zinc-100">
                        <span className="text-[11px] font-bold text-zinc-700 block">
                          الخط العربي للموقع:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ARABIC_FONTS.map((font) => {
                            const isCurrentFont =
                              (currentTypography.fontFamily || 'Cairo') === font.id;
                            return (
                              <button
                                key={font.id}
                                type="button"
                                onClick={() => handleUpdateTypographyField('fontFamily', font.id)}
                                style={{ fontFamily: font.css }}
                                className={`p-2 rounded border text-right transition-all cursor-pointer ${
                                  isCurrentFont
                                    ? 'bg-zinc-900 text-white border-zinc-900'
                                    : 'bg-[#FAF9F6] text-zinc-800 border-[#D8D5CD] hover:border-zinc-500'
                                }`}
                              >
                                <div className="text-[11px] font-bold">{font.name}</div>
                                <div
                                  className={`text-[9px] ${
                                    isCurrentFont ? 'text-zinc-300' : 'text-zinc-500'
                                  }`}
                                >
                                  {font.desc}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Section Order, Visibility & Layout Variants */}
                <div className="bg-white border border-[#DFDDD6] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDesignPanel(openDesignPanel === 'sections' ? '' : 'sections')
                    }
                    className="w-full px-4 py-3 flex items-center justify-between text-right hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-900">
                        ٢. ترتيب وإظهار أقسام الصفحة
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        تبسيط الصفحة، إخفاء الأقسام، أو تغيير تخطيط كل قسم
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {openDesignPanel === 'sections' ? '−' : '+'}
                    </span>
                  </button>

                  {openDesignPanel === 'sections' && (
                    <div className="p-4 pt-2 border-t border-zinc-100 space-y-3">
                      {/* Quick Page Simplicity Bar inside Sections Accordion */}
                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleApplyPagePreset('single')}
                          className={`py-1.5 px-2 rounded border font-semibold cursor-pointer ${
                            activePageMode === 'single'
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-[#FAF9F6] text-zinc-700 border-[#D8D5CD]'
                          }`}
                        >
                          منتج واحد (٣)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPagePreset('focused')}
                          className={`py-1.5 px-2 rounded border font-semibold cursor-pointer ${
                            activePageMode === 'focused'
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-[#FAF9F6] text-zinc-700 border-[#D8D5CD]'
                          }`}
                        >
                          متجر مختصر (٤)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPagePreset('full')}
                          className={`py-1.5 px-2 rounded border font-semibold cursor-pointer ${
                            activePageMode === 'full'
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-[#FAF9F6] text-zinc-700 border-[#D8D5CD]'
                          }`}
                        >
                          موقع شامل (٩)
                        </button>
                      </div>

                      <div className="p-2 bg-[#FAF9F6] rounded border border-[#E5E3DC] flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-700">شريط الإعلان العلوي</span>
                        <input
                          type="checkbox"
                          checked={pageData.sections?.announcement ?? true}
                          onChange={() => handleToggleSection('announcement')}
                          className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1.5">
                        {currentSectionOrder.map((secKey, idx) => {
                          const isVisible = pageData.sections?.[secKey] ?? true;
                          const layoutOptions = SECTION_LAYOUT_OPTIONS[secKey];
                          const activeLayout = currentLayouts[secKey];

                          return (
                            <div
                              key={secKey}
                              draggable
                              onDragStart={() => handleDragStart(secKey)}
                              onDragOver={(e) => handleDragOver(e, secKey)}
                              onDrop={() => handleDrop(secKey)}
                              onDragEnd={() => {
                                setDraggedSection(null);
                                setDragOverSection(null);
                              }}
                              className={`p-2.5 rounded border transition-all ${
                                isVisible
                                  ? 'bg-[#FAF9F6] border-[#DFDDD6]'
                                  : 'bg-zinc-100/60 border-zinc-200 opacity-55'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-zinc-800 truncate">
                                  {idx + 1}. {SECTION_LABELS[secKey] || secKey}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveSection(secKey, 'up')}
                                    className="w-5 h-5 rounded bg-white border border-zinc-200 disabled:opacity-30 text-zinc-800 text-[10px] flex items-center justify-center cursor-pointer"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === currentSectionOrder.length - 1}
                                    onClick={() => handleMoveSection(secKey, 'down')}
                                    className="w-5 h-5 rounded bg-white border border-zinc-200 disabled:opacity-30 text-zinc-800 text-[10px] flex items-center justify-center cursor-pointer"
                                  >
                                    ↓
                                  </button>
                                  <input
                                    type="checkbox"
                                    checked={isVisible}
                                    onChange={() => handleToggleSection(secKey)}
                                    className="accent-zinc-900 w-3.5 h-3.5 mr-1 cursor-pointer"
                                  />
                                </div>
                              </div>

                              {isVisible && layoutOptions && (
                                <div className="mt-2 pt-1.5 border-t border-zinc-200/60 flex flex-wrap gap-1">
                                  {layoutOptions.map((opt) => {
                                    const isChosen = activeLayout === opt.id;
                                    return (
                                      <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleChangeSectionLayout(secKey, opt.id)}
                                        className={`text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer ${
                                          isChosen
                                            ? 'bg-zinc-900 text-white font-semibold'
                                            : 'bg-white text-zinc-700 border border-zinc-200'
                                        }`}
                                      >
                                        {opt.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Font Sizes & Typography Scale */}
                <div className="bg-white border border-[#DFDDD6] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDesignPanel(openDesignPanel === 'typography' ? '' : 'typography')
                    }
                    className="w-full px-4 py-3 flex items-center justify-between text-right hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-900">
                        ٣. أحجام الخطوط والنصوص
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        تكبير أو تصغير العناوين، الفقرات، والأسعار
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {openDesignPanel === 'typography' ? '−' : '+'}
                    </span>
                  </button>

                  {openDesignPanel === 'typography' && (
                    <div className="p-4 pt-2 border-t border-zinc-100 space-y-3">
                      <div className="grid grid-cols-4 gap-1.5">
                        {TYPOGRAPHY_PRESETS.map((preset) => {
                          const isChosen = currentTypography.scale === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleApplyTypographyPreset(preset.values)}
                              className={`py-1.5 px-2 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                                isChosen
                                  ? 'bg-zinc-900 text-white border-zinc-900'
                                  : 'bg-[#FAF9F6] text-zinc-700 border-[#D8D5CD]'
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2.5 pt-1">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-zinc-700">العنوان الرئيسي</span>
                            <span className="font-mono font-bold">{currentTypography.heroSize}px</span>
                          </div>
                          <input
                            type="range"
                            min="22"
                            max="54"
                            value={currentTypography.heroSize}
                            onChange={(e) => handleUpdateTypographyField('heroSize', e.target.value)}
                            className="w-full accent-zinc-900 cursor-pointer h-1.5"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-zinc-700">عناوين الأقسام</span>
                            <span className="font-mono font-bold">{currentTypography.sectionSize}px</span>
                          </div>
                          <input
                            type="range"
                            min="16"
                            max="34"
                            value={currentTypography.sectionSize}
                            onChange={(e) => handleUpdateTypographyField('sectionSize', e.target.value)}
                            className="w-full accent-zinc-900 cursor-pointer h-1.5"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-zinc-700">النصوص والوصف</span>
                            <span className="font-mono font-bold">{currentTypography.bodySize}px</span>
                          </div>
                          <input
                            type="range"
                            min="11"
                            max="19"
                            value={currentTypography.bodySize}
                            onChange={(e) => handleUpdateTypographyField('bodySize', e.target.value)}
                            className="w-full accent-zinc-900 cursor-pointer h-1.5"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-zinc-700">حجم الأسعار</span>
                            <span className="font-mono font-bold">{currentTypography.priceSize}px</span>
                          </div>
                          <input
                            type="range"
                            min="14"
                            max="30"
                            value={currentTypography.priceSize}
                            onChange={(e) => handleUpdateTypographyField('priceSize', e.target.value)}
                            className="w-full accent-zinc-900 cursor-pointer h-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 4: EasyOrders COD & WhatsApp Settings */}
                <div className="bg-white border border-[#DFDDD6] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDesignPanel(openDesignPanel === 'cod_settings' ? '' : 'cod_settings')
                    }
                    className="w-full px-4 py-3 flex items-center justify-between text-right hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-900">
                        ٤. إعدادات الشحن والواتساب (EasyOrders)
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        رقم الواتساب، شريط الشراء السفلي، ومضاعفات المبيعات
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {openDesignPanel === 'cod_settings' ? '−' : '+'}
                    </span>
                  </button>

                  {openDesignPanel === 'cod_settings' && (
                    <div className="p-4 pt-2 border-t border-zinc-100 space-y-3 text-xs">
                      <div className="space-y-2 p-2.5 bg-[#FAF9F6] rounded border border-[#E5E3DC]">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-700">عروض التوفير (١ / ٢ / ٣ قطع)</span>
                          <input
                            type="checkbox"
                            checked={currentEasyOrder.enableBundleSelector ?? true}
                            onChange={(e) =>
                              handleUpdateEasyOrder('enableBundleSelector', e.target.checked)
                            }
                            className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-700">عرض الإضافة السريع (Order Bump)</span>
                          <input
                            type="checkbox"
                            checked={currentEasyOrder.enableOrderBump ?? true}
                            onChange={(e) =>
                              handleUpdateEasyOrder('enableOrderBump', e.target.checked)
                            }
                            className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-700">مؤشر ندرة المخزون المتبقي</span>
                          <input
                            type="checkbox"
                            checked={currentEasyOrder.enableStockScarcity ?? true}
                            onChange={(e) =>
                              handleUpdateEasyOrder('enableStockScarcity', e.target.checked)
                            }
                            className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-700">شريط الشراء السفلي الثابت</span>
                          <input
                            type="checkbox"
                            checked={currentEasyOrder.enableStickyBar ?? true}
                            onChange={(e) =>
                              handleUpdateEasyOrder('enableStickyBar', e.target.checked)
                            }
                            className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-zinc-500 block mb-1">
                          رقم واتساب لاستقبال الطلبات (بالكود الدولي)
                        </span>
                        <input
                          type="text"
                          value={pageData.whatsappPhone || ''}
                          onChange={(e) => handleUpdateField('whatsappPhone', e.target.value)}
                          placeholder="201012345678"
                          className="w-full bg-[#FAF9F6] border border-[#D8D5CD] rounded px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[11px] text-zinc-500 block mb-1">العملة</span>
                          <input
                            type="text"
                            value={pageData.currency || 'ج.م'}
                            onChange={(e) => handleUpdateField('currency', e.target.value)}
                            className="w-full bg-[#FAF9F6] border border-[#D8D5CD] rounded px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-zinc-500 block mb-1">القطع المتبقية</span>
                          <input
                            type="number"
                            value={currentEasyOrder.stockRemaining ?? 9}
                            onChange={(e) =>
                              handleUpdateEasyOrder(
                                'stockRemaining',
                                Math.max(1, Number(e.target.value) || 9)
                              )
                            }
                            className="w-full bg-[#FAF9F6] border border-[#D8D5CD] rounded px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Left Area: Main Scrollable Preview Canvas (No Extra Cluttered Sub-Header!) */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          <CanvasFrame
            key={`${activeProjectId}_${canvasResetKey}`}
            pageData={pageData}
            onUpdateField={handleUpdateField}
            onMoveSection={handleMoveSection}
            onChangeSectionLayout={handleChangeSectionLayout}
            onToggleSection={handleToggleSection}
            onOpenImagePicker={openImagePicker}
            onSubmitOrder={handleSubmitOrder}
            orders={orders}
            activeThemeKey={activeThemeKey}
            deviceView={deviceView}
            isFullscreen={false}
          />
        </main>
      </div>

      {/* Image Uploader & Library Modal */}
      <ImageEditorModal
        isOpen={imagePickerConfig.isOpen}
        onClose={() => setImagePickerConfig((prev) => ({ ...prev, isOpen: false }))}
        title={imagePickerConfig.title}
        currentUrl={imagePickerConfig.currentUrl}
        onSelectImage={(newUrl) => {
          if (imagePickerConfig.onSelect) {
            imagePickerConfig.onSelect(newUrl);
          }
        }}
      />

      {/* Multi-Project Workspace Modal */}
      <ProjectsModal
        isOpen={showProjectsModal}
        onClose={() => setShowProjectsModal(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
      />

      {/* Live Publishing Center Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        project={activeProject}
        onPublish={handlePublishActiveProject}
        onUnpublish={handleUnpublishActiveProject}
      />

      {/* EasyOrders COD Inbox & Excel Export Modal */}
      <OrdersModal
        isOpen={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
      />

      {/* Code Export Modal */}
      <CodeExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        pageData={pageData}
        activeThemeKey={activeThemeKey}
      />
    </div>
  );
}
