import fs from "fs";
import { execSync } from "child_process";

const LOG = "/opt/sprosi-vracha-ai/apps/ai-recovery/logs/recovery.log";
const TELEGRAM_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN";
const CHAT_ID = "YOUR_CHAT_ID";

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG, line + "\n");
}

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch (e) {
    log(`⚠️ Ошибка команды: ${cmd} → ${e.message}`);
    return "";
  }
}

function sendTelegram(message) {
  try {
    run(
      `curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" -d chat_id="${CHAT_ID}" -d text="${message}"`
    );
    log("📨 Уведомление отправлено в Telegram");
  } catch (e) {
    log(`⚠️ Ошибка отправки в Telegram: ${e.message}`);
  }
}

function healSystem() {
  log("🩺 Запуск AI-Recovery v2...");
  const issues = [];

  // теперь проверяем таймеры, а не сервисы
  const timers = [
    "ai-content-pipeline.timer",
    "ai-auto-publisher.timer",
    "ai-error-watcher.timer",
    "ai-healthcheck.timer",
    "ai-link-reporter.timer",
    "ai-summary-reporter.timer",
    "ai-telegram-reporter.timer",
    "ai-content-orchestrator.timer"
  ];

  for (const t of timers) {
    const state = run(`systemctl is-active ${t}`);
    if (state !== "active") {
      issues.push(t);
      run(`systemctl restart ${t}`);
      log(`♻️ Перезапущен: ${t}`);
    } else {
      log(`✅ ${t} работает корректно`);
    }
  }

  // Перезапуск PM2 при зависаниях
  const pm2 = run("pm2 list || true");
  if (pm2.includes("errored") || pm2.includes("stopped")) {
    run("pm2 restart all");
    log("♻️ PM2 перезапущен");
  }

  // Очистка временных файлов
  run("npm cache clean --force");
  run("rm -rf /tmp/* /var/tmp/*");
  log("🧹 Очистка временных файлов завершена");

  if (issues.length > 0) {
    sendTelegram(
      `🚨 Обнаружены проблемы:\n${issues.join("\n")}\nСистема восстановлена.`
    );
  } else {
    log("✅ Все таймеры активны, вмешательство не требуется");
  }

  log("🏁 Завершено самовосстановление.");
}

healSystem();
