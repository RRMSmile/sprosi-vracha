const fs = require("fs");
const https = require("https");

const DOMAIN = "sprosi-vracha.com";
const KEY = "urohn3hs4k"; // чистый ключ без префиксов
const KEY_FILE = `${KEY}.txt`;
const KEY_PATH = `public/${KEY_FILE}`;

// 1️⃣ Проверяем и создаём файл при необходимости
if (!fs.existsSync(KEY_PATH)) {
  fs.writeFileSync(KEY_PATH, KEY);
  console.log("✅ Key-файл создан:", KEY_PATH);
} else {
  const content = fs.readFileSync(KEY_PATH, "utf8").trim();
  if (content !== KEY) {
    fs.writeFileSync(KEY_PATH, KEY);
    console.log("♻️ Перезаписан key-файл с корректным содержимым");
  }
}

// 2️⃣ Формируем тело запроса строго по спецификации IndexNow
const body = JSON.stringify({
  host: DOMAIN,
  key: KEY,
  keyLocation: `https://${DOMAIN}/${KEY_FILE}`,
  urlList: [
    `https://${DOMAIN}/sitemap.xml`,
    `https://${DOMAIN}/sitemap-0.xml`
  ]
});

// 3️⃣ Отправляем POST на IndexNow
const req = https.request(
  {
    hostname: "api.indexnow.org",
    path: "/indexnow",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body)
    }
  },
  res => {
    console.log("📡 IndexNow статус:", res.statusCode);
    if (res.statusCode === 200) {
      console.log("✅ Sitemap успешно отправлен поисковикам");
    } else {
      console.log("⚠️ Ошибка при отправке:", res.statusMessage);
    }
  }
);

req.on("error", err => console.error("Ошибка запроса:", err.message));
req.write(body);
req.end();
