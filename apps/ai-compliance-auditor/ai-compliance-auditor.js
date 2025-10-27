import fs from "fs";
import { execSync } from "child_process";

const LOG = "/opt/sprosi-vracha-ai/apps/ai-compliance-auditor/logs/auditor.log";
const REPORT = "/opt/sprosi-vracha-ai/reports/compliance-report.json";
const SITE = "https://sprosi-vracha.com";

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

function fetchPage(url) {
  try {
    return execSync(`curl -sL "${url}"`, { encoding: "utf8" });
  } catch {
    return "";
  }
}

function checkEEAT(html) {
  const eeat = {
    author: html.match(/author/i),
    sources: html.match(/Источник|Источник:/i),
    date: html.match(/\d{4}-\d{2}-\d{2}/),
    disclaimer: html.match(/дисклеймер|Не является медицинской рекомендацией/i),
  };
  const issues = [];
  if (!eeat.author) issues.push("❌ Нет автора");
  if (!eeat.sources) issues.push("❌ Нет указания источников");
  if (!eeat.date) issues.push("❌ Нет даты публикации");
  if (!eeat.disclaimer) issues.push("❌ Нет медицинского дисклеймера");
  return issues.length ? issues : ["✅ E-E-A-T соблюдён"];
}

function checkSchema(html) {
  const hasJSONLD = html.includes("application/ld+json");
  const hasMedicalSchema = html.includes("MedicalWebPage") || html.includes("FAQPage");
  const issues = [];
  if (!hasJSONLD) issues.push("❌ Нет Schema.org JSON-LD");
  if (!hasMedicalSchema) issues.push("⚠️ Нет медицинской схемы (MedicalWebPage)");
  return issues.length ? issues : ["✅ Структурированные данные есть"];
}

function checkYMYLContent(html) {
  const sensitive = html.match(/(лекарств|симптом|лечение|диагноз|анализ|болезн)/i);
  const doctor = html.match(/врач|доктор|специалист/i);
  const issues = [];
  if (sensitive && !doctor)
    issues.push("⚠️ Медицинская тематика без упоминания врача/эксперта");
  return issues.length ? issues : ["✅ YMYL-критерии соблюдены"];
}

function auditPage(url) {
  log(`🔍 Проверка страницы: ${url}`);
  const html = fetchPage(url);
  if (!html) return { url, result: ["❌ Страница недоступна"] };

  const results = [
    ...checkEEAT(html),
    ...checkSchema(html),
    ...checkYMYLContent(html),
  ];

  return { url, result: results };
}

function collectURLs() {
  const sitemap = fetchPage(`${SITE}/sitemap.xml`);
  const urls = sitemap.match(/<loc>(.*?)<\/loc>/g)?.map(u => u.replace(/<\/?loc>/g, "")) || [];
  return urls.slice(0, 20); // ограничим для скорости
}

function main() {
  log("🧾 Запуск AI-Compliance-Auditor...");
  const urls = collectURLs();
  log(`🌐 Найдено ${urls.length} страниц для проверки`);

  const report = urls.map(auditPage);
  fs.writeFileSync(REPORT, JSON.stringify({ timestamp: new Date(), report }, null, 2));

  const issues = report.flatMap(r => r.result.filter(x => x.startsWith("❌") || x.startsWith("⚠️")));
  if (issues.length) {
    log(`🚨 Найдено ${issues.length} несоответствий`);
  } else {
    log("✅ Все страницы соответствуют требованиям YMYL/E-E-A-T");
  }
}

main();
