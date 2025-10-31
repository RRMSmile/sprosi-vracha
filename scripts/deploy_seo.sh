#!/bin/bash
# === Универсальный деплой SEO + IndexNow + Telegram уведомление ===

# Настройки
FRONTEND_DIR="/opt/sprosi-vracha/frontend"
SITEMAP="$FRONTEND_DIR/public/sitemap.xml"
LOG_FILE="/var/log/indexnow.log"

# Telegram
TELEGRAM_BOT_TOKEN="8291323481:AAFCY_3Jzsb1tZfrHKKMhQ8MoieRQUdemYI"
TELEGRAM_CHAT_ID="61158928"

# IndexNow
INDEXNOW_TOKEN="1d6f01f0a6a342f8a17cb8a6b22c09"
HOST="sprosi-vracha.com"
INDEXNOW_API="https://api.indexnow.org/indexnow"

# === Подготовка ===
mkdir -p /var/log
touch $LOG_FILE

cd $FRONTEND_DIR || { echo "❌ Папка фронта не найдена!"; exit 1; }

# === Сборка фронта и генерация sitemap ===
MSG="🚀 Сборка фронта и генерация sitemap..."
echo "[$(date '+%Y-%m-%d %H:%M:%S')] $MSG" >> $LOG_FILE

npm install
npm run build
npm run sitemap

# Проверяем наличие sitemap
if [ ! -f "$SITEMAP" ]; then
  MSG="🚨 Ошибка: sitemap.xml не найден!"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $MSG" >> $LOG_FILE
  curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
    -d chat_id=$TELEGRAM_CHAT_ID -d text="$MSG"
  exit 1
fi

# === Отправка IndexNow ===
URLS=$(grep -oP '(?<=<loc>).*?(?=</loc>)' "$SITEMAP" | head -n 20)
JSON="{\"host\":\"$HOST\",\"key\":\"$INDEXNOW_TOKEN\",\"urlList\":["
for URL in $URLS; do
  JSON="$JSON\"$URL\","
done
JSON="${JSON%,}]}"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$INDEXNOW_API" \
-H "Content-Type: application/json" -d "$JSON")

if [ "$RESPONSE" -eq 200 ] || [ "$RESPONSE" -eq 202 ]; then
  MSG="📤 IndexNow: успешно отправлено ($(date '+%Y-%m-%d %H:%M')), код $RESPONSE"
else
  MSG="⚠️ IndexNow: ошибка при отправке (код $RESPONSE)"
fi

# === Лог и Telegram ===
echo "[$(date '+%Y-%m-%d %H:%M:%S')] $MSG" >> $LOG_FILE
tail -n 30 $LOG_FILE > ${LOG_FILE}.tmp && mv ${LOG_FILE}.tmp $LOG_FILE

curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
  -d chat_id=$TELEGRAM_CHAT_ID -d text="$MSG"

echo "✅ Деплой завершён"

