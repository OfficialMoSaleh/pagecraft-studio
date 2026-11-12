import React, { useState } from 'react';
import { buildStandaloneHTML } from '../engine/exportHtml';

export { buildStandaloneHTML };

export default function CodeExportModal({
  isOpen,
  onClose,
  pageData,
  activeThemeKey,
}) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const standaloneHtml = buildStandaloneHTML(pageData, activeThemeKey);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(standaloneHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadFile = () => {
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white text-zinc-900 border border-zinc-200 rounded-lg max-w-2xl w-full p-6 shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 mb-4">
          <h3 className="text-sm font-bold">تصدير ملف الموقع الكامل (index.html)</h3>
          <button
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer"
          >
            إغلاق
          </button>
        </div>

        <p className="text-xs text-zinc-500 mb-3">
          يعكس هذا الكود الترتيب الحالي للأقسام والتخطيط المختار لكل قسم وكافة التعديلات النصية.
        </p>

        <div className="flex-1 min-h-0 bg-zinc-950 text-zinc-200 rounded p-4 overflow-auto font-mono text-[11px] leading-relaxed text-left dir-ltr mb-4">
          <pre>{standaloneHtml}</pre>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded transition-colors cursor-pointer"
          >
            {copied ? 'تم النسخ' : 'نسخ الكود'}
          </button>

          <button
            onClick={downloadFile}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            تحميل الملف (index.html)
          </button>
        </div>
      </div>
    </div>
  );
}
