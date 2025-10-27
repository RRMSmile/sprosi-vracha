import fs from "fs";
import path from "path";

const LOG_DIR = "/opt/sprosi-vracha-ai/apps";
const ERROR_LOG = "/opt/sprosi-vracha-ai/apps/ai-error-watcher/errors.log";
const CACHE_FILE = "/opt/sprosi-vracha-ai/apps/ai-error-watcher/known-errors.json";

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(ERROR_LOG, line + "\n");
}

function getLogs() {
  const logs = [];
  const apps = fs.readdirSync(LOG_DIR);
  for (const app of apps) {
    const appPath = path.join(LOG_DIR, app);
    if (fs.existsSync(`${appPath}/${app}.log`)) {
      const content = fs.readFileSync(`${appPath}/${app}.log`, "utf-8");
      logs.push({ app, content });
    }
  }
  return logs;
}

function detectNewErrors() {
  let known = [];
  if (fs.existsSync(CACHE_FILE)) {
    known = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  }

  const newErrors = [];
  const logs = getLogs();

  for (const { app, content } of logs) {
    const matches = [...content.matchAll(/⚠️|❌\s(.+)/g)];
    for (const m of matches) {
      const text = `${app}: ${m[0]}`;
      if (!known.includes(text)) {
        newErrors.push(text);
        known.push(text);
      }
    }
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(known, null, 2));
  if (newErrors.length) {
    log(`🚨 Новые ошибки (${newErrors.length}):\n${newErrors.join("\n")}`);
  } else {
    log("✅ Новых ошибок не найдено");
  }
}

log("🧠 Запуск AI-ErrorWatcher...");
detectNewErrors();
