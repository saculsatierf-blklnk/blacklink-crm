import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail corporativo é obrigatório.")
    .email("Insira um endereço de e-mail corporativo válido."),
  password: z
    .string()
    .min(6, "A credencial de acesso deve conter ao menos 6 caracteres."),
  role: z.enum(["admin", "commercial"]).optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerCompanySchema = z.object({
  companyName: z
    .string()
    .min(2, "O nome da empresa ou organização deve ter pelo menos 2 caracteres."),
  fullName: z
    .string()
    .min(2, "O nome completo do administrador é obrigatório."),
  email: z
    .string()
    .min(1, "O e-mail corporativo é obrigatório.")
    .email("Insira um endereço de e-mail corporativo válido."),
  password: z
    .string()
    .min(6, "A chave de acesso deve conter ao menos 6 caracteres."),
});

export type RegisterCompanyFormValues = z.infer<typeof registerCompanySchema>;

export const createTeamMemberSchema = z.object({
  fullName: z
    .string()
    .min(2, "O nome do operador é obrigatório."),
  email: z
    .string()
    .min(1, "O e-mail corporativo é obrigatório.")
    .email("Insira um endereço de e-mail corporativo válido."),
  password: z
    .string()
    .min(6, "A credencial inicial deve conter ao menos 6 caracteres."),
  role: z.enum(["admin", "commercial"]),
});

export type CreateTeamMemberFormValues = z.infer<typeof createTeamMemberSchema>;
