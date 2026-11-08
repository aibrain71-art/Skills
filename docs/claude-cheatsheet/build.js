// Renders cheatsheet.html to claude-cheatsheet.pdf (A4 landscape, 2 pages).
// Usage: node docs/claude-cheatsheet/build.js
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const dir = __dirname;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(dir, 'cheatsheet.html'));
  await page.pdf({
    path: path.join(dir, 'claude-cheatsheet.pdf'),
    preferCSSPageSize: true,
    printBackground: true,
  });
  await browser.close();
  console.log('wrote claude-cheatsheet.pdf');
})();
