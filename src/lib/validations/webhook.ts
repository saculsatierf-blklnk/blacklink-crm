import { z } from "zod";

export const webhookLeadSchema = z.object({
  companyId: z
    .string()
    .uuid("O identificador da organização (companyId) deve ser um UUID válido."),
  leadName: z
    .string()
    .min(1, "O nome do lead corporativo é obrigatório."),
  leadEmail: z
    .string()
    .email("Endereço de e-mail corporativo inválido.")
    .optional()
    .or(z.literal("")),
  leadPhone: z
    .string()
    .optional()
    .or(z.literal("")),
  origin: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type WebhookLeadPayload = z.infer<typeof webhookLeadSchema>;
