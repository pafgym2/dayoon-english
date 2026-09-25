// 웹북(book.html)으로 독립 실행용 index.html과 PDF를 만듭니다.
// 사용: node build.js  (Playwright 필요, 한글 폰트는 시스템에 설치)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const dir = __dirname;
const body = fs.readFileSync(path.join(dir, 'book.html'), 'utf8');
const full = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#1D4E89">
</head>
<body>
${body}
</body>
</html>
`;
fs.writeFileSync(path.join(dir, 'index.html'), full);

(async () => {
  const exe = process.env.CHROME_PATH;
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage();
  await page.goto('file://' + path.join(dir, 'index.html'), { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: path.join(dir, '손해보험_신입_가이드북.pdf'),
    format: 'A5',
    printBackground: true,
    margin: { top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="width:100%;font-size:7.5px;color:#58657A;text-align:center;font-family:\'IBM Plex Sans KR\',sans-serif;">손해보험 신입 가이드북 · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });
  await browser.close();
  console.log('ok');
})();
