import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("blacklink_session")?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname === "/login";
  const isApiRoute = pathname.startsWith("/api");

  // Permite tráfego direto para rotas de API e Webhooks externos (ex: n8n)
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redireciona usuários não autenticados para o login
  if (!sessionToken && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Redireciona usuários já autenticados para a visão geral
  if (sessionToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Intercepta rotas da aplicação, ignorando arquivos estáticos e assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
