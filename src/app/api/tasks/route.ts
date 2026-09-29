import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { tasks } from "@/db/schema";
import { resolveTenantCompanyId } from "@/lib/auth/tenant";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Tarefas semente para inicialização de esteiras de agência
const SEED_TASKS = [
  {
    title: "Briefing: Campanha de Aquisição B2B Q4",
    description: "Alinhamento com cliente dos diferenciais da plataforma SaaS e objetivos de captação de leads qualificados.",
    assigneeName: "Lucas Mendes • Estrategista",
    priority: "high",
    status: "backlog" as const,
    dueDate: new Date(Date.now() + 86400000 * 2), // daqui a 2 dias
  },
  {
    title: "Criação de Copy & Roteiro de Carrossel de Alto Impacto",
    description: "Redação persuasiva de 7 lâminas abordando dores de automação de tráfego e gatilhos de prova social.",
    assigneeName: "Beatriz Lima • Copywriter",
    priority: "urgent",
    status: "in_production" as const,
    dueDate: new Date(Date.now() + 86400000 * 1), // amanhã
  },
  {
    title: "Design Gráfico & Diagramação dos Slides 1080x1350",
    description: "Exportação em alta fidelidade no Figma seguindo o Design System Dark Industrial da marca.",
    assigneeName: "Felipe Santos • Designer",
    priority: "high",
    status: "in_production" as const,
    dueDate: new Date(Date.now() + 86400000 * 2),
  },
  {
    title: "Revisão Interna de Compliance & Diretrizes Meta",
    description: "Checagem de texto nas lâminas, contraste e conformidade com as políticas de anúncios do Meta Graph.",
    assigneeName: "Mariana Costa • QA & Operações",
    priority: "medium",
    status: "internal_review" as const,
    dueDate: new Date(Date.now() + 86400000 * 3),
  },
  {
    title: "Validação Final com Decisor do Cliente",
    description: "Apresentação da esteira de criativos e cronograma semanal de veiculação para aceite executivo.",
    assigneeName: "Lucas Mendes • Head de Contas",
    priority: "urgent",
    status: "awaiting_client" as const,
    dueDate: new Date(Date.now() + 86400000 * 1),
  },
  {
    title: "Deploy de Criativos & Ativação de Tráfego",
    description: "Submissão de criativos manuais e IA na esteira Meta Ads e publicação nos canais oficiais.",
    assigneeName: "Equipe Black Link",
    priority: "low",
    status: "done" as const,
    dueDate: new Date(Date.now() - 86400000 * 1),
  },
];

/**
 * GET: Retorna as tarefas da empresa ativa (ou inicializa a esteira padrão se vazia)
 */
export async function GET() {
  try {
    const companyId = await resolveTenantCompanyId();

    let companyTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.companyId, companyId))
      .orderBy(desc(tasks.createdAt));

    // Se não houver tarefas no tenant, inicializa com a esteira padrão
    if (companyTasks.length === 0) {
      const inserts = SEED_TASKS.map((st) => ({
        companyId,
        title: st.title,
        description: st.description,
        assigneeName: st.assigneeName,
        priority: st.priority,
        status: st.status,
        dueDate: st.dueDate,
      }));

      await db.insert(tasks).values(inserts);

      companyTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.companyId, companyId))
        .orderBy(desc(tasks.createdAt));
    }

    return NextResponse.json({ success: true, tasks: companyTasks });
  } catch (error: any) {
    console.error("Erro ao listar tarefas da operação:", error);
    return NextResponse.json(
      { error: "Falha interna ao carregar tarefas da operação.", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Cria uma nova tarefa na esteira Kanban
 */
export async function POST(request: NextRequest) {
  try {
    const companyId = await resolveTenantCompanyId();
    const body = await request.json();

    const { title, description, assigneeName, priority, status, dueDate } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "O título da tarefa é obrigatório." },
        { status: 400 }
      );
    }

    const validStatuses = ["backlog", "in_production", "internal_review", "awaiting_client", "done"];
    const taskStatus = validStatuses.includes(status) ? status : "backlog";

    const inserted = await db
      .insert(tasks)
      .values({
        companyId,
        title: title.trim(),
        description: description?.trim() || "",
        assigneeName: assigneeName?.trim() || "Equipe Black Link",
        priority: priority || "medium",
        status: taskStatus,
        dueDate: dueDate ? new Date(dueDate) : null,
      })
      .returning();

    return NextResponse.json({ success: true, task: inserted[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar tarefa:", error);
    return NextResponse.json(
      { error: "Falha ao criar tarefa na operação.", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Atualiza o status ou dados de uma tarefa existente
 */
export async function PATCH(request: NextRequest) {
  try {
    const companyId = await resolveTenantCompanyId();
    const body = await request.json();

    const { id, status, title, description, priority, assigneeName, dueDate } = body;

    if (!id) {
      return NextResponse.json({ error: "ID da tarefa é obrigatório." }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};

    if (status !== undefined) {
      const validStatuses = ["backlog", "in_production", "internal_review", "awaiting_client", "done"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Status de tarefa inválido." }, { status: 400 });
      }
      updatePayload.status = status;
    }

    if (title !== undefined) updatePayload.title = title.trim();
    if (description !== undefined) updatePayload.description = description.trim();
    if (priority !== undefined) updatePayload.priority = priority;
    if (assigneeName !== undefined) updatePayload.assigneeName = assigneeName.trim();
    if (dueDate !== undefined) updatePayload.dueDate = dueDate ? new Date(dueDate) : null;

    const updated = await db
      .update(tasks)
      .set(updatePayload)
      .where(eq(tasks.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Tarefa não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: updated[0] });
  } catch (error: any) {
    console.error("Erro ao atualizar tarefa:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar tarefa.", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove uma tarefa da esteira
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID da tarefa é obrigatório." }, { status: 400 });
    }

    await db.delete(tasks).where(eq(tasks.id, id));

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Erro ao remover tarefa:", error);
    return NextResponse.json(
      { error: "Falha ao remover tarefa.", details: error.message },
      { status: 500 }
    );
  }
}
