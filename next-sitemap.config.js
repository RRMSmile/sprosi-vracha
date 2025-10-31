/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://sprosi-vracha.com",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.8,
  sitemapSize: 7000,
  exclude: ["/api/*", "/admin/*"],
  robotsTxtOptions: {
    additionalSitemaps: [
      "https://sprosi-vracha.com/sitemap-0.xml",
    ],
  },
};
