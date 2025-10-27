import fs from "fs";
import { execSync } from "child_process";

const LOG = "/opt/sprosi-vracha-ai/apps/ops-autofix/logs/ops-autofix.log";

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

function checkPM2() {
  log("🧠 Проверка процессов PM2...");
  const list = run("pm2 list || true");
  if (!list) {
    log("⚠️ PM2 не отвечает — пробую перезапустить");
    run("pm2 resurrect || pm2 start all || true");
    return;
  }

  const stopped = list
    .split("\n")
    .filter(l => l.includes("stopped") || l.includes("errored"))
    .map(l => l.split("│")[2]?.trim())
    .filter(Boolean);

  if (stopped.length) {
    log(`🚨 Найдены остановленные процессы: ${stopped.join(", ")}`);
    stopped.forEach(name => run(`pm2 restart ${name}`));
  } else {
    log("🟢 Все PM2-процессы активны");
  }
}

function checkSystemd() {
  log("⚙️ Проверка systemd-таймеров...");
  const timers = run("systemctl list-timers --all | grep ai- || true").split("\n");
  if (!timers.length) {
    log("⚠️ Таймеры не найдены");
    return;
  }

  timers.forEach(line => {
    const name = line.split(/\s+/).pop();
    if (name && name.endsWith(".timer")) {
      const service = name.replace(".timer", ".service");
      const active = run(`systemctl is-active ${service}`);
      if (active !== "active") {
        log(`🔁 ${service} неактивен — перезапускаю`);
        run(`systemctl restart ${service}`);
      }
    }
  });
}

function cleanupLogs() {
  log("🧹 Очистка логов старше 10 МБ...");
  const files = run("find /opt/sprosi-vracha-ai/apps -type f -name '*.log' -size +10M || true")
    .split("\n")
    .filter(Boolean);
  files.forEach(f => {
    run(`truncate -s 0 "${f}"`);
    log(`✂️ Очищен лог: ${f}`);
  });
}

function main() {
  log("🚀 Запуск AI-Ops-Autofix...");
  checkPM2();
  checkSystemd();
  cleanupLogs();
  log("✅ Проверка завершена.");
}

main();
