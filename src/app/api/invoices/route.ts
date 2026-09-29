import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { invoices } from "@/db/schema";
import { resolveTenantCompanyId } from "@/lib/auth/tenant";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Cobranças semente para demonstração executiva
const SEED_INVOICES = [
  {
    title: "Retainer Mensal: Gestão de Tráfego & IA Growth (Ciclo Anterior)",
    amount: "6500.00",
    dueDate: new Date(Date.now() - 86400000 * 25),
    paymentStatus: "paid" as const,
    paidAt: new Date(Date.now() - 86400000 * 24),
    invoicePdfUrl: "/uploads/invoices/exemplo-nf-001.pdf",
  },
  {
    title: "Setup & Automação: Pipeline Autônomo de Criativos Black Link",
    amount: "8900.00",
    dueDate: new Date(Date.now() - 86400000 * 15),
    paymentStatus: "paid" as const,
    paidAt: new Date(Date.now() - 86400000 * 14),
    invoicePdfUrl: "/uploads/invoices/exemplo-nf-002.pdf",
  },
  {
    title: "Retainer Mensal: Tráfego & Operação B2B - Ciclo Vigente",
    amount: "6500.00",
    dueDate: new Date(Date.now() + 86400000 * 5),
    paymentStatus: "pending" as const,
    paidAt: null,
    invoicePdfUrl: null,
  },
  {
    title: "Pacote de Criativos Manuais & Produção de Vídeos Q4",
    amount: "3400.00",
    dueDate: new Date(Date.now() + 86400000 * 12),
    paymentStatus: "pending" as const,
    paidAt: null,
    invoicePdfUrl: null,
  },
  {
    title: "Adicional: Licenciamento de Infraestrutura & Consumo de APIs",
    amount: "1850.00",
    dueDate: new Date(Date.now() - 86400000 * 3),
    paymentStatus: "overdue" as const,
    paidAt: null,
    invoicePdfUrl: null,
  },
];

/**
 * GET: Retorna faturas e resumo financeiro do tenant
 */
export async function GET() {
  try {
    const companyId = await resolveTenantCompanyId();

    let companyInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.companyId, companyId))
      .orderBy(desc(invoices.dueDate));

    // Se estiver vazio, popula as faturas iniciais para o tenant
    if (companyInvoices.length === 0) {
      const inserts = SEED_INVOICES.map((inv) => ({
        companyId,
        title: inv.title,
        amount: inv.amount,
        dueDate: inv.dueDate,
        paymentStatus: inv.paymentStatus,
        paidAt: inv.paidAt,
        invoicePdfUrl: inv.invoicePdfUrl,
      }));

      await db.insert(invoices).values(inserts);

      companyInvoices = await db
        .select()
        .from(invoices)
        .where(eq(invoices.companyId, companyId))
        .orderBy(desc(invoices.dueDate));
    }

    // Calcula KPIs consolidados
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    let totalMRR = 0;

    companyInvoices.forEach((inv) => {
      const val = parseFloat(inv.amount) || 0;
      totalMRR += val;

      if (inv.paymentStatus === "paid") {
        totalPaid += val;
      } else if (inv.paymentStatus === "pending") {
        totalPending += val;
      } else if (inv.paymentStatus === "overdue") {
        totalOverdue += val;
      }
    });

    return NextResponse.json({
      success: true,
      invoices: companyInvoices,
      metrics: {
        totalMRR,
        totalPaid,
        totalPending,
        totalOverdue,
        totalCount: companyInvoices.length,
      },
    });
  } catch (error: any) {
    console.error("Erro ao listar cobranças:", error);
    return NextResponse.json(
      { error: "Falha ao carregar faturamento.", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Cria uma nova cobrança/fatura
 */
export async function POST(request: NextRequest) {
  try {
    const companyId = await resolveTenantCompanyId();
    const body = await request.json();

    const { title, amount, dueDate, paymentStatus, invoicePdfUrl } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Título do serviço é obrigatório." }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: "Valor da cobrança deve ser maior que zero." }, { status: 400 });
    }

    if (!dueDate) {
      return NextResponse.json({ error: "Data de vencimento é obrigatória." }, { status: 400 });
    }

    const validStatuses = ["pending", "paid", "overdue"];
    const status = validStatuses.includes(paymentStatus) ? paymentStatus : "pending";

    const inserted = await db
      .insert(invoices)
      .values({
        companyId,
        title: title.trim(),
        amount: numAmount.toFixed(2),
        dueDate: new Date(dueDate),
        paymentStatus: status as any,
        invoicePdfUrl: invoicePdfUrl || null,
        paidAt: status === "paid" ? new Date() : null,
      })
      .returning();

    return NextResponse.json({ success: true, invoice: inserted[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar cobrança:", error);
    return NextResponse.json(
      { error: "Falha ao criar cobrança.", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Atualiza status ou anexo de uma fatura
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, paymentStatus, invoicePdfUrl, title, amount, dueDate } = body;

    if (!id) {
      return NextResponse.json({ error: "ID da cobrança é obrigatório." }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};

    if (paymentStatus !== undefined) {
      const validStatuses = ["pending", "paid", "overdue"];
      if (!validStatuses.includes(paymentStatus)) {
        return NextResponse.json({ error: "Status inválido." }, { status: 400 });
      }
      updatePayload.paymentStatus = paymentStatus;
      if (paymentStatus === "paid") {
        updatePayload.paidAt = new Date();
      } else {
        updatePayload.paidAt = null;
      }
    }

    if (invoicePdfUrl !== undefined) updatePayload.invoicePdfUrl = invoicePdfUrl;
    if (title !== undefined) updatePayload.title = title.trim();
    if (amount !== undefined) updatePayload.amount = parseFloat(amount).toFixed(2);
    if (dueDate !== undefined) updatePayload.dueDate = new Date(dueDate);

    const updated = await db
      .update(invoices)
      .set(updatePayload)
      .where(eq(invoices.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Cobrança não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ success: true, invoice: updated[0] });
  } catch (error: any) {
    console.error("Erro ao atualizar cobrança:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar cobrança.", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove uma fatura
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID da cobrança é obrigatório." }, { status: 400 });
    }

    await db.delete(invoices).where(eq(invoices.id, id));

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Erro ao excluir fatura:", error);
    return NextResponse.json(
      { error: "Falha ao excluir fatura.", details: error.message },
      { status: 500 }
    );
  }
}
