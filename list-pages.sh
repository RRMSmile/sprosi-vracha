#!/bin/bash
# Автоматический экспорт страниц и вывод всех ссылок

echo "🚀 Пересборка фронтенда..."
npm run build > /dev/null 2>&1

echo "🌐 Список страниц:"
cd /opt/sprosi-vracha/frontend/out

find . -type f -name "index.html" \
| sed 's|^\./||' \
| sed 's|/index.html$||' \
| awk '{print "https://sprosi-vracha.com/"$0}' \
| tee /opt/sprosi-vracha/frontend/pages.txt

echo "✅ Сохранено в /opt/sprosi-vracha/frontend/pages.txt"

node /opt/sprosi-vracha/frontend/scripts/generate-sitemap.js

