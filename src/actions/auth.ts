"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
export type { LoginFormValues };

export interface AuthActionResult {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  values: LoginFormValues
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Dados de acesso inválidos.",
    };
  }

  const { email } = parsed.data;

  // Mock de sessão corporativa aprovada
  const sessionPayload = {
    id: "u-9e8a7b6c-5d4e-3f2a-1b0c-9d8e7f6a5b4c",
    company_id: "c-0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
    role: "admin",
    name: "Operador Black Link Enterprise",
    email: email.toLowerCase().trim(),
    createdAt: new Date().toISOString(),
  };

  const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString("base64url");

  // Configuração do cookie seguro (Next.js 16 async cookies)
  const cookieStore = await cookies();
  cookieStore.set("blacklink_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  // Redirecionamento nativo do Next.js para a rota inicial
  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("blacklink_session");
  redirect("/login");
}
