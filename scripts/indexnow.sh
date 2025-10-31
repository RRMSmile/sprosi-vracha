#!/bin/bash
# === IndexNow мгновенная индексация + Telegram уведомление ===

# IndexNow
TOKEN="1d6f01f0a6a342f8a17cb8a6b22c09"
HOST="sprosi-vracha.com"
API="https://api.indexnow.org/indexnow"
SITEMAP="/opt/sprosi-vracha/frontend/public/sitemap.xml"
LOG_FILE="/var/log/indexnow.log"

# Telegram уведомления
TELEGRAM_BOT_TOKEN="8291323481:AAEOJ5Y1-iNxtkLzMrlE7ShB1P2Ugwvg0Co"
TELEGRAM_CHAT_ID="61158928"

# === Подготовка ===
mkdir -p /var/log
touch $LOG_FILE

# Проверяем sitemap
if [ ! -f "$SITEMAP" ]; then
  MSG="🚨 IndexNow: файл sitemap.xml не найден!"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $MSG" >> $LOG_FILE
  curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d chat_id=$TELEGRAM_CHAT_ID -d text="$MSG"
  exit 1
fi

# Извлекаем первые 20 URL из sitemap
URLS=$(grep -oP '(?<=<loc>).*?(?=</loc>)' "$SITEMAP" | head -n 20)

# Формируем JSON для IndexNow
JSON="{\"host\":\"$HOST\",\"key\":\"$TOKEN\",\"urlList\":["
for URL in $URLS; do
  JSON="$JSON\"$URL\","
done
JSON="${JSON%,}]}"  # удаляем последнюю запятую

# === Отправляем запрос ===
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API" \
-H "Content-Type: application/json" -d "$JSON")

# === Проверяем результат ===
if [ "$RESPONSE" -eq 200 ] || [ "$RESPONSE" -eq 202 ]; then
  MSG="📤 IndexNow: успешно отправлено ($(date '+%Y-%m-%d %H:%M')), код $RESPONSE"
else
  MSG="⚠️ IndexNow: ошибка при отправке (код $RESPONSE)"
fi

# === Лог и Telegram ===
echo "[$(date '+%Y-%m-%d %H:%M:%S')] $MSG" >> $LOG_FILE
tail -n 30 $LOG_FILE > ${LOG_FILE}.tmp && mv ${LOG_FILE}.tmp $LOG_FILE

curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d chat_id=$TELEGRAM_CHAT_ID \
  -d text="$MSG"
