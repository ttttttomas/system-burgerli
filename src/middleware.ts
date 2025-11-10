import {NextRequest, NextResponse} from "next/server";
import {NextMiddleware} from "next/server";

const middleware: NextMiddleware = (req: NextRequest) => {
  const authorizationCookie = req.cookies.get("Authorization")?.value;

  const {pathname} = req.nextUrl;

  // Rutas que requieren autenticación
  const protectedRoutes = ["/orders", "/pedidos", "/admin"];

  function isProtectedPath(pathname: string) {
    return protectedRoutes.some((p) => pathname.startsWith(p));
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }
  if (authorizationCookie) {
    return NextResponse.next();
  }

  const url = new URL("/login", req.url);

  return NextResponse.redirect(url);
};

// Configurar qué rutas debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export default middleware;
