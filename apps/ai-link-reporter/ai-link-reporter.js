import fs from "fs";
import { execSync } from "child_process";

const SITE = "https://sprosi-vracha.com";
const OUT_FILE = "/opt/sprosi-vracha-ai/monitor/broken-links.json";
const LOG_FILE = "/opt/sprosi-vracha-ai/apps/ai-link-reporter/link-reporter.log";

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + "\n");
}

function crawl(url, depth = 0, visited = new Set()) {
  if (visited.has(url) || depth > 1) return [];
  visited.add(url);

  log(`🔎 Проверка: ${url}`);
  const html = execSync(`curl -sL ${url} || true`, { encoding: "utf-8" });
  const matches = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)];
  const links = matches.map(m => m[1]);

  const badLinks = [];

  for (const link of links) {
    if (!link.startsWith(SITE)) continue;
    try {
      const code = execSync(`curl -s -o /dev/null -w "%{http_code}" ${link}`, { encoding: "utf-8" }).trim();
      if (!["200", "301", "302"].includes(code)) {
        badLinks.push({ link, code });
        log(`⚠️ Битая ссылка: ${link} (${code})`);
      }
    } catch {
      badLinks.push({ link, code: "ERR" });
      log(`❌ Ошибка проверки: ${link}`);
    }
  }

  return badLinks;
}

function runReport() {
  log("🌐 Запуск AI-LinkReporter...");
  fs.mkdirSync("/opt/sprosi-vracha-ai/monitor", { recursive: true });

  const broken = crawl(SITE);
  fs.writeFileSync(OUT_FILE, JSON.stringify({ timestamp: new Date().toISOString(), broken }, null, 2));

  if (broken.length === 0) {
    log("✅ Все ссылки работают корректно");
  } else {
    log(`🚨 Найдено битых ссылок: ${broken.length}`);
  }
}

runReport();
