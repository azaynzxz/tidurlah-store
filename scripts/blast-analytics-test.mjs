/**
 * Test script to blast fake e-commerce events (add_to_cart, view_item, purchase)
 * directly into Google Analytics 4 (Measurement ID: G-7E705BB559).
 * 
 * Usage:
 *   node scripts/blast-analytics-test.mjs
 */

const MEASUREMENT_ID = 'G-7E705BB559';
const GA_ENDPOINT = 'https://www.google-analytics.com/g/collect';

// Generate random Client ID to simulate real active users
const randomClientId = () => `${Math.floor(Math.random() * 1000000000)}.${Date.now()}`;
const randomSessionId = () => `${Date.now()}`;

const testProducts = [
  { id: '1', name: 'Paket ID Card + Lanyard 2 Sisi', category: 'ID Card & Lanyard', price: 15000 },
  { id: '2', name: 'Paket ID Card + Lanyard Kulit', category: 'ID Card & Lanyard', price: 25000 },
  { id: '3', name: 'Lanyard Printing 2cm Custom', category: 'ID Card & Lanyard', price: 8000 },
  { id: '4', name: 'ID Card PVC Press Tebal', category: 'ID Card & Lanyard', price: 4000 },
  { id: '5', name: 'Banner Spanduk Flexi 280g', category: 'Banner & Spanduk', price: 18000 },
];

async function sendEvent(eventName, params = {}, product = null) {
  const cid = randomClientId();
  const sid = randomSessionId();

  const url = new URL(GA_ENDPOINT);
  url.searchParams.set('v', '2');
  url.searchParams.set('tid', MEASUREMENT_ID);
  url.searchParams.set('cid', cid);
  url.searchParams.set('_p', String(Math.floor(Math.random() * 1000000)));
  url.searchParams.set('sid', sid);
  url.searchParams.set('sct', '1');
  url.searchParams.set('seg', '1');
  url.searchParams.set('en', eventName);
  url.searchParams.set('dl', 'https://idcardlampung.com/product/test');
  url.searchParams.set('dt', 'Test Blast - ID Card Lampung');

  // Custom event parameters
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(`ep.${k}`, String(v));
  }

  // GA4 Product parameters (pr1 = id~nm~ca~pr~qt)
  if (product) {
    const qt = params.quantity || 1;
    const prStr = `id${product.id}~nm${encodeURIComponent(product.name)}~ca${encodeURIComponent(product.category)}~pr${product.price}~qt${qt}`;
    url.searchParams.set('pr1', prStr);
    url.searchParams.set('epn.value', String(product.price * qt));
    url.searchParams.set('ep.currency', 'IDR');
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      return { status: res.status, eventName, product: product ? product.name : null };
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

async function runBlast() {
  console.log(`\nMemulai blast data simulasi ke GA4 (${MEASUREMENT_ID})...\n`);

  for (let i = 0; i < testProducts.length; i++) {
    const product = testProducts[i];
    const qty = Math.floor(Math.random() * 4) + 1;

    // 1. Send view_item
    const r1 = await sendEvent('view_item', { item_name: product.name }, product);
    console.log(`[${i + 1}/${testProducts.length}] VIEW_ITEM sent for "${product.name}" -> Status: ${r1.status}`);

    // Delay 300ms
    await new Promise((r) => setTimeout(r, 300));

    // 2. Send add_to_cart
    const r2 = await sendEvent('add_to_cart', { item_name: product.name, quantity: qty }, product);
    console.log(`[${i + 1}/${testProducts.length}] ADD_TO_CART sent for "${product.name}" (${qty} pcs) -> Status: ${r2.status}`);

    // Delay 300ms
    await new Promise((r) => setTimeout(r, 300));
  }

  // 3. Send 1 purchase simulation
  const invNumber = `INV-${Date.now().toString().slice(-6)}`;
  const purchasedProduct = testProducts[0];
  const r3 = await sendEvent('purchase', {
    transaction_id: invNumber,
    value: purchasedProduct.price * 5,
    currency: 'IDR',
    traffic_source: 'Instagram / Social (Blast Test)',
  }, { ...purchasedProduct, price: purchasedProduct.price });

  console.log(`\nPURCHASE event sent with Invoice ${invNumber} -> Status: ${r3.status}`);
  console.log(`\nSelesai! Buka Google Analytics 4 -> menu "Realtime" sekarang.`);
}

runBlast().catch(console.error);
