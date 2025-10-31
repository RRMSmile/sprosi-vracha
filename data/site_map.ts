export const SITE_MAP = {
  symptoms: [
    { slug: "bol-v-gorle", name: "Боль в горле", diseases: ["angina","gripp","farintit"], articles: ["kak-lechit-kashel","bol-v-gorle-pri-angine"] },
    { slug: "kashel", name: "Кашель", diseases: ["angina","gripp","bronhit"], articles: ["kak-lechit-kashel","kashel-u-detej"] },
    { slug: "temperatura", name: "Температура", diseases: ["gripp","farintit","orel"], articles: ["temperatura-pri-grippe","temperatura-u-detej"] },
    { slug: "nasmork", name: "Насморк", diseases: ["gripp","orl-zabolevanie"], articles: ["kak-lechit-nasmork","preparaty-pri-nasmorke"] },
    { slug: "golovnaya-bol", name: "Головная боль", diseases: ["migren","gripp"], articles: ["golovnaya-bol-pri-grippe","migren-lechenie"] }
  ],
  diseases: [
    { slug: "angina", name: "Ангина", symptoms: ["bol-v-gorle","kashel"], articles: ["kak-lechit-kashel","bol-v-gorle-pri-angine"] },
    { slug: "gripp", name: "Грипп", symptoms: ["bol-v-gorle","kashel","temperatura","nasmork"], articles: ["temperatura-pri-grippe","kak-lechit-kashel"] },
    { slug: "farintit", name: "Фарингит", symptoms: ["bol-v-gorle","temperatura"], articles: ["farintit-lechenie","temperatura-pri-grippe"] },
    { slug: "bronhit", name: "Бронхит", symptoms: ["kashel"], articles: ["kashel-u-detej","bronhit-lechenie"] },
    { slug: "migren", name: "Мигрень", symptoms: ["golovnaya-bol"], articles: ["migren-lechenie"] },
    { slug: "orl-zabolevanie", name: "ОРЛ-заболевание", symptoms: ["nasmork"], articles: ["preparaty-pri-nasmorke"] }
  ],
  articles: [
    { slug: "kak-lechit-kashel", name: "Как лечить кашель", symptoms: ["kashel","bol-v-gorle"], diseases: ["angina","gripp"], doctors: ["ramazanov"] },
    { slug: "bol-v-gorle-pri-angine", name: "Боль в горле при ангине", symptoms: ["bol-v-gorle"], diseases: ["angina"], doctors: ["ramazanov"] },
    { slug: "temperatura-pri-grippe", name: "Температура при гриппе", symptoms: ["temperatura"], diseases: ["gripp"], doctors: ["ramazanov"] },
    { slug: "kashel-u-detej", name: "Кашель у детей", symptoms: ["kashel"], diseases: ["bronhit"], doctors: ["ivanov"] },
    { slug: "farintit-lechenie", name: "Лечение фарингита", symptoms: ["bol-v-gorle","temperatura"], diseases: ["farintit"], doctors: ["petrov"] },
    { slug: "golovnaya-bol-pri-grippe", name: "Головная боль при гриппе", symptoms: ["golovnaya-bol","temperatura"], diseases: ["gripp"], doctors: ["ivanov"] },
    { slug: "migren-lechenie", name: "Лечение мигрени", symptoms: ["golovnaya-bol"], diseases: ["migren"], doctors: ["petrov"] },
    { slug: "preparaty-pri-nasmorke", name: "Препараты при насморке", symptoms: ["nasmork"], diseases: ["orl-zabolevanie"], doctors: ["ivanov"] }
  ],
  doctors: [
    { slug: "ramazanov", name: "Руслан Рамазанов", specialty: "GeneralPractice", articles: ["kak-lechit-kashel","bol-v-gorle-pri-angine","temperatura-pri-grippe"] },
    { slug: "ivanov", name: "Иван Иванов", specialty: "Pediatrics", articles: ["kashel-u-detej","golovnaya-bol-pri-grippe","preparaty-pri-nasmorke"] },
    { slug: "petrov", name: "Пётр Петров", specialty: "Neurology", articles: ["migren-lechenie","farintit-lechenie"] }
  ],
  faq: [
    { slug: "temperatura-kashel", questions: [
        { question: "Как снизить температуру?", answer: "Пример ответа, рекомендации врача." },
        { question: "Что делать при кашле?", answer: "Пример ответа, рекомендации врача." }
      ]
    },
    { slug: "bol-v-gorle", questions: [
        { question: "Что делать при боли в горле?", answer: "Пример ответа, рекомендации врача." },
        { question: "Какие лекарства можно использовать?", answer: "Пример ответа, рекомендации врача." }
      ]
    }
  ]
};
