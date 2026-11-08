import React, { useState } from 'react';
import { DESIGN_THEMES, PRESET_PROMPTS } from '../engine/templates';
import { getLiveShareUrl } from '../engine/projects';

export default function ProjectsModal({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDuplicateProject,
  onDeleteProject,
  onRenameProject,
}) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newTheme, setNewTheme] = useState('editorial');
  const [editingId, setEditingId] = useState(null);
  const [editingNameVal, setEditingNameVal] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(null);

  if (!isOpen) return null;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim() && !newPrompt.trim()) return;
    onCreateProject({
      name: newName.trim() || 'مشروع جديد',
      prompt:
        newPrompt.trim() ||
        `متجر أو مشروع باسم "${newName.trim() || 'مشروع جديد'}" يقدم منتجات وخدمات مميزة بأسعار تنافسية`,
      theme: newTheme,
    });
    setNewName('');
    setNewPrompt('');
    setShowNewForm(false);
  };

  const handleCopyUrl = (slug) => {
    const url = getLiveShareUrl(slug);
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const startRename = (proj) => {
    setEditingId(proj.id);
    setEditingNameVal(proj.name || proj.pageData?.brandName || '');
  };

  const saveRename = (id) => {
    if (editingNameVal.trim()) {
      onRenameProject(id, editingNameVal.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#F7F6F2] text-zinc-900 border border-[#D8D5CD] rounded-lg max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E3DC]">
          <div>
            <h2 className="text-base font-bold text-zinc-900">إدارة المشاريع والمواقع</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              تنقل بين مشاريعك، أو أنشئ موقعاً جديداً برابط نشر مستقل لكل عميل أو علامة تجارية
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNewForm(!showNewForm)}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              {showNewForm ? 'إلغاء الإنشاء' : '+ مشروع جديد'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

        {/* Create New Project Drawer */}
        {showNewForm && (
          <form
            onSubmit={handleCreateSubmit}
            className="my-4 p-5 bg-white border border-zinc-900 rounded space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#EAE8E1] pb-2.5">
              <h3 className="text-xs font-bold text-zinc-900">إعداد مشروع جديد مستقل</h3>
              <span className="text-[11px] text-zinc-400">سيتم توليد كافة الأقسام والكتالوج تلقائياً</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                  اسم المشروع أو العلامة التجارية
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: دار سكون، محمصة قاف، عيادة النور..."
                  className="w-full bg-[#FAF9F6] border border-[#D8D5CD] rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                  السمة اللونية المبدئية
                </label>
                <select
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#D8D5CD] rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
                >
                  {Object.values(DESIGN_THEMES).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.desc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                وصف المشروع والمنتجات والأسعار (أو اختر نموذجاً جاهزاً بالأسفل)
              </label>
              <textarea
                rows="2"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="اكتب نبذة عن المنتجات والأسعار ليتم بناء الكتالوج والباقات بناءً عليها..."
                className="w-full bg-[#FAF9F6] border border-[#D8D5CD] rounded p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 resize-none"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PRESET_PROMPTS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setNewPrompt(preset.prompt);
                      setNewTheme(preset.theme);
                      if (!newName) setNewName(preset.title);
                    }}
                    className="text-[10px] px-2 py-1 rounded bg-[#F1EFEA] hover:bg-[#E5E2DC] text-zinc-700 border border-[#DFDDD6] transition-colors cursor-pointer"
                  >
                    + {preset.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded cursor-pointer"
              >
                إنشاء وفتح المشروع
              </button>
            </div>
          </form>
        )}

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            const themeObj = DESIGN_THEMES[proj.theme] || DESIGN_THEMES.editorial;
            const productCount = proj.pageData?.products?.length || 0;
            const liveUrl = getLiveShareUrl(proj.slug);

            return (
              <div
                key={proj.id}
                className={`p-4 rounded border transition-all bg-white ${
                  isActive
                    ? 'border-zinc-900 ring-1 ring-zinc-900/10'
                    : 'border-[#DFDDD6] hover:border-zinc-400'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Project Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {editingId === proj.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingNameVal}
                            onChange={(e) => setEditingNameVal(e.target.value)}
                            className="bg-zinc-50 border border-zinc-400 rounded px-2 py-0.5 text-xs font-bold text-zinc-900"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => saveRename(proj.id)}
                            className="text-[11px] px-2 py-0.5 bg-zinc-900 text-white rounded cursor-pointer"
                          >
                            حفظ
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-sm font-bold text-zinc-900">
                          {proj.name || proj.pageData?.brandName}
                        </h3>
                      )}

                      {isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-white font-semibold">
                          قيد التحرير حالياً
                        </span>
                      )}

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                          proj.isPublished
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                        }`}
                      >
                        {proj.isPublished ? 'مُفعَّل للمعاينة' : 'مسودة'}
                      </span>

                      <span className="text-[10px] text-zinc-400">
                        السمة: {themeObj.name} • {productCount} معروضات
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 truncate">
                      {proj.pageData?.headline || proj.prompt}
                    </p>

                    {/* Live URL bar */}
                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="text-zinc-400">رابط المعاينة المحلي:</span>
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-zinc-700 hover:text-zinc-950 underline dir-ltr truncate max-w-[260px]"
                      >
                        /p/{proj.slug}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(proj.slug)}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#F1EFEA] hover:bg-[#E5E2DC] text-zinc-700 cursor-pointer"
                      >
                        {copiedSlug === proj.slug ? 'تم نسخ الرابط' : 'نسخ'}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProject(proj.id);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                      >
                        فتح في المحرر
                      </button>
                    )}

                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#F1EFEA] hover:bg-[#E5E2DC] text-zinc-800 border border-[#D8D5CD] text-xs font-medium rounded transition-colors"
                    >
                      معاينة الموقع الحي ↗
                    </a>

                    <button
                      type="button"
                      onClick={() => startRename(proj)}
                      className="px-2.5 py-1.5 text-[11px] text-zinc-600 hover:text-zinc-900 border border-[#E5E3DC] rounded cursor-pointer"
                    >
                      تسمية
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicateProject(proj.id)}
                      className="px-2.5 py-1.5 text-[11px] text-zinc-600 hover:text-zinc-900 border border-[#E5E3DC] rounded cursor-pointer"
                    >
                      نسخ
                    </button>

                    {projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteProject(proj.id)}
                        className="px-2.5 py-1.5 text-[11px] text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 rounded cursor-pointer"
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

        {/* Footer */}
        <div className="pt-3 border-t border-[#E5E3DC] flex items-center justify-between text-[11px] text-zinc-500">
          <span>إجمالي المشاريع المحفوظة: {projects.length} مشاريع</span>
          <span>يتم حفظ كافة التعديلات تلقائياً لكل مشروع على حدة</span>
        </div>
      </div>
    </div>
  );
}

