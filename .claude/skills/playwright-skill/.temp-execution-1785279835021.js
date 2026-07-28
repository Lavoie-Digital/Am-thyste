const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'http://localhost:3000/pro/inscription';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('[pageerror]', err.message));

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  console.log('Page loaded:', await page.title());

  // Create a tiny real PNG file on disk
  const pngPath = '/tmp/diploma-test.png';
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  fs.writeFileSync(pngPath, Buffer.from(pngBase64, 'base64'));

  const dropzone = page.locator('div.border-dashed').first();
  await dropzone.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Dropzone found.');

  const box = await dropzone.boundingBox();
  console.log('Dropzone bbox:', box);

  // Build a DataTransfer with a real File and dispatch dragenter/dragover/drop
  // directly on the dropzone element, bypassing OS-level DnD (isolates component logic).
  const buffer = fs.readFileSync(pngPath);
  const fileBase64 = buffer.toString('base64');

  const result = await page.evaluate(
    async ({ selector, base64, fileName, mimeType }) => {
      function base64ToFile(b64, name, type) {
        const byteChars = atob(b64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new File([byteArray], name, { type });
      }

      const el = document.querySelector(selector);
      if (!el) return { error: 'element-not-found' };

      const file = base64ToFile(base64, fileName, mimeType);
      const dt = new DataTransfer();
      dt.items.add(file);

      const rect = el.getBoundingClientRect();
      const clientX = rect.x + rect.width / 2;
      const clientY = rect.y + rect.height / 2;

      const fire = (type) => {
        const evt = new DragEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX,
          clientY,
        });
        // dataTransfer is read-only via constructor in some browsers; define manually.
        Object.defineProperty(evt, 'dataTransfer', { value: dt });
        el.dispatchEvent(evt);
        return evt.defaultPrevented;
      };

      const enterPrevented = fire('dragenter');
      const overPrevented = fire('dragover');
      const dropPrevented = fire('drop');

      return {
        ok: true,
        enterPrevented,
        overPrevented,
        dropPrevented,
        innerTextAfter: el.parentElement ? el.parentElement.innerText : el.innerText,
      };
    },
    { selector: 'div.border-dashed', base64: fileBase64, fileName: 'diplome-test.png', mimeType: 'image/png' },
  );

  console.log('Drop simulation result:', JSON.stringify(result, null, 2));

  await page.waitForTimeout(500);
  const bodyText = await page.locator('body').innerText();
  const fileNameShown = bodyText.includes('diplome-test.png');
  console.log('File name visible in DOM after drop:', fileNameShown);

  await page.screenshot({ path: '/tmp/diploma-dropzone-after-drop.png', fullPage: true });
  console.log('📸 Screenshot saved to /tmp/diploma-dropzone-after-drop.png');

  await browser.close();
})();
