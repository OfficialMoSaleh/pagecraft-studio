import React, { useState, useEffect } from 'react';
import { sanitizeSlug, getLiveShareUrl } from '../engine/projects';

export default function PublishModal({
  isOpen,
  onClose,
  project,
  onPublish,
  onUnpublish,
}) {
  const [slugInput, setSlugInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishNotice, setPublishNotice] = useState('');

  useEffect(() => {
    if (project) {
      setSlugInput(project.slug || '');
      setPublishNotice('');
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const cleanPreviewSlug = sanitizeSlug(slugInput || project.name);
  const fullLiveUrl = getLiveShareUrl(cleanPreviewSlug);

  const handlePublishClick = async (e) => {
    e.preventDefault();
    setIsPublishing(true);
    setPublishNotice('');
    try {
      await onPublish(cleanPreviewSlug);
      setSlugInput(cleanPreviewSlug);
      setPublishNotice('تم نشر الموقع وتحديث الرابط الحي بنجاح. يمكنك الآن مشاركته مع عملائك.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullLiveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `تفضل بزيارة موقع ${project.pageData?.brandName || project.name} وتصفح الكتالوج والأسعار عبر الرابط التالي:\n${fullLiveUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#F7F6F2] text-zinc-900 border border-[#D8D5CD] rounded-lg max-w-xl w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E3DC]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900">نشر الموقع برابط حي مستقل</h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                  project.isPublished
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-zinc-200 text-zinc-700 border-zinc-300'
                }`}
              >
                {project.isPublished ? 'منشور ومُتاح' : 'مسودة غير منشورة'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              المشروع الحالي: <strong className="text-zinc-800">{project.name || project.pageData?.brandName}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer"
          >
            إغلاق
          </button>
        </div>

        {/* Custom URL Slug Form */}
        <form onSubmit={handlePublishClick} className="space-y-4">
          <div className="bg-white p-4 rounded border border-[#DFDDD6] space-y-3">
            <label className="text-xs font-bold text-zinc-800 block">
              تخصيص مسار الرابط الحي (Custom Slug)
            </label>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              اختر اسماً مختصراً للرابط (بحروف إنجليزية أو عربية أو أرقام) لفتحه كموقع مستقل للعملاء بدون أدوات التحرير:
            </p>

            <div className="flex items-center bg-[#FAF9F6] border border-[#D8D5CD] rounded overflow-hidden dir-ltr">
              <span className="px-3 py-2 bg-[#EFECE6] text-zinc-500 text-xs font-mono border-r border-[#D8D5CD] select-none">
                {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/p/
              </span>
              <input
                type="text"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                placeholder="athar-perfumes"
                className="flex-1 px-3 py-2 text-xs font-mono text-zinc-900 bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
              <span>الرابط النهائي:</span>
              <span className="font-mono text-zinc-800 dir-ltr">{fullLiveUrl}</span>
            </div>
          </div>

          {publishNotice && (
            <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
              {publishNotice}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPublishing}
              className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              {isPublishing
                ? 'جاري نشر الموقع وتحديث الرابط...'
                : project.isPublished
                ? 'تحديث الموقع المنشور الآن'
                : 'نشر الموقع وتفعيل الرابط الحي'}
            </button>

            {project.isPublished && (
              <button
                type="button"
                onClick={onUnpublish}
                className="px-3.5 py-2.5 bg-white hover:bg-red-50 text-red-700 border border-[#D8D5CD] hover:border-red-200 text-xs font-medium rounded transition-colors cursor-pointer"
              >
                إيقاف النشر
              </button>
            )}
          </div>
        </form>

        {/* Share & Preview Actions */}
        <div className="p-4 bg-white rounded border border-[#DFDDD6] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-800">مشاركة ومعاينة الرابط المستقل</span>
            {project.publishedAt && (
              <span className="text-[10px] text-zinc-400">
                آخر نشر: {new Date(project.publishedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="py-2 px-3 bg-[#F1EFEA] hover:bg-[#E5E2DC] text-zinc-900 border border-[#D8D5CD] rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? 'تم نسخ الرابط' : 'نسخ الرابط الحي'}
            </button>

            <a
              href={fullLiveUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold text-center transition-colors"
            >
              فتح الموقع في نافذة جديدة ↗
            </a>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2 px-3 bg-[#F1EFEA] hover:bg-[#E5E2DC] text-zinc-900 border border-[#D8D5CD] rounded text-xs font-medium transition-colors cursor-pointer"
            >
              مشاركة عبر واتساب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
