import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// מסלולים שלא דורשים אימות
const publicPaths = ['/', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
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
    '/((?!api/|_next/|_static/|_vercel/|favicon.ico|robots.txt).*)',
  ],
}; 