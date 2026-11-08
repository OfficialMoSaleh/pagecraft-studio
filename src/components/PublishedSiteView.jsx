import React, { useState, useEffect } from 'react';
import CanvasFrame from './CanvasFrame';
import { resolvePublishedSite } from '../engine/projects';

export default function PublishedSiteView({ slug, onExitToStudio }) {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hideBadge, setHideBadge] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    resolvePublishedSite(slug).then((resolved) => {
      if (!active) return;
      setSite(resolved);
      setLoading(false);
      if (resolved?.pageData?.brandName) {
        document.title = `${resolved.pageData.brandName} — الموقع الرسمي`;
      }
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-2">
          <div className="text-sm font-bold text-zinc-900">جاري تحميل الموقع...</div>
          <div className="text-xs text-zinc-500 font-mono">/p/{slug}</div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-[#D8D5CD] rounded p-8 text-center space-y-4">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-100 text-zinc-600 inline-block">
            404 — الرابط غير متاح
          </span>
          <h1 className="text-lg font-bold text-zinc-900">عذراً، هذا الموقع غير منشور حالياً</h1>
          <p className="text-xs text-zinc-500 leading-relaxed">
            قد يكون صاحب المشروع قد غيّر مسار الرابط أو أوقف نشر الصفحة مؤقتاً.
          </p>
          <button
            type="button"
            onClick={onExitToStudio}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            الانتقال إلى استوديو مِعمار الصفحات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <CanvasFrame
        pageData={site.pageData}
        onUpdateField={() => {}}
        activeThemeKey={site.theme || 'editorial'}
        deviceView="desktop"
        isFullscreen={true}
      />

      {!hideBadge && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-zinc-900/95 text-white px-3.5 py-2 rounded shadow-xl text-xs backdrop-blur-sm">
          <span className="text-zinc-300">معاينة كزائر (محلياً على جهازك):</span>
          <span className="font-mono text-emerald-400 dir-ltr">/p/{site.slug}</span>
          <button
            type="button"
            onClick={onExitToStudio}
            className="px-2.5 py-1 bg-white text-zinc-900 font-semibold rounded hover:bg-zinc-200 transition-colors cursor-pointer mr-1"
          >
            العودة للمحرر
          </button>
          <button
            type="button"
            onClick={() => setHideBadge(true)}
            className="text-zinc-400 hover:text-white px-1 cursor-pointer"
            title="إخفاء الشريط"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

