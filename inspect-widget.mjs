import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const result = await page.evaluate(() => {
  const items = Array.from(document.querySelectorAll('*'))
    .map((el) => {
      const tag = el.tagName;
      const id = el.id || '';
      const cls = typeof el.className === 'string' ? el.className : '';
      const style = el.getAttribute('style') || '';
      const html = (el.outerHTML || '').slice(0, 400);
      return { tag, id, cls, style, html };
    })
    .filter((item) => {
      const s = (item.tag + ' ' + item.id + ' ' + item.cls + ' ' + item.style + ' ' + item.html).toLowerCase();
      return s.includes('asw-') || s.includes('accessibility') || s.includes('sienna');
    })
    .slice(0, 100);

  return items;
});

console.log(JSON.stringify(result, null, 2));

await browser.close();
