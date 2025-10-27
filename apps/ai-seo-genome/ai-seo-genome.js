import fs from "fs";
import { execSync } from "child_process";

const LOG = "/opt/sprosi-vracha-ai/apps/ai-seo-genome/logs/genome.log";
const REPORT = "/opt/sprosi-vracha-ai/reports/seo-genome.json";

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG, line + "\n");
}

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function fetchHTML(url) {
  try {
    return execSync(`curl -sL "${url}"`, { encoding: "utf8" });
  } catch {
    return "";
  }
}

function extractGenome(html) {
  const h2Count = (html.match(/<h2/gi) || []).length;
  const h3Count = (html.match(/<h3/gi) || []).length;
  const hasFAQ = html.includes("FAQPage") || html.includes("Частые вопросы");
  const hasList = html.includes("<ul>") || html.includes("<ol>");
  const hasTable = html.includes("<table");
  const wordCount = html.replace(/<[^>]+>/g, " ").split(/\s+/).length;
  const images = (html.match(/<img /g) || []).length;

  return {
    h2Count,
    h3Count,
    hasFAQ,
    hasList,
    hasTable,
    wordCount,
    images,
    avgSectionLength: Math.round(wordCount / (h2Count || 1)),
  };
}

function analyzeTopPages(query) {
  log(`🔍 Анализ SERP для запроса: ${query}`);
  const google = run(
    `curl -sL "https://www.google.com/search?q=${encodeURIComponent(
      query
    )}&hl=ru" | grep -oP 'https?://[^"]+' | grep -E '.ru|.com' | head -n 5`
  )
    .split("\n")
    .filter(Boolean);

  const results = google.map((url) => {
    const html = fetchHTML(url);
    const genome = extractGenome(html);
    return { url, genome };
  });

  return results;
}

function summarizeGenome(results) {
  if (!results.length) return {};
  const avg = (key) =>
    Math.round(
      results.map((r) => r.genome[key]).reduce((a, b) => a + b, 0) /
        results.length
    );

  return {
    avgWordCount: avg("wordCount"),
    avgH2: avg("h2Count"),
    avgH3: avg("h3Count"),
    avgImages: avg("images"),
    avgSectionLength: avg("avgSectionLength"),
    hasFAQ: results.some((r) => r.genome.hasFAQ),
    hasList: results.some((r) => r.genome.hasList),
    hasTable: results.some((r) => r.genome.hasTable),
  };
}

function main() {
  log("🧬 Запуск AI-SEO Genome...");
  const topics = ["боль в спине", "повышенное давление", "кашель у ребёнка"];
  const report = [];

  for (const query of topics) {
    const results = analyzeTopPages(query);
    const genome = summarizeGenome(results);
    report.push({ query, genome });
  }

  fs.writeFileSync(REPORT, JSON.stringify({ date: new Date(), report }, null, 2));
  log("✅ SEO-геном успешно обновлён");
}

main();
