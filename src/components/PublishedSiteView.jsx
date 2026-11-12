import React, { useState, useEffect } from 'react';
import CanvasFrame from './CanvasFrame';
import {
  resolvePublishedSite,
  addOrderToInbox,
  submitOrderToServer,
  trackOrderOnServer,
} from '../engine/projects';

export default function PublishedSiteView({ slug, sharedSite, onExitToStudio, onRemixSharedSite }) {
  const [site, setSite] = useState(sharedSite || null);
  const [loading, setLoading] = useState(!sharedSite);
  const [hideBadge, setHideBadge] = useState(false);

  useEffect(() => {
    if (sharedSite) {
      setSite(sharedSite);
      setLoading(false);
      if (sharedSite.pageData?.brandName) {
        document.title = `${sharedSite.pageData.brandName} — الموقع الرسمي`;
      }
      return;
    }

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
  }, [slug, sharedSite]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-2">
          <div className="text-sm font-bold text-zinc-900">جاري تحميل الموقع...</div>
          <div className="text-xs text-zinc-500 font-mono">{slug ? `/p/${slug}` : ''}</div>
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
          <h1 className="text-lg font-bold text-zinc-900">عذراً، هذا الموقع غير متاح حالياً</h1>
          <p className="text-xs text-zinc-500 leading-relaxed">
            تأكد من صحة الرابط المشفر أو انتقل إلى استوديو مِعمار الصفحات لبناء موقعك.
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

  const isServerBacked = Boolean(site.slug) && !site.isServerlessShare;

  return (
    <div className="min-h-screen relative">
      <CanvasFrame
        pageData={site.pageData}
        onUpdateField={() => {}}
        onSubmitOrder={async (payload, selection) => {
          // Real stores send orders to the server; serverless share links stay a local demo.
          if (isServerBacked) {
            const saved = await submitOrderToServer(site.slug, payload, selection);
            if (saved) return saved;
          }
          return addOrderToInbox(payload).order;
        }}
        onTrackOrder={isServerBacked ? (id, phone) => trackOrderOnServer(id, phone) : undefined}
        activeThemeKey={site.theme || 'editorial'}
        deviceView="desktop"
        isFullscreen={true}
      />

      {!hideBadge && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-zinc-900/95 text-white px-3.5 py-2 rounded shadow-xl text-xs backdrop-blur-sm">
          <span className="text-zinc-300">
            {site.isServerlessShare ? 'عرض موقع مشترك:' : 'معاينة كزائر:'}
          </span>
          <strong className="text-emerald-400">{site.pageData?.brandName || site.name}</strong>
          {site.isServerlessShare && onRemixSharedSite ? (
            <button
              type="button"
              onClick={() => onRemixSharedSite(site)}
              className="px-2.5 py-1 bg-white text-zinc-900 font-semibold rounded hover:bg-zinc-200 transition-colors cursor-pointer mr-1"
            >
              تعديل هذا التصميم في الاستوديو
            </button>
          ) : (
            <button
              type="button"
              onClick={onExitToStudio}
              className="px-2.5 py-1 bg-white text-zinc-900 font-semibold rounded hover:bg-zinc-200 transition-colors cursor-pointer mr-1"
            >
              العودة للمحرر
            </button>
          )}
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
