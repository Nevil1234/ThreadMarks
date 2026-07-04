const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://localhost:8081';
const OUT = path.join(__dirname, 'photos');

// iPhone 14 mobile viewport
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 3 };
const USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

const screens = [
  { name: '01-landing', path: '/' },
  { name: '02-signup', path: '/signup' },
  { name: '03-login', path: '/login' },
  { name: '04-home', path: '/(tabs)/home' },
  { name: '05-recent', path: '/(tabs)/recent' },
  { name: '06-wardrobe', path: '/(tabs)/wardrobe' },
  { name: '07-marketplace', path: '/(tabs)/marketplace' },
  { name: '08-condition-score', path: '/ConditionScore' },
  { name: '09-recycling-options', path: '/RecyclingOptions' },
  { name: '10-donate', path: '/Donate' },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    userAgent: USER_AGENT,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  for (const s of screens) {
    const url = BASE + s.path;
    console.log('Capturing', s.name, '->', url);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    } catch (e) {
      console.log('  nav wait timeout, capturing anyway:', e.message.split('\n')[0]);
    }
    // let React/render settle
    await page.waitForTimeout(2500);
    const finalUrl = page.url();
    console.log('  final url:', finalUrl);
    const file = path.join(OUT, `${s.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log('  saved', file);
  }

  await browser.close();
  console.log('Done.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
