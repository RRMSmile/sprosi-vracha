import fs from "fs";
import { execSync } from "child_process";

const REPORT_DIR = "/opt/sprosi-vracha-ai/reports";
const LOG_FILE = "/opt/sprosi-vracha-ai/apps/ai-summary-reporter/summary.log";
const REPORT_FILE = `${REPORT_DIR}/daily-summary.json`;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + "\n");
}

function safeReadJSON(path) {
  try {
    if (fs.existsSync(path)) return JSON.parse(fs.readFileSync(path, "utf-8"));
  } catch {}
  return null;
}

function getServiceStatus(name) {
  try {
    const result = execSync(`systemctl is-active ${name}`, { encoding: "utf-8" }).trim();
    return result === "active";
  } catch {
    return false;
  }
}

function summarize() {
  log("📊 Запуск AI-SummaryReporter...");

  const health = safeReadJSON("/opt/sprosi-vracha-ai/monitor/health.json") || {};
  const links = safeReadJSON("/opt/sprosi-vracha-ai/monitor/broken-links.json") || { broken: [] };
  const errors = fs.existsSync("/opt/sprosi-vracha-ai/apps/ai-error-watcher/errors.log")
    ? fs.readFileSync("/opt/sprosi-vracha-ai/apps/ai-error-watcher/errors.log", "utf-8")
        .split("\n")
        .filter(l => l.includes("⚠️") || l.includes("❌"))
        .slice(-10)
    : [];

  const articlesDir = "/opt/sprosi-vracha-ai/data/articles";
  const articles = fs.existsSync(articlesDir) ? fs.readdirSync(articlesDir) : [];

  const report = {
    date: new Date().toISOString(),
    server: execSync("hostname", { encoding: "utf-8" }).trim(),
    uptime: execSync("uptime -p", { encoding: "utf-8" }).trim(),
    memory: execSync("free -h | grep Mem | awk '{print $3\"/\"$2}'", { encoding: "utf-8" }).trim(),
    disk: execSync("df -h / | tail -1 | awk '{print $3\"/\"$2}'", { encoding: "utf-8" }).trim(),
    modules: {
      pipeline: getServiceStatus("ai-content-pipeline.service"),
      publisher: getServiceStatus("ai-auto-publisher.service"),
      trendMapper: getServiceStatus("ai-trend-mapper.service"),
      errorWatcher: getServiceStatus("ai-error-watcher.service"),
      healthcheck: getServiceStatus("ai-healthcheck.service"),
      linkReporter: getServiceStatus("ai-link-reporter.service")
    },
    stats: {
      total_articles: articles.length,
      broken_links: links.broken?.length || 0,
      recent_errors: errors.length,
      memory_usage: health.memory || null,
      disk_usage: health.disk || null
    },
    last_errors: errors,
    broken_links: links.broken || [],
    last_healthcheck: health.timestamp || null
  };

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  log("✅ Ежедневный отчёт обновлён");
}

summarize();
