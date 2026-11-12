/**
 * New-order notifications to the store owner over WhatsApp.
 *
 * The store owner configures nothing: the message goes to the WhatsApp number
 * already saved in their store (pageData.whatsappPhone). The platform owner
 * connects one sending number once, through Evolution API:
 *
 *   EVOLUTION_API_URL       e.g. https://evo.example.com
 *   EVOLUTION_API_KEY       the instance (or global) API key
 *   EVOLUTION_INSTANCE      the instance name connected to the platform's WhatsApp number
 *
 * If these are missing, notifications are skipped and orders still work.
 */

const EVOLUTION_API_URL = (process.env.EVOLUTION_API_URL || '').replace(/\/+$/, '');
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || '';

export const whatsappNotificationsConfigured = () =>
  Boolean(EVOLUTION_API_URL && EVOLUTION_API_KEY && EVOLUTION_INSTANCE);

/**
 * Convert common local formats to international digits.
 *   0501234567   (Saudi)  -> 966501234567
 *   01012345678  (Egypt)  -> 201012345678
 *   00966...              -> 966...
 * Returns '' when the result is not a plausible international number.
 */
export function normalizeWhatsAppNumber(raw) {
  let d = String(raw ?? '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (/^05\d{8}$/.test(d)) d = '966' + d.slice(1);
  else if (/^01\d{9}$/.test(d)) d = '20' + d.slice(1);
  return /^[1-9]\d{9,14}$/.test(d) ? d : '';
}

export function buildOrderMessage(order) {
  return [
    `🛒 طلب جديد في متجر ${order.projectName}`,
    `رقم الطلب: ${order.id}`,
    '',
    `العميل: ${order.customerName}`,
    `الجوال: ${order.customerPhone}`,
    `العنوان: ${order.governorate} — ${order.address}`,
    '',
    `العرض: ${order.bundleTitle}`,
    order.variantSelections?.length ? `القطع: ${order.variantSelections.join(' + ')}` : null,
    order.orderBumpIncluded && order.orderBumpTitle ? `إضافة: ${order.orderBumpTitle}` : null,
    `الإجمالي عند الاستلام: ${order.totalAmount} ${order.currency}`,
    order.notes ? `ملاحظات: ${order.notes}` : null,
    '',
    'تابع الطلب وغيّر حالته من لوحة الطلبات.',
  ]
    .filter((line) => line !== null)
    .join('\n')
    .slice(0, 3500);
}

/** Send the notification. Never throws; returns true when the provider accepted it. */
export async function notifyStoreOwner(order, pageData = {}) {
  if (!whatsappNotificationsConfigured()) return false;
  if (pageData.notifyOrdersOnWhatsapp === false) return false;
  const number = normalizeWhatsAppNumber(pageData.whatsappPhone);
  if (!number) {
    console.error(`Order ${order.id}: store has no valid WhatsApp number, notification skipped`);
    return false;
  }
  try {
    const res = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${encodeURIComponent(EVOLUTION_INSTANCE)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY },
        body: JSON.stringify({ number, text: buildOrderMessage(order) }),
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) {
      console.error(`Order ${order.id}: WhatsApp notification failed (HTTP ${res.status})`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Order ${order.id}: WhatsApp notification failed (${err.message})`);
    return false;
  }
}
