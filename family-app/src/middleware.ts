import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// מסלולים שלא דורשים אימות
const publicPaths = ['/', '/api/auth', '/register', '/forgot-password'];

// קבצים סטטיים שצריך לאפשר גישה אליהם תמיד
const staticPaths = [
  '/favicon.ico',
  '/robots.txt',
  '/_next',
  '/images',
  '/assets',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // בודק אם זה קובץ סטטי
  const isStaticFile = staticPaths.some(path => pathname.startsWith(path));
  if (isStaticFile) {
    return NextResponse.next();
  }
  
  // בודק אם המסלול הוא ציבורי
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith('/api/auth')
  );

  // אם זה API או דף ציבורי, מאפשר גישה
  if (isPublicPath) {
    return NextResponse.next();
  }

  // בסביבה אמיתית יש לבדוק אימות על בסיס טוקן או עוגיה
  // כאן אנחנו פשוט מאפשרים גישה לכולם לצורך הדגמה
  return NextResponse.next();
}

// רק בודק מסלולים אלה
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internal routes)
     * 3. /_static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /robots.txt (static files)
     */
    '/((?!_next/|_static/|_vercel/|favicon.ico|robots.txt).*)',
  ],
}; 