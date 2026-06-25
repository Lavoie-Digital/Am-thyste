const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:3000';
const OUT = '/tmp/am';
const fs = require('fs');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const shot = async (name, url, { full = true, scrollY = 0 } = {}) => {
    try {
      await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 20000 });
    } catch (e) {
      await page.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    }
    await page.waitForTimeout(1200);
    if (scrollY) { await page.evaluate(y => window.scrollTo(0, y), scrollY); await page.waitForTimeout(800); }
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
    console.log('shot', name, '->', page.url());
  };

  await shot('01-home-top', '/', { full: false });
  await shot('02-home-full', '/');
  await shot('03-boutique', '/boutique');

  // product detail: grab first product link
  let slug = null;
  try {
    slug = await page.evaluate(() => {
      const a = document.querySelector('a[href^="/boutique/"]');
      return a ? a.getAttribute('href') : null;
    });
  } catch {}
  if (slug && slug !== '/boutique') await shot('04-product', slug);

  await shot('05-a-propos', '/a-propos');
  await shot('06-contact', '/contact');
  await shot('07-pro', '/pro');
  await shot('08-formation', '/formation');
  await shot('09-connexion', '/pro/connexion');
  await shot('10-dashboard', '/tableau-de-bord', { full: false });
  await shot('11-checkout', '/checkout');

  await browser.close();
  console.log('DONE');
})();
