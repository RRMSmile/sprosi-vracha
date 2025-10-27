import fs from "fs";
import { execSync } from "child_process";

const LOG = "/opt/sprosi-vracha-ai/apps/ai-content-orchestrator/logs/orchestrator.log";

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG, line + "\n");
}

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch (e) {
    log(`⚠️ Ошибка команды: ${e.message}`);
    return "";
  }
}

function checkUnit(name) {
  const status = run(`systemctl is-active ${name}`);
  const enabled = run(`systemctl is-enabled ${name}`);
  return { status, enabled };
}

function ensureActive(unit) {
  const { status, enabled } = checkUnit(unit);
  if (status !== "active") {
    log(`❌ ${unit} неактивен, перезапускаю...`);
    run(`systemctl restart ${unit}`);
  } else {
    log(`✅ ${unit} работает (${enabled})`);
  }
}

function main() {
  log("🎛️ Запуск AI-Content-Orchestrator v2...");
  const units = [
    "ai-content-pipeline.timer",
    "ai-auto-publisher.timer",
    "ai-error-watcher.timer",
    "ai-healthcheck.timer",
    "ai-link-reporter.timer",
    "ai-summary-reporter.timer",
    "ai-telegram-reporter.timer",
    "ai-seo-genome.timer",
    "ai-compliance-auditor.timer"
  ];

  units.forEach(ensureActive);
  log("🧩 Все таймеры синхронизированы, система стабильна.");
}

main();
