import fs from "fs";
import { execSync } from "child_process";

const LOG_FILE = "/opt/sprosi-vracha-ai/apps/ai-auto-publisher/publisher.log";
const CONTENT_DIR = "/opt/sprosi-vracha-ai/data/articles";
const FRONTEND_EXPORT = "/opt/sprosi-vracha/frontend";
const SITEMAP_FILE = `${FRONTEND_EXPORT}/public/sitemap.xml`;
const INDEXNOW_KEY = "urohn3hs4k"; // твой IndexNow ключ, если другой — подставь

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + "\n");
}

function publishArticles() {
  const files = fs.existsSync(CONTENT_DIR) ? fs.readdirSync(CONTENT_DIR) : [];
  if (files.length === 0) {
    log("ℹ️ Новых статей не найдено — пропуск.");
    return;
  }

  log(`🚀 Найдено ${files.length} статей. Начинаю публикацию...`);

  for (const file of files) {
    const src = `${CONTENT_DIR}/${file}`;
    const dest = `${FRONTEND_EXPORT}/content/${file}`;
    fs.mkdirSync(`${FRONTEND_EXPORT}/content`, { recursive: true });
    fs.copyFileSync(src, dest);
    log(`📝 Опубликована: ${file}`);
  }

  // Обновляем sitemap
  try {
    execSync(`cd ${FRONTEND_EXPORT} && npm run export --silent`);
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

try {
  log("🚀 Запуск AI-AutoPublisher...");
  publishArticles();
} catch (e) {
  log(`❌ Ошибка выполнения: ${e.message}`);
}
