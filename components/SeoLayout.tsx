import Head from "next/head";

export default function SeoLayout({ title, description, url, image }) {
  const siteName = "Спроси Врача";
  const defaultImage = "https://sprosi-vracha.com/og-preview.jpg";

  return (
    <Head>
      <title>{title ? `${title} — ${siteName}` : siteName}</title>
      <meta
        name="description"
        content={
          description ||
          "Спроси Врача — онлайн-консультации с врачами, разбор анализов и рекомендации."
        }
      />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url || "https://sprosi-vracha.com/"} />

      {/* OpenGraph / соцсети */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title || siteName} />
      <meta
        property="og:description"
        content={description || "Онлайн-консультации с врачами и экспертами"}
      />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={url || "https://sprosi-vracha.com/"} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteName} />
      <meta
        name="twitter:description"
        content={description || "Онлайн-консультации с врачами"}
      />
      <meta name="twitter:image" content={image || defaultImage} />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
