import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import OpenAI from "openai";

const LOG = "/opt/sprosi-vracha-ai/apps/ai-content-pipeline/pipeline.log";
const DATA_DIR = "/opt/sprosi-vracha-ai/data";
const TRENDS_FILE = `${DATA_DIR}/trends.json`;
const ARTICLES_DIR = `${DATA_DIR}/articles`;
const SITE_URL = "https://sprosi-vracha.com";
const INDEXNOW_KEY = "urohn3hs4k"; // при необходимости замени
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, line + "\n");
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[ё]/g, "е")
    .replace(/[^a-z0-9а-я\- ]/gi, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function saveArticle(slug, title, body) {
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  const full = `# ${title}\n\n${body}\n`;
  const file = `${ARTICLES_DIR}/${slug}.md`;
  fs.writeFileSync(file, full);
  log(`📝 Сохранена статья: ${file}`);
  return file;
}

function pingIndexNow(url) {
  try {
    execSync(
      `curl -s -X POST "https://api.indexnow.org/indexnow?url=${encodeURIComponent(
        url
      )}&key=${INDEXNOW_KEY}"`
    );
    log(`📡 IndexNow ping: ${url}`);
  } catch (e) {
    log(`⚠️ IndexNow ошибка: ${e.message}`);
  }
}

function loadTrends() {
  if (!fs.existsSync(TRENDS_FILE)) {
    log("⚠️ trends.json не найден — создам пустой список");
    return [];
  }
  try {
    const raw = fs.readFileSync(TRENDS_FILE, "utf8");
    const arr = JSON.parse(raw);
    // сортируем по приоритету убыв.
    return Array.isArray(arr)
      ? arr.sort((a, b) => (b.priority || 0) - (a.priority || 0))
      : [];
  } catch (e) {
    log(`❌ Ошибка чтения trends.json: ${e.message}`);
    return [];
  }
}

function fallbackArticle(topic) {
  // Простой безопасный шаблон без медицинских назначений
  return [
    `**Кратко о теме**`,
    `Тема «${topic}» встречается достаточно часто. Ниже — базовая ориентировочная информация.`,
    ``,
    `## Возможные причины`,
    `• Индивидуальные особенности и образ жизни`,
    `• Сопутствующие состояния (стресс, режим сна/питания)`,
    `• Ошибки самодиагностики`,
    ``,
    `## Когда стоит обратиться к врачу`,
    `• Симптомы усиливаются или не проходят`,
    `• Появляются новые тревожные признаки`,
    `• Есть хронические заболевания или вы принимаете лекарства`,
    ``,
    `## Что точно не делать`,
    `• Не заниматься самолечением без консультации специалиста`,
    `• Не откладывать обращение при ухудшении состояния`,
    ``,
    `> Важно: эта публикация носит общий информационный характер и **не заменяет** очную консультацию врача.`,
  ].join("\n");
}

async function generateWithOpenAI(topic) {
  const client = new OpenAI({ apiKey: OPENAI_KEY });

  const prompt = `
Ты — врач и автор портала "СпросиВрача". Напиши корректный и понятный материал на тему: "${topic}".
Структура:
1) Введение: зачем это знать.
2) Возможные причины (без диагноза пользователю).
3) Когда обращаться к врачу (чёткие критерии).
4) На что обратить внимание (самонаблюдение, дневник симптомов).
5) Чего избегать (что нельзя делать).
6) Краткое резюме + дисклеймер "не является мед. рекомендацией".
Тон: спокойный, понятный, без назначения лечения. Объём ~ 600–900 слов.
`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  const text = res?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Пустой ответ модели");
  return text;
}

async function writeArticle(topic) {
  const slug = slugify(topic);
  let body;
  if (OPENAI_KEY && !/sk-\.\.\./.test(OPENAI_KEY) && !/ВАШ_КЛЮЧ/.test(OPENAI_KEY)) {
    try {
      log(`✍️ Генерация через OpenAI: "${topic}"`);
      body = await generateWithOpenAI(topic);
    } catch (e) {
      log(`⚠️ OpenAI недоступен (${e.message}) — использую fallback`);
      body = fallbackArticle(topic);
    }
  } else {
    log("ℹ️ OPENAI_API_KEY отсутствует или тестовый — используем fallback");
    body = fallbackArticle(topic);
  }
  const file = saveArticle(slug, topic, body);
  const url = `${SITE_URL}/articles/${slug}`;
  pingIndexNow(url);
  return { slug, file, url };
}

async function maybeAutopublish() {
  // При желании можно сразу дернуть наш autopublisher:
  // execSync("node /opt/sprosi-vracha-ai/apps/ai-auto-publisher/ai-auto-publisher.js", { stdio: "ignore" });
  // log("🔁 Вызван AI-AutoPublisher");
}

(async () => {
  try {
    log("🚀 Старт AI-Content-Pipeline v2");
    const trends = loadTrends();
    if (trends.length === 0) {
      log("ℹ️ Тем для генерации пока нет — выходим");
      process.exit(0);
    }

    // Возьмём топ-3 темы по приоритету
    const topics = trends.slice(0, 3).map(t => t.topic);
    log(`📚 Тем к обработке: ${topics.length} → ${topics.join(" | ")}`);

    for (const t of topics) {
      await writeArticle(t);
    }

    await maybeAutopublish();
    log("✅ Контентный цикл завершён");
  } catch (e) {
    log(`❌ Ошибка пайплайна: ${e.message}`);
    process.exit(1);
  }
try {
  execSync("node /opt/sprosi-vracha-ai/apps/ai-auto-publisher/ai-auto-publisher.js", { stdio: "ignore" });
  log("🔁 Вызван AI-AutoPublisher");
} catch (e) {
  log(`⚠️ Ошибка вызова AI-AutoPublisher: ${e.message}`);
}
})();
