import React, { useState, useEffect } from 'react';
import {
  sanitizeSlug,
  getLiveShareUrl,
  getShareableCloudUrl,
} from '../engine/projects';
import { buildStandaloneHTML } from '../engine/exportHtml';

export default function PublishModal({
  isOpen,
  onClose,
  project,
  onPublish,
  onUnpublish,
}) {
  const [slugInput, setSlugInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [copiedCloud, setCopiedCloud] = useState(false);
  const [copiedLocal, setCopiedLocal] = useState(false);
  const [publishNotice, setPublishNotice] = useState('');

  useEffect(() => {
    if (project) {
      setSlugInput(project.slug || '');
      setPublishNotice('');
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const cleanPreviewSlug = sanitizeSlug(slugInput || project.name);
  const localPreviewUrl = getLiveShareUrl(cleanPreviewSlug);
  const cloudShareableUrl = getShareableCloudUrl(project, true);
  const localShareableTestUrl = getShareableCloudUrl(project, false);

  const handlePublishClick = async (e) => {
    e.preventDefault();
    setIsPublishing(true);
    setPublishNotice('');
    try {
      await onPublish(cleanPreviewSlug);
      setSlugInput(cleanPreviewSlug);
      setPublishNotice('تم تحديث بيانات النشر وتوليد رابط المشاركة السحابي بنجاح.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyCloud = () => {
    navigator.clipboard.writeText(cloudShareableUrl);
    setCopiedCloud(true);
    setTimeout(() => setCopiedCloud(false), 2500);
  };

  const handleCopyLocal = () => {
    navigator.clipboard.writeText(localPreviewUrl);
    setCopiedLocal(true);
    setTimeout(() => setCopiedLocal(false), 2500);
  };

  const handleShareWhatsAppCloud = () => {
    const brand = project.pageData?.brandName || project.name;
    const text = `تفضل بمعاينة موقع "${brand}" وتصفح الكتالوج والأسعار عبر الرابط التالي:\n${cloudShareableUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
              <h2 className="text-base font-bold text-zinc-900">مشاركة الموقع والنشر السحابي</h2>
              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                رابط مشاركة فوري بدون سيرفر
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

        {/* 1. SERVERLESS CLOUD SHAREABLE LINK (Works for anyone on the internet!) */}
        <div className="p-4 rounded bg-white border-2 border-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900">
              ١. رابط المشاركة العام عبر الإنترنت (يفتح لدى أي شخص فوراً)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-white font-mono">
              Serverless URL State
            </span>
          </div>

          <p className="text-[11px] text-zinc-600 leading-relaxed">
            يتم ضغط وتشفير كافة تعديلاتك (النصوص، الأسعار، التخطيط، الألوان، والخطوط) داخل الرابط نفسه ليعمل مباشرة عبر استضافة <strong>GitHub Pages</strong> العامة بدون قاعدة بيانات:
          </p>

          <div className="p-2.5 bg-[#FAF9F6] border border-[#D8D5CD] rounded font-mono text-[11px] text-zinc-700 truncate dir-ltr select-all">
            {cloudShareableUrl}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyCloud}
              className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              {copiedCloud ? 'تم نسخ الرابط العام!' : 'نسخ الرابط العام'}
            </button>

            <button
              type="button"
              onClick={handleShareWhatsAppCloud}
              className="py-2.5 px-3 bg-[#F1EFEA] hover:bg-[#E5E2DC] text-zinc-900 border border-[#D8D5CD] rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              إرسال لعميل عبر واتساب
            </button>

            <a
              href={cloudShareableUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 bg-white hover:bg-zinc-50 text-zinc-900 border border-[#D8D5CD] rounded text-xs font-semibold text-center transition-colors"
            >
              فتح الرابط العام ↗
            </a>
          </div>
        </div>

        {/* 2. LOCAL PREVIEW & STANDALONE HTML FILE */}
        <form onSubmit={handlePublishClick} className="p-4 bg-white rounded border border-[#DFDDD6] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-800 block">
              ٢. معاينة محلية على جهازك (/p/{cleanPreviewSlug}) أو تحميل ملف مستقل
            </label>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
              على جهازك فقط (Localhost)
            </span>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed">
            الرابط القصير <code className="font-mono">/p/{cleanPreviewSlug}</code> مخصص للمعاينة داخل متصفح جهازك الحالي. أما لإرسال الموقع لشخص آخر فاستخدم <strong>الرابط العام المشفّر بالأعلى</strong> أو حمّل ملف <code className="font-mono">index.html</code>:
          </p>

          <div className="flex items-center bg-[#FAF9F6] border border-[#D8D5CD] rounded overflow-hidden dir-ltr">
            <span className="px-3 py-1.5 bg-[#EFECE6] text-zinc-500 text-xs font-mono border-r border-[#D8D5CD] select-none">
              /p/
            </span>
            <input
              type="text"
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              placeholder="athar-perfumes"
              className="flex-1 px-3 py-1.5 text-xs font-mono text-zinc-900 bg-transparent focus:outline-none"
            />
          </div>

          {publishNotice && (
            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
              {publishNotice}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <a
              href={localShareableTestUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-3 bg-[#F1EFEA] hover:bg-[#E5E2DC] text-zinc-900 border border-[#D8D5CD] rounded text-xs font-semibold text-center transition-colors"
            >
              معاينة محلية كزائر ↗
            </a>

            <button
              type="button"
              onClick={handleCopyLocal}
              className="py-2 px-3 bg-white hover:bg-zinc-50 text-zinc-800 border border-[#D8D5CD] rounded text-xs font-medium transition-colors cursor-pointer"
            >
              {copiedLocal ? 'تم النسخ' : 'نسخ الرابط المحلي'}
            </button>

            <button
              type="button"
              onClick={handleDownloadStandaloneHtml}
              className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              تحميل ملف HTML
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
