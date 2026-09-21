"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { leads } from "@/db/schema";

export type LeadStatus = "new" | "negotiation" | "closed";

export interface UpdateLeadStatusResult {
  success: boolean;
  leadId: string;
  newStatus: LeadStatus;
  error?: string;
}

export async function updateLeadStatusAction(
  leadId: string,
  newStatus: LeadStatus
): Promise<UpdateLeadStatusResult> {
  try {
    if (!leadId) {
      return {
        success: false,
        leadId,
        newStatus,
        error: "Identificador do lead ausente.",
      };
    }

    const validStatuses: LeadStatus[] = ["new", "negotiation", "closed"];
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        leadId,
        newStatus,
        error: "Status de lead inválido.",
      };
    }

    await db
      .update(leads)
      .set({ status: newStatus })
      .where(eq(leads.id, leadId));

    try {
      revalidatePath("/leads");
    } catch {
      // Ignorado se invocado fora do contexto de requisição HTTP ativa do Next.js
    }

    return {
      success: true,
      leadId,
      newStatus,
    };
  } catch (error) {
    console.error("Falha ao atualizar status do lead no banco:", error);
    return {
      success: false,
      leadId,
      newStatus,
      error:
        error instanceof Error
          ? error.message
          : "Erro interno ao persistir novo status do lead.",
    };
  }
}
