import { buildDefaultEasyOrderConfig, detectNicheFromText } from './templates.js';

/**
 * Single source of truth for COD order pricing.
 * Used by the storefront (CanvasFrame) to display totals and by the server to
 * recompute totals, so a visitor cannot submit a tampered price.
 */

const toNumber = (val, fallback = 0) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

export function resolveEasyOrder(pageData = {}) {
  const niche =
    pageData.niche ||
    detectNicheFromText(`${pageData.brandName || ''} ${pageData.category || ''} ${pageData.headline || ''}`);
  return {
    ...buildDefaultEasyOrderConfig(niche, toNumber(pageData.products?.[0]?.price) || 340),
    ...(pageData.easyOrder || {}),
  };
}

/**
 * @param {object} pageData   the store's page data
 * @param {object} selection  { bundleIdx, governorateId, includeOrderBump, promoCode, cart: { [productId]: qty } }
 */
export function computeOrderPricing(pageData = {}, selection = {}) {
  const easyOrder = resolveEasyOrder(pageData);
  const products = Array.isArray(pageData.products) ? pageData.products : [];
  const bundleOffers = Array.isArray(easyOrder.bundleOffers) ? easyOrder.bundleOffers : [];
  const shippingRates = Array.isArray(easyOrder.shippingRates) ? easyOrder.shippingRates : [];
  const deliveryFee = toNumber(pageData.deliveryFee);
  const firstPrice = toNumber(products[0]?.price) || 340;

  const cart = selection.cart && typeof selection.cart === 'object' ? selection.cart : {};
  const cartItems = products
    .map((p) => {
      const qty = Math.min(99, Math.max(0, Math.floor(toNumber(cart[p.id]))));
      return qty > 0 ? { ...p, qty, lineTotal: toNumber(p.price) * qty } : null;
    })
    .filter(Boolean);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const bundleIdx = Math.floor(toNumber(selection.bundleIdx, 1));
  const activeBundle = bundleOffers[bundleIdx] ||
    bundleOffers[0] || { qty: 1, title: 'عرض قطعة واحدة', price: firstPrice, freeShipping: false };

  const activeGov =
    shippingRates.find((g) => g.id === selection.governorateId) ||
    shippingRates[0] || { id: 'default', name: 'القاهرة والجيزة', fee: deliveryFee || 50, days: 'خلال 48 ساعة' };

  const bundleSelectorOn = easyOrder.enableBundleSelector !== false;
  const subtotal =
    cartSubtotal > 0 ? cartSubtotal : bundleSelectorOn ? toNumber(activeBundle.price) : firstPrice;

  const isFreeShipping = bundleSelectorOn && cartSubtotal === 0 && Boolean(activeBundle.freeShipping);
  const shippingFee = isFreeShipping ? 0 : toNumber(activeGov.fee ?? deliveryFee);

  const bumpIncluded = easyOrder.enableOrderBump !== false && Boolean(selection.includeOrderBump);
  const bumpFee = bumpIncluded ? toNumber(easyOrder.orderBump?.price) : 0;

  const expectedCode = String(pageData.promoCode || 'WELCOME10').trim().toUpperCase();
  const promoApplied = Boolean(selection.promoCode) && String(selection.promoCode).trim().toUpperCase() === expectedCode;
  const discountPercent = promoApplied ? toNumber(pageData.promoDiscountPercent) || 10 : 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);

  const total = Math.max(0, subtotal - discountAmount + shippingFee + bumpFee);

  return {
    easyOrder,
    cartItems,
    cartCount,
    cartSubtotal,
    activeBundle,
    activeGov,
    subtotal,
    isFreeShipping,
    shippingFee,
    bumpIncluded,
    bumpFee,
    promoApplied,
    discountPercent,
    discountAmount,
    total,
  };
}
