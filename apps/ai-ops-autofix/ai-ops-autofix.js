import fs from "fs";
import { execSync } from "child_process";

const LOG = "/opt/sprosi-vracha-ai/apps/ai-ops-autofix/autofix.log";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

const WATCH_DIR = "/opt/sprosi-vracha-ai/apps";
const MODULES = fs.readdirSync(WATCH_DIR).filter(d => d.startsWith("ai-"));

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG, line + "\n");
}

function sendTelegram(msg) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    execSync(
      `curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" -d chat_id="${TELEGRAM_CHAT_ID}" -d text="${msg}"`
    );
    log("📨 Уведомление отправлено в Telegram");
  } catch (e) {
    log(`⚠️ Ошибка отправки Telegram: ${e.message}`);
  }
}

function analyzeLogs(module) {
  const logPath = `${WATCH_DIR}/${module}/${module.replace("ai-", "")}.log`;
  if (!fs.existsSync(logPath)) return [];

  const content = fs.readFileSync(logPath, "utf8");
  const lines = content.split("\n").slice(-200);

  const patterns = [
    /MODULE_NOT_FOUND/,
    /EADDRINUSE/,
    /SyntaxError/,
    /Connection error/,
    /UnhandledPromiseRejection/,
  ];

  return patterns.filter(p => lines.some(l => p.test(l)));
}

function fixModule(module) {
  try {
    log(`🛠 Исправляю ${module}...`);
    execSync(`systemctl restart ${module}.service`, { stdio: "ignore" });
    log(`✅ ${module} перезапущен`);
  } catch (e) {
    log(`⚠️ Не удалось перезапустить ${module}: ${e.message}`);
  }
}

function main() {
  log("🤖 Запуск AI-Ops-Autofix...");

  for (const m of MODULES) {
    const problems = analyzeLogs(m);
    if (problems.length) {
      log(`🚨 Найдены ошибки в ${m}: ${problems.map(p => p.source).join(", ")}`);
      fixModule(m);
      sendTelegram(`⚙️ Автоисправление: ${m} (${problems.length} ошибок)`);
    } else {
      log(`🟢 ${m} стабилен`);
    }
  }

  log("✅ Авто-проверка завершена");
}

main();
