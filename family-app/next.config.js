/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    BASE_URL: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
  },
  // התצורה תלויה בסביבה
  basePath: process.env.VERCEL_ENV === 'production' ? '' : '',
  assetPrefix: process.env.VERCEL_ENV === 'production' ? '' : '',
  // מאפשר גישה מכל מקור (CORS)
  async headers() {
    return [
      {
        // גישה מכל המקורות
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  // הגדרת rewrites לטיפול בניתובים
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // מאפשר גישה מכל דומיין
  crossOrigin: 'anonymous',
  // תיקון בעיות תאימות והפניות
  trailingSlash: false,
  // שימוש ב-distDir רגיל עבור Vercel
  distDir: '.next',
  compiler: {
    // שימוש ב-emotion עם react
    emotion: true,
  }
};
module.exports = nextConfig;