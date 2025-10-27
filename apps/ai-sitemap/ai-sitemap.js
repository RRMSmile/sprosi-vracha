#!/usr/bin/env node
import fs from "fs";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://sprosi-vracha.com";
const SRC = "/opt/sprosi-vracha-ai/data/articles";
const OUT = "/opt/sprosi-vracha/frontend/public/sitemap.xml";

const files = fs.existsSync(SRC)
  ? fs.readdirSync(SRC).filter(f => f.endsWith(".md"))
  : [];

const urls = files.map(f => {
  const slug = f.replace(".md", "");
  return `${SITE}/articles/${encodeURIComponent(slug)}`;
});

const now = new Date().toISOString();
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${now}</lastmod><priority>1.0</priority></url>
  ${urls.map(u => `<url><loc>${u}</loc><lastmod>${now}</lastmod><priority>0.7</priority></url>`).join("\n  ")}
</urlset>
`;
fs.writeFileSync(OUT, xml);
console.log(`[OK] Sitemap updated: ${urls.length} URLs`);

