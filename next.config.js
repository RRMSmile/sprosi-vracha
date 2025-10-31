/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',              // Включает статический экспорт
  images: {
    unoptimized: true            // Отключает оптимизацию картинок (иначе ошибка при экспорте)
  },
  trailingSlash: true            // Чтобы все пути имели '/' и корректно открывались через Nginx
}

export default nextConfig

