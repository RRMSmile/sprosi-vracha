import fs from "fs";
import path from "path";

const domain = "https://sprosi-vracha.com";
const pagesFile = path.resolve("/opt/sprosi-vracha/frontend/pages.txt");
const sitemapFile = path.resolve("/opt/sprosi-vracha/frontend/out/sitemap.xml");

if (!fs.existsSync(pagesFile)) {
  console.error("❌ Файл pages.txt не найден. Сначала запусти list-pages.sh");
  process.exit(1);
}

const urls = fs
  .readFileSync(pagesFile, "utf-8")
  .split("\n")
  .map(u => u.trim())
  .filter(Boolean)
  .map(u => `  <url>\n    <loc>${u.replace(/index\.html$/, "")}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`)
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

fs.writeFileSync(sitemapFile, xml, "utf-8");

console.log(`✅ sitemap.xml создан: ${sitemapFile}`);

