import fs from "fs";
import { execSync } from "child_process";

const LOG = "/opt/sprosi-vracha-ai/apps/ai-maintenance/ai-maintenance.log";
const BACKUP_DIR = "/opt/sprosi-vracha-ai/backups";
const LOG_ROOT = "/opt/sprosi-vracha-ai/logs";

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG, line + "\n");
}

function cleanOldBackups() {
  log("🧹 Очистка бэкапов старше 7 дней...");
  execSync(`find ${BACKUP_DIR} -type f -mtime +7 -delete || true`);
}

function cleanLogs() {
  log("🗑️ Очистка логов старше 14 дней...");
  execSync(`find ${LOG_ROOT} -type f -mtime +14 -delete || true`);
}

function cleanNpmCache() {
  log("🧼 Очистка npm cache...");
  execSync("npm cache clean --force", { stdio: "ignore" });
}

log("🪄 Запуск AI Maintenance...");
try {
  cleanOldBackups();
  cleanLogs();
  cleanNpmCache();
  log("✅ Обслуживание завершено успешно.");
} catch (e) {
  log(`❌ Ошибка при обслуживании: ${e.message}`);
}
