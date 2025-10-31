#!/bin/bash
# =========================================
# Проверка всех страниц сайта и sitemap
# =========================================

PAGES=(
  "/"
  "/articles/kak-lechit-kashel"
  "/articles/bol-v-gorle-pri-angine"
  "/symptoms/bol-v-gorle"
  "/symptoms/kashel"
  "/diseases/angina"
  "/diseases/gripp"
  "/doctors/ramazanov"
  "/faq/bol-v-gorle"
)

echo "Проверка страниц сайта..."
for p in "${PAGES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://sprosi-vracha.com$p")
  echo "$p -> $STATUS"
done

echo "Проверка sitemap..."
curl -I https://sprosi-vracha.com/sitemap.xml
curl -I https://sprosi-vracha.com/sitemap-0.xml
