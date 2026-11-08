import React, { useState, useEffect } from 'react';
import CanvasFrame from './components/CanvasFrame';
import CodeExportModal from './components/CodeExportModal';
import ImageEditorModal from './components/ImageEditorModal';
import {
  generatePageData,
  generateWithGeminiAI,
  DESIGN_THEMES,
  PRESET_PROMPTS,
  DEFAULT_SECTIONS,
  DEFAULT_SECTION_ORDER,
  DEFAULT_LAYOUTS,
  SECTION_LAYOUT_OPTIONS,
} from './engine/templates';

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

export default function App() {
  const [sidebarTab, setSidebarTab] = useState('design'); // Open on 'design' or 'prompt'
  const [promptInput, setPromptInput] = useState(
    'دار عطور محلية باسم "أثر" تعتمد على الزيوت الطبيعية الخالصة وتعتيق الأخشاب العطرية يدوياً بأسعار تبدأ من 340 ج.م'
  );
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('pagecraft_gemini_key') || '');
  const [showKeyField, setShowKeyField] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const [activeThemeKey, setActiveThemeKey] = useState('editorial');
  const [deviceView, setDeviceView] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

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

  // Main Page Data State
  const [pageData, setPageData] = useState(() => {
    try {
      const saved = localStorage.getItem('pagecraft_v4_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          sectionOrder: parsed.sectionOrder || [...DEFAULT_SECTION_ORDER],
          layouts: { ...DEFAULT_LAYOUTS, ...(parsed.layouts || {}) },
          sections: { ...DEFAULT_SECTIONS, ...(parsed.sections || {}) },
        };
      }
    } catch {
      // ignore
    }
    return generatePageData(
      'دار عطور محلية باسم "أثر" تعتمد على الزيوت الطبيعية الخالصة وتعتيق الأخشاب العطرية يدوياً بأسعار تبدأ من 340 ج.م',
      'editorial'
    );
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem('pagecraft_v4_data', JSON.stringify(pageData));
    } catch {
      // ignore storage quota errors
    }
  }, [pageData]);

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
          activeThemeKey={activeThemeKey}
          deviceView="desktop"
          isFullscreen={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECEAE4] text-zinc-900 flex flex-col lg:flex-row font-sans">
      {/* Right Sidebar: Comprehensive Multi-Tab Editor */}
      <aside className="w-full lg:w-[390px] xl:w-[420px] bg-[#F7F6F2] border-b lg:border-b-0 lg:border-l border-[#DFDDD6] flex flex-col shrink-0 lg:h-screen lg:sticky lg:top-0">
        {/* Studio Header */}
        <div className="px-6 py-4 border-b border-[#E5E3DC] flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-900">مِعمار الصفحات</h1>
            <p className="text-[11px] text-zinc-500">محرر تخطيطات صفحات الهبوط والكتالوج</p>
          </div>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                onClick={handleUndo}
                className="text-[11px] text-zinc-600 hover:text-zinc-900 underline cursor-pointer"
              >
                تراجع
              </button>
            )}
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
            </div>
          )}

          {/* TAB 3: SECTION REORDERING, LAYOUT VARIANTS & THEME */}
          {sidebarTab === 'design' && (
            <div className="space-y-6">
              {/* Color Palettes */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-zinc-800 block">النمط اللوني للموقع</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(DESIGN_THEMES).map((key) => {
                    const th = DESIGN_THEMES[key];
                    const isSelected = activeThemeKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveThemeKey(key)}
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

              {/* Order & WhatsApp Settings */}
              <div className="space-y-3 pt-4 border-t border-[#E5E3DC]">
                <label className="text-xs font-bold text-zinc-800 block">
                  إعدادات سلة الطلب والواتساب
                </label>

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
                    <span className="text-[11px] text-zinc-500 block mb-1">رسوم التوصيل</span>
                    <input
                      type="number"
                      value={pageData.deliveryFee ?? 0}
                      onChange={(e) => handleUpdateField('deliveryFee', Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#D8D5CD] rounded px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Export Bar */}
        <div className="p-5 border-t border-[#E5E3DC] bg-[#F1EFEA]">
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            تصدير الموقع الكامل (HTML)
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
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-[11px] text-zinc-400">
              مرر الماوس فوق أي قسم في المعاينة لتغيير تخطيطه أو ترتيبه مباشرة
            </span>
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
