/**
 * Test script to blast fake e-commerce events (view_item, add_to_cart, purchase)
 * into Google Analytics 4 (Measurement ID: G-7E705BB559) using Node https module with keep-alive.
 * 
 * Usage:
 *   node scripts/blast-analytics-test.cjs
 */

const https = require('https');

const MEASUREMENT_ID = 'G-7E705BB559';
const HOST = 'www.google-analytics.com';

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 5,
  timeout: 10000,
});

const testProducts = [
  { id: '1', name: 'Paket ID Card + Lanyard 2 Sisi', category: 'ID Card & Lanyard', price: 15000 },
  { id: '2', name: 'Paket ID Card + Lanyard Kulit', category: 'ID Card & Lanyard', price: 25000 },
  { id: '3', name: 'Lanyard Printing 2cm Custom', category: 'ID Card & Lanyard', price: 8000 },
  { id: '4', name: 'ID Card PVC Press Tebal', category: 'ID Card & Lanyard', price: 4000 },
  { id: '5', name: 'Banner Spanduk Flexi 280g', category: 'Banner & Spanduk', price: 18000 },
];

function sendGA4Event(eventName, params = {}, product = null) {
  return new Promise((resolve, reject) => {
    const cid = `${Math.floor(Math.random() * 1000000000)}.${Date.now()}`;
    const sid = `${Date.now()}`;

    const queryParams = [
      'v=2',
      `tid=${MEASUREMENT_ID}`,
      `cid=${cid}`,
      `_p=${Math.floor(Math.random() * 1000000)}`,
      `sid=${sid}`,
      'sct=1',
      'seg=1',
      `en=${eventName}`,
      'dl=' + encodeURIComponent('https://idcardlampung.com/product/test'),
      'dt=' + encodeURIComponent('Test Blast - ID Card Lampung'),
    ];

    for (const [k, v] of Object.entries(params)) {
      queryParams.push(`ep.${k}=${encodeURIComponent(v)}`);
    }

    if (product) {
      const qt = params.quantity || 1;
      const prStr = `id${product.id}~nm${encodeURIComponent(product.name)}~ca${encodeURIComponent(product.category)}~pr${product.price}~qt${qt}`;
      queryParams.push(`pr1=${prStr}`);
      queryParams.push(`epn.value=${product.price * qt}`);
      queryParams.push('ep.currency=IDR');
    }

    const path = `/g/collect?${queryParams.join('&')}`;

    const req = https.request(
      {
        hostname: HOST,
        path,
        method: 'POST',
        agent,
        headers: {
          'Content-Length': '0',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        },
      },
      (res) => {
        resolve({ status: res.statusCode, eventName, product: product ? product.name : null });
      }
    );

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function run() {
  console.log(`\nMemulai blast data simulasi e-commerce ke GA4 (${MEASUREMENT_ID})...\n`);

  for (let i = 0; i < testProducts.length; i++) {
    const product = testProducts[i];
    const qty = Math.floor(Math.random() * 3) + 1;

    try {
      // 1. view_item
      const r1 = await sendGA4Event('view_item', { item_name: product.name }, product);
      console.log(`[${i + 1}/${testProducts.length}] VIEW_ITEM: "${product.name}" -> HTTP ${r1.status}`);

      await new Promise((r) => setTimeout(r, 600));

      // 2. add_to_cart
      const r2 = await sendGA4Event('add_to_cart', { item_name: product.name, quantity: qty }, product);
      console.log(`[${i + 1}/${testProducts.length}] ADD_TO_CART: "${product.name}" (${qty} pcs) -> HTTP ${r2.status}`);

      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      console.error(`Gagal mengirim event untuk ${product.name}:`, err.message);
    }
  }

  // 3. Purchase simulation
  const invNumber = `INV-${Date.now().toString().slice(-6)}`;
  const purchasedProduct = testProducts[0];
  try {
    const r3 = await sendGA4Event(
      'purchase',
      {
        transaction_id: invNumber,
        value: purchasedProduct.price * 3,
        currency: 'IDR',
        traffic_source: 'Instagram / Social',
      },
      { ...purchasedProduct, price: purchasedProduct.price }
    );
    console.log(`\nPURCHASE: Invoice ${invNumber} -> HTTP ${r3.status}`);
  } catch (err) {
    console.error('Gagal mengirim purchase:', err.message);
  }

  console.log(`\nBlast selesai! Buka Google Analytics 4 -> Laporan Realtime sekarang.\n`);
}

run();
