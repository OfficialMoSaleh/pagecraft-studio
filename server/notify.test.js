import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

let notify;

beforeAll(async () => {
  process.env.EVOLUTION_API_URL = 'https://evo.test/';
  process.env.EVOLUTION_API_KEY = 'test-key';
  process.env.EVOLUTION_INSTANCE = 'platform';
  notify = await import('./notify.js');
});

afterAll(() => {
  vi.unstubAllGlobals();
});

const order = {
  id: 'ORD-ABCDEFGH',
  projectName: 'أثر',
  customerName: 'عميل',
  customerPhone: '0501234567',
  governorate: 'الرياض',
  address: 'حي الملقا',
  bundleTitle: 'عرض قطعتين',
  variantSelections: ['عود', 'مسك'],
  totalAmount: 650,
  currency: 'ر.س',
};

describe('normalizeWhatsAppNumber', () => {
  it('converts local formats to international digits', () => {
    expect(notify.normalizeWhatsAppNumber('0501234567')).toBe('966501234567');
    expect(notify.normalizeWhatsAppNumber('01012345678')).toBe('201012345678');
    expect(notify.normalizeWhatsAppNumber('+966 50 123 4567')).toBe('966501234567');
    expect(notify.normalizeWhatsAppNumber('00201012345678')).toBe('201012345678');
    expect(notify.normalizeWhatsAppNumber('123')).toBe('');
  });
});

describe('notifyStoreOwner', () => {
  it('sends the order to the store number through Evolution API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    vi.stubGlobal('fetch', fetchMock);
    const ok = await notify.notifyStoreOwner(order, { whatsappPhone: '0551112222' });
    expect(ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://evo.test/message/sendText/platform');
    expect(init.headers.apikey).toBe('test-key');
    const body = JSON.parse(init.body);
    expect(body.number).toBe('966551112222');
    expect(body.text).toContain('ORD-ABCDEFGH');
    expect(body.text).toContain('650 ر.س');
  });

  it('respects the opt-out and never throws on provider errors', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('down'));
    vi.stubGlobal('fetch', fetchMock);
    expect(await notify.notifyStoreOwner(order, { whatsappPhone: '0551112222', notifyOrdersOnWhatsapp: false })).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await notify.notifyStoreOwner(order, { whatsappPhone: '0551112222' })).toBe(false);
  });
});
