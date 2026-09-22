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
