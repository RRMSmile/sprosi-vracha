#!/usr/bin/env bash
set -e

echo "🚀 [Sprosi-Vracha] Запуск полного деплоя..."
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# === 1. Проверка окружения ===
if [ ! -f "/opt/sprosi-vracha-ai/.env" ]; then
  echo "⚠️  Файл .env не найден, создайте /opt/sprosi-vracha-ai/.env перед запуском."
  exit 1
fi

# === 2. Сборка фронта ===
echo "📦 Сборка фронта..."
cd /opt/sprosi-vracha/frontend
npm ci --silent
npm run build --silent

# === 3. Деплой статики ===
echo "📤 Деплой в /var/www/sprosi-vracha..."
rsync -a --delete out/ /var/www/sprosi-vracha/
nginx -t && systemctl reload nginx

# === 4. Обновление sitemap ===
echo "🗺  Генерация sitemap..."
node /opt/sprosi-vracha-ai/apps/ai-sitemap/ai-sitemap.js || echo "⚠️  Sitemap не сгенерирован"

# === 5. Проверка и рестарт сервисов ===
echo "🔁 Проверка статуса AI-сервисов..."
for svc in ai-content-pipeline ai-content-orchestrator ai-auto-publisher ai-telegram-reporter ai-error-watcher; do
  if systemctl is-active --quiet "$svc"; then
    echo "✅ $svc активен"
  else
    echo "🔄 Перезапуск $svc..."
    systemctl restart "$svc" || echo "⚠️ Не удалось перезапустить $svc"
  fi
done

# === 6. Резервное копирование ===
echo "💾 Создание резервной копии..."
mkdir -p /opt/sprosi-vracha-ai/backups
tar -czf /opt/sprosi-vracha-ai/backups/site-$(date +%F_%H%M).tar.gz /var/www/sprosi-vracha > /dev/null 2>&1 &
tar -czf /opt/sprosi-vracha-ai/backups/data-$(date +%F_%H%M).tar.gz /opt/sprosi-vracha-ai/data > /dev/null 2>&1 &
wait
echo "✅ Бэкапы созданы"

# === 7. Git-синхронизация ===
cd /opt/sprosi-vracha-ai
git add -A
git commit -m "auto-deploy: ${DATE}" || echo "⚠️  Нет изменений для коммита"
git push origin main || echo "⚠️  Не удалось выполнить git push (возможно, офлайн)"

# === 8. Проверка сайта ===
echo "🌐 Проверка доступности сайта..."
curl -s -o /dev/null -w "%{http_code}\n" https://sprosi-vracha.com | grep -q "200" \
  && echo "✅ Сайт доступен" || echo "⚠️ Сайт не отвечает (проверь Nginx)"

# === 9. Завершение ===
echo "🎉 Деплой завершён: ${DATE}"

