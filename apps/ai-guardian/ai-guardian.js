import fs from "fs";
import { execSync } from "child_process";

const LOG = "/opt/sprosi-vracha-ai/apps/ai-guardian/logs/ai-guardian.log";
const ALERT_FILE = "/opt/sprosi-vracha-ai/apps/ai-guardian/alerts.json";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

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

function sendTelegram(msg) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    execSync(
      `curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" -d chat_id="${TELEGRAM_CHAT_ID}" -d text="${msg}"`
    );
    log("📨 Уведомление отправлено в Telegram");
  } catch (e) {
    log(`⚠️ Ошибка отправки в Telegram: ${e.message}`);
  }
}

function checkAuthLog() {
  const suspicious = run("grep 'Failed password' /var/log/auth.log | tail -n 10");
  if (suspicious) {
    const count = suspicious.split("\n").length;
    log(`🚨 Найдено ${count} попыток входа с ошибкой`);
    sendTelegram(`🚨 AI-Guardian: обнаружены ${count} неудачные входы в SSH`);
  }
}

function checkRootChanges() {
  const changes = run("find /root -type f -mtime -1 2>/dev/null | grep -v '.log$' | head -n 10");
  if (changes) {
    log("⚠️ Изменения в /root за последние 24 ч");
    sendTelegram(`⚠️ AI-Guardian: обнаружены изменения в /root:\n${changes}`);
  }
}

function checkOpenPorts() {
  const ports = run("ss -tuln | grep LISTEN | grep -v '22' | grep -v '443' | grep -v '80' || true");
  if (ports) {
    log("🕵️ Найдены дополнительные открытые порты");
    sendTelegram(`🕵️ AI-Guardian: открытые порты:\n${ports}`);
  }
}

function checkFileIntegrity() {
  const base = "/etc/passwd";
  const hashFile = "/opt/sprosi-vracha-ai/apps/ai-guardian/.passwd.hash";
  const hash = run(`sha256sum ${base} | awk '{print $1}'`);
  if (!fs.existsSync(hashFile)) fs.writeFileSync(hashFile, hash);
  const prev = fs.readFileSync(hashFile, "utf8").trim();
  if (hash !== prev) {
    log("🚨 Файл /etc/passwd изменён!");
    sendTelegram("🚨 AI-Guardian: файл /etc/passwd был изменён — проверь систему!");
    fs.writeFileSync(hashFile, hash);
  }
}

function main() {
  log("🛡️ Запуск AI-Guardian...");
  checkAuthLog();
  checkRootChanges();
  checkOpenPorts();
  checkFileIntegrity();
  log("✅ Проверка безопасности завершена.");
}

main();
