// Облегчённая демо-версия «У Речушки»: только Node.js, без зависимостей.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 7860;
const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));
const priceById = new Map(products.map(p => [String(p.id), Number(p.price) || 0]));
const promoState = new Map();
const PRIZES = [
  { code: 'BEER5', label: '−5% на заказ', weight: 40 },
  { code: 'BEER10', label: '−10% на заказ', weight: 28 },
  { code: 'BEER15', label: '−15% на заказ', weight: 18 },
  { code: 'CASH500', label: '−500 ₽', weight: 9 },
  { code: 'URE4KA', label: '−15% на заказ', weight: 5 }
];
const DISCOUNTS = { BEER5: 0.05, BEER10: 0.10, BEER15: 0.15, CASH500: 500, URE4KA: 0.15 };

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}
function body(req) {
  return new Promise(resolve => {
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); } });
  });
}
function dayKey() { return new Date().toISOString().slice(0, 10); }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (p === '/' || p === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
  }
  if (p === '/api/products/health') return json(res, 200, { status: 'ok', products: products.length, service: 'demo-catalog' });
  if (p === '/api/products') {
    const q = (url.searchParams.get('search') || '').toLowerCase();
    const cat = url.searchParams.get('category') || '';
    const list = products.filter(x =>
      (!q || x.name.toLowerCase().includes(q) || (x.description || '').toLowerCase().includes(q)) &&
      (!cat || x.category === cat));
    return json(res, 200, list);
  }
  if (p === '/api/status') {
    return json(res, 200, ['Каталог', 'Клиенты', 'Заказы', 'Оплата', 'Уведомления', 'Лояльность', 'Доставка', 'Избранное', 'Аналитика', 'Мобильный шлюз']
      .map(name => ({ name, status: 'ok', demo: true })));
  }
  if (p === '/api/customers/promo') {
    const email = url.searchParams.get('email') || '';
    const st = promoState.get(email) || { day: dayKey(), used: 0, history: [] };
    return json(res, 200, { attemptsLeft: Math.max(0, 3 - st.used), history: st.history, date: st.day });
  }
  if (p === '/api/customers/promo/claim' && req.method === 'POST') {
    const { email } = await body(req);
    if (!email) return json(res, 400, { error: 'Укажите email' });
    const st = promoState.get(email) || { day: dayKey(), used: 0, history: [] };
    if (st.day !== dayKey()) { st.day = dayKey(); st.used = 0; st.history = []; }
    if (st.used >= 3) return json(res, 429, { error: 'Лимит попыток исчерпан', attemptsLeft: 0 });
    const total = PRIZES.reduce((a, b) => a + b.weight, 0);
    let n = Math.random() * total;
    const prize = PRIZES.find(x => (n -= x.weight) <= 0) || PRIZES[0];
    st.used += 1;
    st.history.unshift({ code: prize.code, label: prize.label, at: new Date().toISOString() });
    promoState.set(email, st);
    return json(res, 200, { ...prize, attemptsLeft: 3 - st.used, history: st.history });
  }
  if (p === '/api/orders' && req.method === 'POST') {
    const { items = [], email = '', promo = '' } = await body(req);
    let subtotal = 0;
    const lines = [];
    for (const it of items) {
      const price = priceById.get(String(it.productId ?? it.id));
      const qty = Math.max(1, Math.min(20, Number(it.quantity) || 1));
      if (price === undefined) return json(res, 400, { error: 'Товар не найден' });
      subtotal += price * qty;
      lines.push({ productId: it.productId ?? it.id, quantity: qty, price });
    }
    const rate = DISCOUNTS[promo];
    const discount = rate ? (rate < 1 ? Math.round(subtotal * rate) : Math.min(subtotal, rate)) : 0;
    return json(res, 200, {
      id: 'DEMO-' + Date.now().toString(36).toUpperCase(),
      email, items: lines, subtotal, discount, total: subtotal - discount,
      status: 'confirmed', demo: true
    });
  }
  if (p === '/api/demo/health') return json(res, 200, { status: 'ok', products: products.length, uptime: process.uptime() });
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => console.log(`Demo listens on ${PORT}`));
