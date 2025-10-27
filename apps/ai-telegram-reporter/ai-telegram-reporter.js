import fs from "fs";
import { execSync } from "child_process";

const LOG_FILE = "/opt/sprosi-vracha-ai/apps/ai-telegram-reporter/telegram.log";
const REPORT_FILE = "/opt/sprosi-vracha-ai/reports/daily-summary.json";

// 🧩 Укажи свои данные:
const TELEGRAM_BOT_TOKEN = "<ВСТАВЬ_СВОЙ_ТОКЕН_БОТА>";
const TELEGRAM_CHAT_ID = "<ТВОЙ_CHAT_ID>"; // можно узнать у @userinfobot

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + "\n");
}

function sendTelegramMessage(text) {
  const safe = text.replace(/"/g, '\\"');
  try {
    execSync(
      `curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" -d chat_id="${TELEGRAM_CHAT_ID}" -d parse_mode="Markdown" -d text="${safe}"`
    );
    log("✅ Отчёт отправлен в Telegram");
  } catch (e) {
    log(`⚠️ Ошибка отправки в Telegram: ${e.message}`);
  }
}

function runReport() {
  log("📨 Запуск AI-TelegramReporter...");
  if (!fs.existsSync(REPORT_FILE)) {
    log("⚠️ Нет файла сводки, пропуск");
    return;
  }

  const data = JSON.parse(fs.readFileSync(REPORT_FILE, "utf-8"));

  const text = `
📊 *Ежедневный отчёт — ${new Date().toLocaleDateString("ru-RU")}*

🖥 *Сервер:* ${data.server}
⏱ *Аптайм:* ${data.uptime}
💾 *Память:* ${data.memory}
📀 *Диск:* ${data.disk}

🧩 *Модули:*
${Object.entries(data.modules)
  .map(([k, v]) => `• ${k}: ${v ? "✅" : "❌"}`)
  .join("\n")}

📚 *Статистика:*
• Статей: ${data.stats.total_articles}
• Ошибок: ${data.stats.recent_errors}
• Битых ссылок: ${data.stats.broken_links}

🕓 *Последний HealthCheck:* ${data.last_healthcheck || "—"}
`;

  sendTelegramMessage(text);
}

runReport();
