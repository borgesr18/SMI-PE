/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['openweathermap.org', 'cdn.star.nesdis.noaa.gov'],
  },
}

module.exports = nextConfig
