import symptomsData from "../../../data/symptoms/symptoms.json";
import fs from "fs";
import path from "path";

export const dynamic = "error";
export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  return symptomsData.map((s: { slug: string }) => ({ slug: s.slug }));
}

export default function SymptomPage({ params }: { params: { slug: string } }) {
  const symptom = symptomsData.find((s: any) => s.slug === params.slug);
  if (!symptom) return <h1>Симптом не найден</h1>;

  const jsonLdMedical = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `${symptom.title} — причины, анализы и лечение`,
    url: `https://sprosi-vracha.com/symptoms/${symptom.slug}`,
    mainEntity: {
      "@type": "MedicalCondition",
      name: symptom.title,
      signOrSymptom: symptom.title,
      possibleCause: (symptom.causes || []).map((c: string) => ({
        "@type": "MedicalCause",
        name: c,
      })),
    },
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Что означает симптом ${symptom.title}?`,
        acceptedAnswer: { "@type": "Answer", text: symptom.description },
      },
      {
        "@type": "Question",
        name: `Какие причины ${symptom.title.toLowerCase()}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: (symptom.causes || []).join(", "),
        },
      },
    ],
  };

  // ✅ сохраняем JSON-LD в статическую папку, чтобы проверить содержимое
  const dir = path.join(process.cwd(), "out", "symptoms", symptom.slug);
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "schema.json"),
      JSON.stringify([jsonLdMedical, jsonLdFaq], null, 2)
    );
  } catch (e) {
    console.warn("Не удалось записать schema.json:", e);
  }

  return (
    <main
      style={{
        fontFamily: "system-ui",
        padding: "24px",
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdMedical),
        }}
      />
      <h1>{symptom.title}</h1>
      <p>{symptom.description}</p>
      {Array.isArray(symptom.causes) && symptom.causes.length > 0 && (
        <>
          <h2>Возможные причины</h2>
          <ul>
            {symptom.causes.map((c: string) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdFaq),
        }}
      />
    </main>
  );
}

