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

  const [sidebarTab, setSidebarTab] = useState('design');
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
      } else {
        await new Promise((r) => setTimeout(r, 200));
        const nextData = generatePageData(finalPrompt, finalTheme);
        setPageData(nextData);
        if (nextData.theme) setActiveThemeKey(nextData.theme);
      }
    } catch (err) {
      setGenError(err.message || 'حدث خطأ أثناء التوليد، تم استخدام المحرك المحلي.');
      const fallback = generatePageData(finalPrompt, finalTheme);
      setPageData(fallback);
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

  const handleUpdateOrderStatus = (orderId, nextStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
    setOrders(updated);
    saveOrdersInbox(updated);
  };

  const handleDeleteOrder = (orderId) => {
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    saveOrdersInbox(updated);
  };

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
          pageData={pageData}
          onUpdateField={handleUpdateField}
          onMoveSection={handleMoveSection}
          onChangeSectionLayout={handleChangeSectionLayout}
          onToggleSection={handleToggleSection}
          onOpenImagePicker={openImagePicker}
          onSubmitOrder={handleSubmitOrder}
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
    <div className="min-h-screen bg-[#ECEAE4] text-zinc-900 flex flex-col lg:flex-row font-sans">
      {/* Right Sidebar: Comprehensive Multi-Tab Editor */}
      <aside className="w-full lg:w-[390px] xl:w-[420px] bg-[#F7F6F2] border-b lg:border-b-0 lg:border-l border-[#DFDDD6] flex flex-col shrink-0 lg:h-screen lg:sticky lg:top-0">
        {/* Studio Header + Active Project Switcher */}
        <div className="px-5 py-3.5 border-b border-[#E5E3DC] space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-900">مِعمار الصفحات</h1>
              <p className="text-[11px] text-zinc-500">محرر تخطيطات صفحات الهبوط والكتالوج</p>
            </div>
            <div className="flex items-center gap-1.5">
              {history.length > 0 && (
                <button
                  onClick={handleUndo}
                  className="text-[11px] text-zinc-600 hover:text-zinc-900 underline cursor-pointer ml-1"
                >
                  تراجع
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowOrdersModal(true)}
                className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                title="صندوق الطلبات وتصدير شيت الشحن (EasyOrders Inbox)"
              >
                <span>الطلبات ({orders.length})</span>
                {newOrdersCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowProjectsModal(true)}
                className="px-2.5 py-1.5 bg-white hover:bg-[#ECEAE3] text-zinc-900 border border-[#D8D5CD] rounded text-[11px] font-semibold transition-colors cursor-pointer"
              >
                المشاريع ({projects.length})
              </button>
            </div>
          </div>

          {/* Active Project Status Bar */}
          <div className="px-3 py-2 rounded bg-white border border-[#E2DFD7] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 truncate">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  activeProject?.isPublished ? 'bg-emerald-600' : 'bg-zinc-400'
                }`}
              />
              <span className="text-zinc-500">المشروع:</span>
              <strong className="text-zinc-900 truncate">
                {pageData.brandName || activeProject?.name}
              </strong>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowProjectsModal(true)}
                className="text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
              >
                تبديل
              </button>
              <span className="text-zinc-300">|</span>
              <button
                type="button"
                onClick={() => setShowPublishModal(true)}
                className="font-semibold text-zinc-900 hover:underline cursor-pointer"
              >
                {activeProject?.isPublished ? 'الرابط الحي' : 'نشر الآن'}
              </button>
            </div>
          </div>
        </div>

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
            ١. الوصف والتوليد
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
            ٢. المنتجات والأسعار
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
            ٣. التخطيط والأقسام
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PROMPT & GENERATION */}
          {sidebarTab === 'prompt' && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800">اطلب مواصفات موقعك بالتفصيل</label>
                  <button
                    type="button"
                    onClick={() => setShowKeyField(!showKeyField)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
                  >
                    {geminiKey ? 'مفتاح Gemini متصل' : 'ربط Gemini API (اختياري)'}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  اكتب اسم مشروعك، مجاله، أسعارك، أو نسبة الخصم (مثال: براند عطور باسم "سكون" بأسعار تبدأ من 350 ج.م وخصم 20%).
                </p>

                {showKeyField && (
                  <div className="p-3 bg-white border border-[#D8D5CD] rounded space-y-1.5">
                    <label className="text-[11px] font-medium text-zinc-700 block">
                      مفتاح Gemini API لتوليد مخصص لأي مجال:
                    </label>
                    <input
                      type="password"
                      value={geminiKey}
                      onChange={(e) => handleSaveKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-zinc-50 border border-[#D8D5CD] rounded px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                )}

                <textarea
                  rows="4"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="صف مشروعك ومنتجاتك وأسعارك هنا..."
                  className="w-full bg-white border border-[#D8D5CD] rounded p-3 text-xs text-zinc-900 leading-relaxed placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors resize-none"
                />

                {genError && <p className="text-[11px] text-amber-800">{genError}</p>}

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleGenerate()}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  {isGenerating ? 'جاري بناء الموقع بالكامل...' : 'بناء وتحديث الموقع'}
                </button>
              </div>

              {/* Presets */}
              <div className="pt-4 border-t border-[#E5E3DC] space-y-2.5">
                <span className="text-xs font-bold text-zinc-800 block">نماذج قطاعات كاملة بتخطيطات متنوعة:</span>
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
            </>
          )}

          {/* TAB 2: DEEP CONTENT, IMAGES, PRODUCTS & PRICING EDITOR */}
          {sidebarTab === 'content' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-900 border-b border-[#E5E3DC] pb-2">
                  البيانات الأساسية والصورة الرئيسية
                </h3>

                <div>
                  <span className="text-[11px] text-zinc-500 block mb-1">اسم العلامة التجارية</span>
                  <input
                    type="text"
                    value={pageData.brandName || ''}
                    onChange={(e) => handleUpdateField('brandName', e.target.value)}
                    className="w-full bg-white border border-[#D8D5CD] rounded px-2.5 py-1.5 text-xs text-zinc-900"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-zinc-500 block mb-1">العنوان الرئيسي (Headline)</span>
                  <textarea
                    rows="2"
                    value={pageData.headline || ''}
                    onChange={(e) => handleUpdateField('headline', e.target.value)}
                    className="w-full bg-white border border-[#D8D5CD] rounded p-2 text-xs text-zinc-900"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-zinc-500 block mb-1">شريط الإعلان العلوي</span>
                  <input
                    type="text"
                    value={pageData.announcement || ''}
                    onChange={(e) => handleUpdateField('announcement', e.target.value)}
                    className="w-full bg-white border border-[#D8D5CD] rounded px-2.5 py-1.5 text-xs text-zinc-900"
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

              {/* Products / Catalog Manager */}
              <div className="space-y-3 pt-2 border-t border-[#E5E3DC]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-900">
                    إدارة المنتجات والخدمات ({products.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addNewProductItem}
                    className="text-[11px] font-semibold text-zinc-900 underline cursor-pointer"
                  >
                    + إضافة منتج
                  </button>
                </div>

                <div className="space-y-3">
                  {products.map((prod, idx) => (
                    <div
                      key={prod.id}
                      className="p-3 bg-white border border-[#DFDDD6] rounded space-y-2"
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
                            className="w-full text-xs font-bold text-zinc-900 border-b border-transparent focus:border-zinc-400 focus:outline-none"
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
                            onChange={(e) => updateProductItem(idx, 'price', Number(e.target.value) || 0)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block">التصنيف</span>
                          <input
                            type="text"
                            value={prod.category || ''}
                            onChange={(e) => updateProductItem(idx, 'category', e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Tiers Quick Editor */}
              {pageData.pricingTiers && (
                <div className="space-y-3 pt-2 border-t border-[#E5E3DC]">
                  <h3 className="text-xs font-bold text-zinc-900">تعديل باقات الأسعار الثلاث</h3>
                  {pageData.pricingTiers.map((tier, idx) => (
                    <div key={tier.id || idx} className="p-2.5 bg-white border border-[#DFDDD6] rounded grid grid-cols-2 gap-2">
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
                          className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs"
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
                          className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* EasyOrders Tiered Bundles & Variants Editor */}
              <div className="space-y-3 pt-2 border-t border-[#E5E3DC]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900">
                      عروض التوفير والكميات (نظام EasyOrders)
                    </h3>
                    <p className="text-[10px] text-zinc-500">
                      تظهر داخل فورم الشراء السريع لمضاعفة قيمة السلة
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentEasyOrder.enableBundleSelector ?? true}
                    onChange={(e) => handleUpdateEasyOrder('enableBundleSelector', e.target.checked)}
                    className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer"
                    title="تفعيل أو إيقاف عروض الكميات"
                  />
                </div>

                {(currentEasyOrder.bundleOffers || []).map((offer, idx) => (
                  <div
                    key={offer.id || idx}
                    className="p-2.5 bg-white border border-[#DFDDD6] rounded space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-zinc-400 block">اسم العرض ({offer.qty} قطع)</span>
                        <input
                          type="text"
                          value={offer.title}
                          onChange={(e) => handleUpdateBundleOffer(idx, 'title', e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs font-semibold"
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
                          className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
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

                {/* Variants & Order Bump Customization */}
                <div className="p-2.5 bg-white border border-[#DFDDD6] rounded space-y-2">
                  <div>
                    <span className="text-[10px] text-zinc-500 block mb-1">
                      عنوان خيارات القطعة (مثال: المقاس واللون / الحجم والتركيز)
                    </span>
                    <input
                      type="text"
                      value={currentEasyOrder.variantLabel || ''}
                      onChange={(e) => handleUpdateEasyOrder('variantLabel', e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block mb-1">
                      الخيارات المتاحة لكل قطعة (افصل بينها بفاصلة ،)
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
                      className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECTION REORDERING, LAYOUT VARIANTS, TYPOGRAPHY & THEME */}
          {sidebarTab === 'design' && (
            <div className="space-y-6">
              {/* Color Palettes & Custom Brand Color Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 block">
                    السمة اللونية وألوان الهوية (Brand Colors)
                  </label>
                  {currentCustomColors.enabled && (
                    <button
                      type="button"
                      onClick={handleDisableCustomColors}
                      className="text-[11px] text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
                    >
                      العودة للثيمات الجاهزة
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
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
                        className={`py-2 px-3 rounded text-xs font-medium border text-right transition-all cursor-pointer ${
                          isSelected
                            ? 'border-zinc-900 bg-zinc-900 text-white'
                            : 'border-[#D8D5CD] bg-white text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        {th.name}
                      </button>
                    );
                  })}
                </div>

                {/* Curated Brand Color Swatches + Custom HTML5 Color Pickers */}
                <div className="p-3.5 bg-white rounded border border-[#DFDDD6] space-y-3">
                  <span className="text-[11px] font-bold text-zinc-700 block">
                    لوحات ألوان البراندات وتخصيص الألوان الحر:
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {BRAND_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyBrandColorPreset(preset)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#D8D5CD] hover:border-zinc-900 bg-[#FAF9F6] text-[11px] font-medium text-zinc-800 cursor-pointer"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-zinc-100">
                    <label className="flex items-center justify-between p-2 rounded bg-[#FAF9F6] border border-[#E5E3DC] cursor-pointer">
                      <span className="text-[11px] text-zinc-700 font-medium">لون الأزرار والبراند</span>
                      <input
                        type="color"
                        value={currentCustomColors.primary}
                        onChange={(e) => handleUpdateCustomColor('primary', e.target.value)}
                        className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded bg-[#FAF9F6] border border-[#E5E3DC] cursor-pointer">
                      <span className="text-[11px] text-zinc-700 font-medium">لون خلفية الموقع</span>
                      <input
                        type="color"
                        value={currentCustomColors.background}
                        onChange={(e) => handleUpdateCustomColor('background', e.target.value)}
                        className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded bg-[#FAF9F6] border border-[#E5E3DC] cursor-pointer">
                      <span className="text-[11px] text-zinc-700 font-medium">لون البطاقات</span>
                      <input
                        type="color"
                        value={currentCustomColors.surface}
                        onChange={(e) => handleUpdateCustomColor('surface', e.target.value)}
                        className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded bg-[#FAF9F6] border border-[#E5E3DC] cursor-pointer">
                      <span className="text-[11px] text-zinc-700 font-medium">لون النصوص</span>
                      <input
                        type="color"
                        value={currentCustomColors.text}
                        onChange={(e) => handleUpdateCustomColor('text', e.target.value)}
                        className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Arabic Font Family Selector */}
              <div className="space-y-2.5 pt-4 border-t border-[#E5E3DC]">
                <label className="text-xs font-bold text-zinc-900 block">
                  اختيار الخط العربي للموقع (6 خطوط عربية)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ARABIC_FONTS.map((font) => {
                    const isCurrentFont = (currentTypography.fontFamily || 'Cairo') === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => handleUpdateTypographyField('fontFamily', font.id)}
                        style={{ fontFamily: font.css }}
                        className={`p-2.5 rounded border text-right transition-all cursor-pointer ${
                          isCurrentFont
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-800 border-[#D8D5CD] hover:border-zinc-500'
                        }`}
                      >
                        <div className="text-xs font-bold">{font.name}</div>
                        <div
                          className={`text-[10px] mt-0.5 ${
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

              {/* Typography & Font Size Controls */}
              <div className="space-y-3 pt-4 border-t border-[#E5E3DC]">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-zinc-900 block">
                      التحكم في حجم الخطوط والنصوص
                    </label>
                    <p className="text-[11px] text-zinc-500">
                      اختر مقياساً عاماً أو خصص حجم كل عنصر بالبيكسل
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyTypographyPreset(DEFAULT_TYPOGRAPHY)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
                  >
                    ضبط افتراضي
                  </button>
                </div>

                {/* 4 Quick Presets */}
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
                            : 'bg-white text-zinc-700 border-[#D8D5CD] hover:bg-zinc-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Fine-Grained Font Size Sliders */}
                <div className="p-3.5 bg-white rounded border border-[#DFDDD6] space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-zinc-700 font-medium">حجم العنوان الرئيسي (Hero)</span>
                      <span className="font-mono font-bold text-zinc-900">{currentTypography.heroSize}px</span>
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
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-zinc-700 font-medium">حجم عناوين الأقسام</span>
                      <span className="font-mono font-bold text-zinc-900">{currentTypography.sectionSize}px</span>
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
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-zinc-700 font-medium">حجم عناوين المنتجات والبطاقات</span>
                      <span className="font-mono font-bold text-zinc-900">{currentTypography.cardTitleSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="23"
                      value={currentTypography.cardTitleSize}
                      onChange={(e) => handleUpdateTypographyField('cardTitleSize', e.target.value)}
                      className="w-full accent-zinc-900 cursor-pointer h-1.5"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-zinc-700 font-medium">حجم الوصف والفقرات النصية</span>
                      <span className="font-mono font-bold text-zinc-900">{currentTypography.bodySize}px</span>
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
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-zinc-700 font-medium">حجم الأسعار والأرقام</span>
                      <span className="font-mono font-bold text-zinc-900">{currentTypography.priceSize}px</span>
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

              {/* Interactive Section Order & Layout Variant Builder */}
              <div className="space-y-3 pt-4 border-t border-[#E5E3DC]">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-zinc-900 block">
                      ترتيب الأقسام وتخطيط كل قسم
                    </label>
                    <p className="text-[11px] text-zinc-500">
                      اسحب القسم لإعادة ترتيبه أو استخدم الأسهم، واختر التخطيط المناسب
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetLayoutAndOrder}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 underline shrink-0 cursor-pointer"
                  >
                    استعادة الافتراضي
                  </button>
                </div>

                {/* Top Announcement Toggle */}
                <div className="p-2.5 bg-white rounded border border-[#DFDDD6] flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-700">شريط التنبيه العلوي (ثابت بالأعلى)</span>
                  <input
                    type="checkbox"
                    checked={pageData.sections?.announcement ?? true}
                    onChange={() => handleToggleSection('announcement')}
                    className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer"
                  />
                </div>

                {/* Reorderable Sections List */}
                <div className="space-y-2">
                  {currentSectionOrder.map((secKey, idx) => {
                    const isVisible = pageData.sections?.[secKey] ?? true;
                    const layoutOptions = SECTION_LAYOUT_OPTIONS[secKey];
                    const activeLayout = currentLayouts[secKey];
                    const isDragging = draggedSection === secKey;
                    const isDragOver = dragOverSection === secKey;

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
                        className={`p-3 rounded border transition-all ${
                          isDragging
                            ? 'opacity-50 border-zinc-900 bg-zinc-100'
                            : isDragOver
                            ? 'border-2 border-zinc-900 bg-zinc-50'
                            : isVisible
                            ? 'bg-white border-[#DFDDD6]'
                            : 'bg-zinc-100/70 border-zinc-200 opacity-60'
                        }`}
                      >
                        {/* Top row: Drag Handle + Name + Up/Down + Visibility */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="text-zinc-400 cursor-grab active:cursor-grabbing select-none font-mono text-xs"
                              title="اسحب لتغيير الترتيب"
                            >
                              ::
                            </span>
                            <span className="text-xs font-bold text-zinc-800 truncate">
                              {idx + 1}. {SECTION_LABELS[secKey] || secKey}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSection(secKey, 'up')}
                              className="w-6 h-6 rounded bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 text-zinc-800 text-xs flex items-center justify-center cursor-pointer"
                              title="تحريك لأعلى"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              disabled={idx === currentSectionOrder.length - 1}
                              onClick={() => handleMoveSection(secKey, 'down')}
                              className="w-6 h-6 rounded bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 text-zinc-800 text-xs flex items-center justify-center cursor-pointer"
                              title="تحريك لأسفل"
                            >
                              ↓
                            </button>
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={() => handleToggleSection(secKey)}
                              title="إظهار أو إخفاء القسم"
                              className="accent-zinc-900 w-3.5 h-3.5 mr-1.5 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Bottom row: Layout Variants Selector (if section has variants and is visible) */}
                        {isVisible && layoutOptions && (
                          <div className="mt-2.5 pt-2 border-t border-zinc-100">
                            <div className="flex flex-wrap gap-1">
                              {layoutOptions.map((opt) => {
                                const isChosen = activeLayout === opt.id;
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleChangeSectionLayout(secKey, opt.id)}
                                    className={`text-[10px] px-2 py-1 rounded transition-colors cursor-pointer ${
                                      isChosen
                                        ? 'bg-zinc-900 text-white font-semibold'
                                        : 'bg-[#F1EFEA] text-zinc-700 hover:bg-[#E4E1D8]'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order, EasyOrders COD & WhatsApp Settings */}
              <div className="space-y-3 pt-4 border-t border-[#E5E3DC]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 block">
                    إعدادات الدفع عند الاستلام (EasyOrders COD)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowOrdersModal(true)}
                    className="text-[11px] font-semibold text-zinc-900 underline cursor-pointer"
                  >
                    فتح سجل الطلبات ({orders.length})
                  </button>
                </div>

                {/* Conversion Boosters Toggles */}
                <div className="p-3 bg-white rounded border border-[#DFDDD6] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-700 font-medium">عروض التوفير (١ قطعة / ٢ قطعة / ٣ قطع)</span>
                    <input
                      type="checkbox"
                      checked={currentEasyOrder.enableBundleSelector ?? true}
                      onChange={(e) => handleUpdateEasyOrder('enableBundleSelector', e.target.checked)}
                      className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-700 font-medium">عرض الترقية السريع داخل السلة (Order Bump)</span>
                    <input
                      type="checkbox"
                      checked={currentEasyOrder.enableOrderBump ?? true}
                      onChange={(e) => handleUpdateEasyOrder('enableOrderBump', e.target.checked)}
                      className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-700 font-medium">شريط ندرة المخزون المتبقي</span>
                    <input
                      type="checkbox"
                      checked={currentEasyOrder.enableStockScarcity ?? true}
                      onChange={(e) => handleUpdateEasyOrder('enableStockScarcity', e.target.checked)}
                      className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-700 font-medium">شريط الشراء السفلي الثابت (Sticky Bar)</span>
                    <input
                      type="checkbox"
                      checked={currentEasyOrder.enableStickyBar ?? true}
                      onChange={(e) => handleUpdateEasyOrder('enableStickyBar', e.target.checked)}
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
                    className="w-full bg-white border border-[#D8D5CD] rounded px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[11px] text-zinc-500 block mb-1">العملة</span>
                    <input
                      type="text"
                      value={pageData.currency || 'ج.م'}
                      onChange={(e) => handleUpdateField('currency', e.target.value)}
                      className="w-full bg-white border border-[#D8D5CD] rounded px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 block mb-1">عدد القطع المتبقية</span>
                    <input
                      type="number"
                      value={currentEasyOrder.stockRemaining ?? 9}
                      onChange={(e) =>
                        handleUpdateEasyOrder('stockRemaining', Math.max(1, Number(e.target.value) || 9))
                      }
                      className="w-full bg-white border border-[#D8D5CD] rounded px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Publish & Export Bar */}
        <div className="p-4 border-t border-[#E5E3DC] bg-[#F1EFEA] grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            نشر برابط حي مستقل
          </button>
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="py-2.5 px-3 bg-white hover:bg-[#ECEAE3] text-zinc-900 border border-[#D8D5CD] text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            تصدير الكود (HTML)
          </button>
        </div>
      </aside>

      {/* Left Area: Main Preview Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Minimal Workspace Bar */}
        <div className="h-12 border-b border-[#DFDDD6] bg-[#F3F1EC] px-6 flex items-center justify-between text-xs sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">حجم العرض:</span>
            <button
              onClick={() => setDeviceView('desktop')}
              className={`cursor-pointer transition-colors ${
                deviceView === 'desktop'
                  ? 'font-bold text-zinc-900 underline underline-offset-4'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              سطح المكتب
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`cursor-pointer transition-colors ${
                deviceView === 'mobile'
                  ? 'font-bold text-zinc-900 underline underline-offset-4'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              الجوال
            </button>

            <span className="text-zinc-300 hidden sm:inline">|</span>

            {/* Quick Font Size Controls in Top Bar */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-zinc-400">حجم الخط:</span>
              <button
                type="button"
                onClick={() => handleStepFontSizes(-1)}
                className="px-2 py-0.5 rounded bg-white border border-[#D8D5CD] hover:bg-zinc-100 text-zinc-800 font-bold text-[11px] cursor-pointer"
                title="تصغير الخطوط"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => handleStepFontSizes(1)}
                className="px-2 py-0.5 rounded bg-white border border-[#D8D5CD] hover:bg-zinc-100 text-zinc-800 font-bold text-[11px] cursor-pointer"
                title="تكبير الخطوط"
              >
                A+
              </button>
            </div>

            <span className="text-zinc-300 hidden md:inline">|</span>

            <a
              href={liveShareUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-950 bg-white/80 px-2.5 py-1 rounded border border-[#DFDDD6]"
              title="فتح معاينة الموقع كزائر في نافذة جديدة (محلياً على جهازك)"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeProject?.isPublished ? 'bg-emerald-600' : 'bg-zinc-400'
                }`}
              />
              <span>معاينة محلية كزائر</span>
              <span className="font-mono dir-ltr">(/p/{activeProject?.slug})</span>
              <span>↗</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowOrdersModal(true)}
              className="text-zinc-900 font-bold hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <span>صندوق الطلبات ({orders.length})</span>
              {newOrdersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px]">
                  {newOrdersCount} جديد
                </span>
              )}
            </button>
            <span className="text-zinc-300">|</span>
            <button
              type="button"
              onClick={() => setShowProjectsModal(true)}
              className="text-zinc-600 hover:text-zinc-900 font-medium cursor-pointer"
            >
              إدارة المشاريع ({projects.length})
            </button>
            <span className="text-zinc-300">|</span>
            <button
              onClick={() => setIsFullscreen(true)}
              className="text-zinc-700 font-medium hover:text-zinc-900 cursor-pointer"
            >
              معاينة بملء الشاشة
            </button>
          </div>
        </div>

        {/* Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          <CanvasFrame
            pageData={pageData}
            onUpdateField={handleUpdateField}
            onMoveSection={handleMoveSection}
            onChangeSectionLayout={handleChangeSectionLayout}
            onToggleSection={handleToggleSection}
            onOpenImagePicker={openImagePicker}
            onSubmitOrder={handleSubmitOrder}
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
