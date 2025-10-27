#!/usr/bin/env bash
set -e

START_TIME=$(date +%s)
DATE=$(date '+%Y-%m-%d %H:%M:%S')
echo "🚀 [Sprosi-Vracha] Запуск полного деплоя..."

# === 1. Проверка окружения ===
if [ ! -f "/opt/sprosi-vracha-ai/.env" ]; then
  echo "⚠️  Файл .env не найден, создайте /opt/sprosi-vracha-ai/.env перед запуском."
  exit 1
fi
source /opt/sprosi-vracha-ai/.env

# === 2. Сборка фронта ===
echo "📦 Сборка фронта..."
cd /opt/sprosi-vracha/frontend
npm ci --silent
npm run build --silent

# === 3. Деплой статики ===
echo "📤 Деплой в /var/www/sprosi-vracha..."
mkdir -p /var/www/sprosi-vracha
rsync -a --delete out/ /var/www/sprosi-vracha/
nginx -t && systemctl reload nginx

# === 4. Обновление sitemap ===
echo "🗺  Генерация sitemap..."
node /opt/sprosi-vracha-ai/apps/ai-sitemap/ai-sitemap.js || echo "⚠️  Sitemap не сгенерирован"

# === 5. Проверка и рестарт сервисов ===
echo "🔁 Проверка статуса AI-сервисов..."
active_count=0
total_count=0
for svc in $(systemctl list-units --type=service --no-pager | grep ai- | awk '{print $1}'); do
  total_count=$((total_count+1))
  if systemctl is-active --quiet "$svc"; then
    active_count=$((active_count+1))
  fi
done

# === 6. Резервное копирование ===
echo "💾 Создание резервной копии..."
mkdir -p /opt/sprosi-vracha-ai/backups
BACKUP_FILE="/opt/sprosi-vracha-ai/backups/site-$(date +%F_%H%M).tar.gz"
tar -czf "$BACKUP_FILE" /var/www/sprosi-vracha > /dev/null 2>&1
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | awk '{print $1}')
echo "✅ Бэкап создан (${BACKUP_SIZE})"

# === 7. Git-синхронизация ===
cd /opt/sprosi-vracha-ai
git add -A
git commit -m "auto-deploy: ${DATE}" >/dev/null 2>&1 || true
git push origin main >/dev/null 2>&1 || true

# === 8. Проверка сайта ===
echo "🌐 Проверка доступности сайта..."
START_PING=$(date +%s%3N)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://sprosi-vracha.com || echo "000")
END_PING=$(date +%s%3N)
RESPONSE_TIME_MS=$((END_PING - START_PING))

# === 9. Подсчёт статей ===
ARTICLE_COUNT=$(find /opt/sprosi-vracha-ai/data/articles -type f -name "*.md" 2>/dev/null | wc -l)

# === 10. Ошибки за сутки (ai-error-watcher.log) ===
ERROR_LOG="/opt/sprosi-vracha-ai/apps/ai-error-watcher/errors.log"
ERRORS_24H=0
if [ -f "$ERROR_LOG" ]; then
  ERRORS_24H=$(grep -c "$(date --date='-1 day' '+%Y-%m-%d')" "$ERROR_LOG" || echo 0)
fi

# === 11. Системные метрики ===
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print 100 - $8 "%"}')
RAM_USAGE=$(free -m | awk '/Mem:/ {printf "%dMB/%dMB (%.1f%%)", $3, $2, $3/$2*100}')

# === 12. Telegram-уведомление ===
END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))
BUILD_TIME_STR=$(printf "%d мин %02d сек" $((BUILD_TIME/60)) $((BUILD_TIME%60)))

if [ -n "$TG_TOKEN" ] && [ -n "$TG_CHAT" ]; then
  STATUS_ICON="⚠️"
  STATUS_TEXT="Проверить сайт"
  if [ "$HTTP_CODE" = "200" ]; then
    STATUS_ICON="✅"
    STATUS_TEXT="Сайт доступен (${RESPONSE_TIME_MS} мс)"
  fi

  MESSAGE="${STATUS_ICON} *Sprosi-Vracha обновлён!*%0A🕒 ${DATE}%0A📄 Статей: ${ARTICLE_COUNT}%0A🧩 Активные модули: ${active_count}/${total_count}%0A💾 Бэкап: ${BACKUP_SIZE}%0A⚙️ Время сборки: ${BUILD_TIME_STR}%0A🔥 CPU: ${CPU_USAGE}%0A🧠 RAM: ${RAM_USAGE}%0A❗️Ошибок за 24ч: ${ERRORS_24H}%0A🌐 ${STATUS_TEXT}%0A👉 [sprosi-vracha.com](https://sprosi-vracha.com)"
  curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
    -d "chat_id=${TG_CHAT}" \
    -d "text=${MESSAGE}" \
    -d "parse_mode=Markdown" >/dev/null 2>&1 && \
  echo "📨 Telegram уведомление отправлено"
else
  echo "⚠️  Telegram токен или chat_id не заданы"
fi

# === 13. Завершение ===
echo "🎉 Деплой завершён: ${DATE}"

