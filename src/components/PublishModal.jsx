import React, { useState, useEffect } from 'react';
import { sanitizeSlug, getLiveShareUrl } from '../engine/projects';
import { buildStandaloneHTML } from './CodeExportModal';

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

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const cleanPreviewSlug = sanitizeSlug(slugInput || project.name);
  const fullLiveUrl = getLiveShareUrl(cleanPreviewSlug);

  const handlePublishClick = async (e) => {
    e.preventDefault();
    setIsPublishing(true);
    setPublishNotice('');
    try {
      await onPublish(cleanPreviewSlug);
      setSlugInput(cleanPreviewSlug);
      setPublishNotice(
        isLocalhost
          ? 'تم حفظ وتفعيل رابط المعاينة المحلية بنجاح. لتسليم الموقع لعميلك على الإنترنت استخدم تحميل ملف (index.html) بالأسفل.'
          : 'تم نشر الموقع وتحديث الرابط الحي بنجاح.'
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullLiveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadStandaloneHtml = () => {
    const html = buildStandaloneHTML(project.pageData, project.theme);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanPreviewSlug || 'index'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#F7F6F2] text-zinc-900 border border-[#D8D5CD] rounded-lg max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E3DC]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900">إعدادات النشر ومشاركة الموقع</h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                  project.isPublished
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-zinc-200 text-zinc-700 border-zinc-300'
                }`}
              >
                {project.isPublished ? 'مُفعَّل للمعاينة' : 'مسودة'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              المشروع الحالي:{' '}
              <strong className="text-zinc-800">{project.name || project.pageData?.brandName}</strong>
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

        {/* Clear Localhost Notice so user knows localhost is not a public internet link */}
        {isLocalhost && (
          <div className="p-4 rounded bg-amber-50/90 border border-amber-300 text-amber-950 space-y-2">
            <div className="text-xs font-bold">
              تنبيه مهم: رابط (/p/{cleanPreviewSlug}) هو رابط معاينة محلي على جهازك فقط
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900">
              بما أن البرنامج يعمل حالياً على جهازك الشخصي (<code className="font-mono">localhost</code>)، فإن هذا الرابط مخصص لك لتجربة الموقع كزائر على جهازك، <strong>ولن يفتح إذا أرسلته لشخص آخر على هاتفه</strong> إلا بعد رفع الموقع على استضافة عامة.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadStandaloneHtml}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-semibold rounded cursor-pointer"
              >
                تحميل ملف الموقع الجاهز ({cleanPreviewSlug}.html)
              </button>
              <a
                href="https://app.netlify.com/drop"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-amber-100/60 text-amber-950 border border-amber-300 text-[11px] font-semibold rounded"
              >
                رفع مجاني فوري على Netlify Drop ↗
              </a>
            </div>
          </div>
        )}

        {/* Custom URL Slug Form */}
        <form onSubmit={handlePublishClick} className="space-y-4">
          <div className="bg-white p-4 rounded border border-[#DFDDD6] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800 block">
                مسار رابط المعاينة المستقلة (Slug)
              </label>
              {isLocalhost && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium">
                  معاينة محلية (Localhost)
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              يفتح هذا المسار الموقع بدون أشرطة التعديل لتجربة سلة الشراء والطلب كما يراها العميل تماماً:
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
                ? 'جاري الحفظ والتحديث...'
                : 'حفظ وتحديث نسخة العرض المستقلة'}
            </button>

            {project.isPublished && (
              <button
                type="button"
                onClick={onUnpublish}
                className="px-3.5 py-2.5 bg-white hover:bg-red-50 text-red-700 border border-[#D8D5CD] hover:border-red-200 text-xs font-medium rounded transition-colors cursor-pointer"
              >
                تحويل لمسودة
              </button>
            )}
          </div>
        </form>

        {/* Actions */}
        <div className="p-4 bg-white rounded border border-[#DFDDD6] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-800">خيارات المعاينة والتسليم</span>
            {project.publishedAt && (
              <span className="text-[10px] text-zinc-400">
                آخر تحديث:{' '}
                {new Date(project.publishedAt).toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={fullLiveUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold text-center transition-colors"
            >
              فتح معاينة الموقع كزائر ↗
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3 bg-[#F1EFEA] hover:bg-[#E5E2DC] text-zinc-900 border border-[#D8D5CD] rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? 'تم نسخ رابط المعاينة' : 'نسخ رابط المعاينة المحلية'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
