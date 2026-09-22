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

  // Se houver sessão ativa, resolve o perfil (RBAC)
  if (sessionToken) {
    let userRole = "admin";
    try {
      const decoded = JSON.parse(
        Buffer.from(sessionToken, "base64url").toString("utf-8")
      );
      if (decoded.role) {
        userRole = decoded.role;
      }
    } catch {
      // Sessão malformada: remove cookie e envia para login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("blacklink_session");
      return response;
    }

    // Redireciona usuários já autenticados tentando acessar o login
    if (isAuthRoute) {
      const target = userRole === "commercial" ? "/leads" : "/";
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Barreira de Isolamento RBAC para perfil Comercial
    if (userRole === "commercial") {
      const isLeadsRoute = pathname === "/leads" || pathname.startsWith("/leads/");
      if (!isLeadsRoute) {
        // Redirecionamento compulsório com status 307 direto para o pipeline de leads
        return NextResponse.redirect(new URL("/leads", request.url), 307);
      }
    }
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
