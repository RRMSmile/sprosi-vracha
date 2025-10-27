import fs from "fs";
import { execSync } from "child_process";

const LOG = "/opt/sprosi-vracha-ai/apps/ai-upgrade/logs/ai-upgrade.log";
const REPO_URL = "https://github.com/ramaz/sprosi-vracha-ai.git"; // ← замени, если нужно
const BRANCH = "main";

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG, line + "\n");
}

function run(cmd, silent = false) {
  try {
    const out = execSync(cmd, { encoding: "utf8" }).trim();
    if (!silent) log(`$ ${cmd}`);
    return out;
  } catch (e) {
    log(`⚠️ Ошибка при выполнении: ${cmd}\n${e.message}`);
    return "";
  }
}

function getHash() {
  try {
    return run("git rev-parse HEAD", true);
  } catch {
    return "none";
  }
}

function updateRepo() {
  log("⬇️ Проверяю наличие обновлений...");
  if (!fs.existsSync("/opt/sprosi-vracha-ai/.git")) {
    log("📦 Репозиторий не найден, клонирую...");
    run(`git clone -b ${BRANCH} ${REPO_URL} /opt/sprosi-vracha-ai`);
    return;
  }

  const before = getHash();
  run(`cd /opt/sprosi-vracha-ai && git fetch --all`);
  run(`cd /opt/sprosi-vracha-ai && git reset --hard origin/${BRANCH}`);
  const after = getHash();

  if (before !== after) {
    log(`🚀 Обновление найдено (${before.substring(0,7)} → ${after.substring(0,7)})`);
    rebuildModules();
  } else {
    log("✅ Обновлений нет — код актуален");
  }
}

function rebuildModules() {
  log("🔧 Пересобираю ключевые приложения...");
  const dirs = fs.readdirSync("/opt/sprosi-vracha-ai/apps").filter(d => d.startsWith("ai-"));
  dirs.forEach(dir => {
    const path = `/opt/sprosi-vracha-ai/apps/${dir}`;
    if (fs.existsSync(`${path}/package.json`)) {
      run(`cd ${path} && npm install --silent`);
    }
  });
  run("systemctl daemon-reload");
  run("systemctl restart ai-*");
  log("✅ Все модули обновлены и перезапущены");
}

function cleanup() {
  log("🧹 Очистка старых логов (>15 МБ)...");
  run(`find /opt/sprosi-vracha-ai/apps -type f -name '*.log' -size +15M -exec truncate -s 0 {} \\;`);
}

function main() {
  log("🚀 Запуск AI-Auto-Upgrade...");
  updateRepo();
  cleanup();
  log("🏁 Цикл обновления завершён");
}

main();
