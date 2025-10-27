#!/usr/bin/env node
import fs from 'fs';
import https from 'https';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://sprosi-vracha.com';
const KEY  = process.env.INDEXNOW_KEY || 'urohn3hs4k';
const SITEMAP = '/opt/sprosi-vracha/frontend/public/sitemap.xml';

function readSitemapUrls(path) {
  if (!fs.existsSync(path)) return [];
  const xml = fs.readFileSync(path, 'utf-8');
  const urls = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map(m => m[1]);
  // Не шлём саму корневую, если не надо — оставим все
  return urls;
}

function postJSON(host, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({ host, path, method: 'POST', headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }}, res => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => resolve({status: res.statusCode, body: out}));
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

async function run() {
  const urls = readSitemapUrls(SITEMAP).filter(u => u.startsWith('http'));
  const chunk = (arr, n) => Array.from({length: Math.ceil(arr.length/n)}, (_,i)=>arr.slice(i*n, i*n+n));
  const batches = chunk(urls, 1000); // IndexNow позволяет пачки до 10k, оставим 1k

  let ok = 0, fail = 0;
  for (const list of batches) {
    const payload = { host: SITE.replace(/^https?:\/\//,''), key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: list };
    try {
      const r = await postJSON('www.bing.com', '/indexnow', payload);
      if (r.status >= 200 && r.status < 300) ok += list.length; else fail += list.length;
    } catch { fail += list.length; }
  }
  const report = { site: SITE, sitemap: SITEMAP, submitted: urls.length, ok, fail, ts: new Date().toISOString() };
  fs.mkdirSync('/opt/sprosi-vracha-ai/reports', {recursive:true});
  fs.writeFileSync('/opt/sprosi-vracha-ai/reports/indexnow-report.json', JSON.stringify(report, null, 2));
  console.log('[IndexNow]', report);
}
run().catch(e => { console.error(e); process.exit(1); });
