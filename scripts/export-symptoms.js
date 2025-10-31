import fs from "fs";
import path from "path";

const symptomsFile = "./src/data/symptoms/symptoms.json";

if (!fs.existsSync(symptomsFile)) {
  console.error("❌ Файл symptoms.json не найден:", symptomsFile);
  process.exit(1);
}

const symptoms = JSON.parse(fs.readFileSync(symptomsFile, "utf-8"));
const outDir = "./out/symptoms";

fs.mkdirSync(outDir, { recursive: true });

function generateHtml(s) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `${s.title} — причины, анализы и лечение`,
    url: `https://sprosi-vracha.com/symptoms/${s.slug}`,
    mainEntity: {
      "@type": "MedicalCondition",
      name: s.title,
      signOrSymptom: s.title,
      possibleCause: (s.causes || []).map((c) => ({
        "@type": "MedicalCause",
        name: c,
      })),
    },
  };

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${s.title} — причины, анализы и лечение</title>
<meta name="description" content="${s.description}" />
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>
</head>
<body style="font-family:system-ui;max-width:760px;margin:auto;padding:24px;background:#fafafa">
<h1>${s.title}</h1>
<p>${s.description}</p>
${
  s.causes && s.causes.length
    ? `<h2>Возможные причины</h2><ul>${s.causes
        .map((c) => `<li>${c}</li>`)
        .join("")}</ul>`
    : ""
}
</body>
</html>`;
}

for (const s of symptoms) {
  const dir = path.join(outDir, s.slug);
  fs.mkdirSync(dir, { recursive: true });
  const html = generateHtml(s);
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf-8");
  console.log("✅ Сформирована страница:", s.slug);
}

console.log(`✨ Готово! Всего создано страниц: ${symptoms.length}`);

