import React, { useState, useRef } from 'react';
import { IMAGE_LIBRARY } from '../engine/templates';

export default function ImageEditorModal({
  isOpen,
  onClose,
  currentUrl,
  onSelectImage,
  title = 'تعديل الصورة',
}) {
  const [customUrl, setCustomUrl] = useState(currentUrl || '');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const categories = ['الكل', ...new Set(IMAGE_LIBRARY.map((img) => img.category))];
  const filteredImages =
    selectedCategory === 'الكل'
      ? IMAGE_LIBRARY
      : IMAGE_LIBRARY.filter((img) => img.category === selectedCategory);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSelectImage(reader.result);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onSelectImage(customUrl.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#F8F6F2] text-zinc-900 border border-[#D8D5CD] rounded-lg max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E2DC] mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              ارفع صورة من جهازك، أو اختر من المكتبة الفوتوغرافية، أو ضع رابطاً مباشراً
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-900 px-2 py-1 cursor-pointer"
          >
            إغلاق
          </button>
        </div>

        <div className="overflow-y-auto space-y-5 pr-1">
          {/* Option 1: Upload from device */}
          <div className="p-4 bg-white border border-[#DFDDD6] rounded flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold block text-zinc-800">رفع صورة من جهازك</span>
              <span className="text-[11px] text-zinc-500">
                يدعم صور JPG, PNG, WebP وتُدمج مباشرة داخل الصفحة
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded shrink-0 cursor-pointer transition-colors"
            >
              اختيار ملف من الجهاز
            </button>
          </div>

          {/* Option 2: Direct URL */}
          <form onSubmit={handleApplyUrl} className="space-y-1.5">
            <label className="text-xs font-bold block text-zinc-800">أو إدخال رابط صورة مباشر (URL):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-white border border-[#D8D5CD] rounded px-3 py-2 text-xs font-mono text-zinc-800 focus:outline-none focus:border-zinc-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 text-xs font-semibold rounded cursor-pointer transition-colors"
              >
                تطبيق الرابط
              </button>
            </div>
          </form>

          {/* Option 3: Curated Library */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-zinc-800">مكتبة الصور المختارة:</span>
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded cursor-pointer transition-colors ${
                      selectedCategory === cat
                        ? 'bg-zinc-900 text-white font-medium'
                        : 'bg-[#ECEAE3] text-zinc-700 hover:bg-[#E0DDD4]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredImages.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectImage(item.url);
                    onClose();
                  }}
                  className="group cursor-pointer border border-[#DFDDD6] rounded overflow-hidden bg-white hover:border-zinc-900 transition-all"
                >
                  <div className="h-28 overflow-hidden bg-zinc-100">
                    <img
                      src={item.url}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-800 truncate">{item.label}</span>
                    <span className="text-[10px] text-zinc-400">{item.category.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

