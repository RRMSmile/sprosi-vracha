import fs from "fs";
import { execSync } from "child_process";

const LOG_FILE = "/opt/sprosi-vracha-ai/apps/ai-auto-publisher/ai-auto-publisher.log";
const ARTICLES_PATH = "/opt/sprosi-vracha-ai/data/articles";
const FRONTEND_EXPORT = "/opt/sprosi-vracha/frontend";
const INDEXNOW_KEY = "urohn3hs4k"; // замени на свой при необходимости

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + "\n");
}

function publishArticles() {
  if (!fs.existsSync(ARTICLES_PATH)) {
    log("⚠️ Папка с материалами не найдена — выходим.");
    return;
  }

  const files = fs.readdirSync(ARTICLES_PATH).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    log("ℹ️ Новых статей не найдено — пропуск.");
    return;
  }

  log(`🚀 Найдено ${files.length} статей. Начинаю публикацию...`);

  // Копируем статьи в папку фронтенда
  const destDir = `${FRONTEND_EXPORT}/content`;
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of files) {
    fs.copyFileSync(`${ARTICLES_PATH}/${file}`, `${destDir}/${file}`);
    log(`📝 Опубликована: ${file}`);
  }

  // Собираем сайт (новая команда!)
  try {
    execSync(`cd ${FRONTEND_EXPORT} && npm run build --silent`, { stdio: "pipe" });
    log("🌐 Сайт пересобран успешно.");
  } catch (e) {
    log(`⚠️ Ошибка сборки: ${e.message}`);
  }

  // Ping IndexNow
  try {
    const urls = files.map(
      (f) => `https://sprosi-vracha.com/content/${f.replace(".md", ".html")}`
    );
    for (const url of urls) {
      execSync(
        `curl -s -X POST "https://api.indexnow.org/indexnow?url=${url}&key=${INDEXNOW_KEY}"`
      );
      log(`📡 Отправлено в IndexNow: ${url}`);
    }
  } catch (e) {
    log(`⚠️ Ошибка IndexNow: ${e.message}`);
  }

  log("✅ Публикация завершена успешно.");
}

// Основной запуск
try {
  log("🚀 Запуск AI-AutoPublisher...");
  publishArticles();
} catch (e) {
  log(`❌ Ошибка выполнения: ${e.message}`);
}
