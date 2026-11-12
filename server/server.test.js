import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { generatePageData } from '../src/engine/templates.js';
import { computeOrderPricing } from '../src/engine/orderPricing.js';

let server;
let base;
let dataDir;

beforeAll(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pagecraft-test-'));
  process.env.PAGECRAFT_DATA_DIR = dataDir;
  delete process.env.PAGECRAFT_ADMIN_TOKEN;
  const { app } = await import('./server.js');
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

afterAll(() => {
  server?.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

const post = (url, body) =>
  fetch(base + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

describe('orders API', () => {
  const pageData = generatePageData('دار عطور محلية باسم "أثر"', 'editorial');
  let orderId;

  it('publishes a page and ignores client-supplied HTML', async () => {
    const res = await post('/api/pages', { slug: 'athar', pageData, theme: 'editorial', html: '<script>x</script>' });
    expect(res.status).toBe(200);
    const page = await (await fetch(base + '/p/athar')).text();
    expect(page).not.toContain('<script>x</script>');
  });

  it('recomputes the total on the server (client total is ignored)', async () => {
    const selection = { bundleIdx: 0, includeOrderBump: false, cart: {} };
    const expected = computeOrderPricing(pageData, selection).total;
    const res = await post('/api/sites/athar/orders', {
      customerName: 'عميل تجريبي',
      customerPhone: '0501234567',
      address: 'المجمعة، حي الفيحاء',
      totalAmount: 1,
      selection,
    });
    expect(res.status).toBe(201);
    const { data } = await res.json();
    expect(data.totalAmount).toBe(expected);
    expect(data.id).toMatch(/^ORD-[A-Z2-9]{8}$/);
    orderId = data.id;
  });

  it('rejects invalid orders and unknown stores', async () => {
    expect((await post('/api/sites/athar/orders', { customerName: 'x', customerPhone: '1', address: '' })).status).toBe(400);
    expect((await post('/api/sites/nope/orders', { customerName: 'اسم', customerPhone: '0501234567', address: 'عنوان طويل' })).status).toBe(404);
  });

  it('tracks only with the matching phone and never exposes the address', async () => {
    expect((await post('/api/orders/track', { id: orderId, phone: '0599999999' })).status).toBe(404);
    expect((await post('/api/orders/track', { id: orderId })).status).toBe(404);
    const res = await post('/api/orders/track', { id: orderId, phone: '0501234567' });
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.status).toBe('new');
    expect(data.address).toBeUndefined();
    expect(data.customerPhone).toBeUndefined();
  });

  it('lets the owner list and update orders from localhost', async () => {
    const list = await (await fetch(base + '/api/orders')).json();
    expect(list.data.some((o) => o.id === orderId)).toBe(true);
    const res = await fetch(`${base}/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'shipped' }),
    });
    expect((await res.json()).data.status).toBe('shipped');
  });

  it('keeps backups of previous versions', () => {
    const backups = fs.readdirSync(path.join(dataDir, 'backups'));
    expect(backups.some((f) => f.startsWith('orders-'))).toBe(true);
  });
});
