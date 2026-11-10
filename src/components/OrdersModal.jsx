import React, { useState } from 'react';
import { buildOrdersCsvContent } from '../engine/projects';

const STATUS_OPTIONS = [
  { id: 'new', label: 'طلب جديد', badgeClass: 'bg-amber-50 text-amber-900 border-amber-300' },
  { id: 'confirmed', label: 'تم التأكيد هاتفياً', badgeClass: 'bg-blue-50 text-blue-900 border-blue-200' },
  { id: 'shipped', label: 'جاري الشحن', badgeClass: 'bg-purple-50 text-purple-900 border-purple-200' },
  { id: 'delivered', label: 'تم التسليم والتحصيل', badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  { id: 'cancelled', label: 'ملغي', badgeClass: 'bg-red-50 text-red-800 border-red-200' },
];

export default function OrdersModal({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
}) {
  const [statusFilter, setStatusFilter] = useState('all');

  if (!isOpen) return null;

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  const handleDownloadCsv = () => {
    const csv = buildOrdersCsvContent(filteredOrders);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-shipping-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppFollowUp = (order) => {
    const cleanPhone = String(order.customerPhone || '').replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
    const msg = `مرحباً أ/ ${order.customerName}، نتواصل معك من "${order.projectName}" لتأكيد طلبك رقم (${order.id}):\n- العرض: ${order.bundleTitle}\n- المحافظة: ${order.governorate} (${order.address})\n- الإجمالي عند الاستلام: ${order.totalAmount} ${order.currency || 'ج.م'}\nهل البيانات صحيحة لاعتماد الشحن؟`;
    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#F7F6F2] text-zinc-900 border border-[#D8D5CD] rounded-lg max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E3DC]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900">
                لوحة إدارة الطلبات والشحن (EasyOrders COD Inbox)
              </h2>
              {newOrdersCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  {newOrdersCount} طلبات جديدة
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              تابع طلبات الدفع عند الاستلام، تواصل مع العملاء لتأكيد الشحن، أو صدّر شيت Excel لشركات الشحن
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              تصدير شيت الشحن (Excel / CSV)
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

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="p-3.5 bg-white rounded border border-[#DFDDD6]">
            <div className="text-[11px] text-zinc-500">إجمالي الطلبات المسجلة</div>
            <div className="text-lg font-bold text-zinc-900 mt-0.5">{orders.length} طلب</div>
          </div>
          <div className="p-3.5 bg-white rounded border border-[#DFDDD6]">
            <div className="text-[11px] text-zinc-500">بانتظار التأكيد الهاتفي</div>
            <div className="text-lg font-bold text-amber-800 mt-0.5">{newOrdersCount} طلب</div>
          </div>
          <div className="p-3.5 bg-white rounded border border-[#DFDDD6]">
            <div className="text-[11px] text-zinc-500">إجمالي المبيعات (COD)</div>
            <div className="text-lg font-bold text-emerald-800 mt-0.5">{totalRevenue} ج.م</div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-[#E5E3DC]">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`text-xs px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-600 border border-[#D8D5CD]'
            }`}
          >
            الكل ({orders.length})
          </button>
          {STATUS_OPTIONS.map((st) => {
            const count = orders.filter((o) => o.status === st.id).length;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`text-xs px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-600 border border-[#D8D5CD]'
                }`}
              >
                {st.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="p-8 bg-white rounded border border-[#DFDDD6] text-center text-xs text-zinc-500">
              لا توجد طلبات في هذا التصنيف حالياً. جرّب إرسال طلب جديد من نموذج الشراء داخل الصفحة!
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusObj =
                STATUS_OPTIONS.find((s) => s.id === order.status) || STATUS_OPTIONS[0];

              return (
                <div
                  key={order.id}
                  className="p-4 bg-white rounded border border-[#DFDDD6] space-y-3 hover:border-zinc-400 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2.5 border-b border-zinc-100">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-900 text-white">
                        {order.id}
                      </span>
                      <span className="text-xs font-bold text-zinc-900">{order.customerName}</span>
                      <span className="font-mono text-xs text-zinc-600 dir-ltr">
                        {order.customerPhone}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${statusObj.badgeClass}`}
                      >
                        {statusObj.label}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        المشروع: {order.projectName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                        className="bg-[#FAF9F6] border border-[#D8D5CD] rounded px-2.5 py-1 text-xs font-medium text-zinc-800 cursor-pointer focus:outline-none"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st.id} value={st.id}>
                            الحالة: {st.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleWhatsAppFollowUp(order)}
                        className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded cursor-pointer"
                      >
                        تأكيد عبر واتساب ↗
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteOrder(order.id)}
                        className="px-2 py-1 text-[11px] text-red-700 hover:bg-red-50 rounded cursor-pointer"
                      >
                        حذف
                      </button>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                    <div className="md:col-span-5 space-y-1">
                      <span className="text-[11px] text-zinc-400 block">عنوان الشحن والمحافظة:</span>
                      <div className="font-semibold text-zinc-800">
                        {order.governorate} — {order.address}
                      </div>
                    </div>

                    <div className="md:col-span-5 space-y-1">
                      <span className="text-[11px] text-zinc-400 block">العرض والمواصفات المختارة:</span>
                      <div className="font-semibold text-zinc-900">{order.bundleTitle}</div>
                      {order.variantSelections && order.variantSelections.length > 0 && (
                        <ul className="text-[11px] text-zinc-600 space-y-0.5">
                          {order.variantSelections.map((v, i) => (
                            <li key={i}>
                              • قطعة #{i + 1}: {v}
                            </li>
                          ))}
                        </ul>
                      )}
                      {order.orderBumpIncluded && (
                        <div className="text-[11px] text-emerald-800 font-medium">
                          + {order.orderBumpTitle}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 flex md:flex-col justify-between md:items-end border-t md:border-t-0 pt-2 md:pt-0 border-zinc-100">
                      <span className="text-[11px] text-zinc-400">المطلوب تحصيله:</span>
                      <div className="text-base font-bold text-zinc-900">
                        {order.totalAmount} {order.currency || 'ج.م'}
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {order.shippingFee === 0 ? 'شحن مجاني' : `شامل شحن ${order.shippingFee} ج.م`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

