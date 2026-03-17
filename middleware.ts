import { NextRequest, NextResponse } from "next/server";
import { verify } from 'jsonwebtoken';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    const publicPaths = ['/login', '/register'];

    if(!token && !publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
};

export const config = {
  matcher: [
    /*
     * Все маршруты, кроме:
     * - _next/static (статические файлы)
     * - _next/image (оптимизация изображений)
     * - favicon.ico
     * - api (опционально, если не хотите защищать API)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};