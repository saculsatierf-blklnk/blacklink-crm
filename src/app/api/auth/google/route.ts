import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Inicia o fluxo oficial de autorização do Google OAuth 2.0 (Pop-up Google)
 */
export async function GET(request: NextRequest) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return NextResponse.json(
      {
        error:
          "GOOGLE_CLIENT_ID não configurado. Por favor, adicione as credenciais GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET nas configurações de ambiente.",
      },
      { status: 500 }
    );
  }

  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost:3000";
  const isHttps =
    request.headers.get("x-forwarded-proto") === "https" ||
    !host.includes("localhost");
  const protocol = isHttps ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(googleAuthUrl);
}
