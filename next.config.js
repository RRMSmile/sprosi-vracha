/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 👈 статическая сборка вместо next export
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true
};

module.exports = nextConfig;

