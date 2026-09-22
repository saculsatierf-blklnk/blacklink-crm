import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { db } from "@/db";
import {
  leads,
  dealTelemetryEmbeddings,
  type NoteEntry,
  type TelemetryEvent,
} from "@/db/schema";
import { calculateDealScore, resolveNextBestAction } from "@/lib/predictive";
import { broadcastDealEvent } from "@/lib/deal-stream";
import { parseLeadInfo } from "@/lib/cadence";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Gera um embedding normalizado de 1536 dimensões compatível com pgvector
 */
async function generateEmbedding1536(textToEmbed: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.startsWith("sk-")) {
    try {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: textToEmbed.slice(0, 8000),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const vector = data?.data?.[0]?.embedding;
        if (Array.isArray(vector) && vector.length === 1536) {
          return vector;
        }
      }
    } catch (e) {
      console.warn("Falha ao consultar OpenAI Embeddings, utilizando projeção local 1536d:", e);
    }
  }

  // Projeção semântica determinística normalizada em 1536 dimensões (L2 Normalized)
  const dimensions = 1536;
  const vector: number[] = new Array(dimensions).fill(0);
  const words = textToEmbed.toLowerCase().split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const hash = crypto.createHash("sha256").update(word).digest();
    for (let j = 0; j < 8; j++) {
      const idx = (hash.readUInt16BE(j * 2) + i * 17) % dimensions;
      const weight = (hash.readInt8(j) / 128.0) * (1 / (i + 1) ** 0.5);
      vector[idx] += weight;
    }
  }

  // Normalização Euclidiana (L2 Norm)
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1.0;
  return vector.map((v) => Number((v / norm).toFixed(6)));
}

/**
 * Extrator NLP heurístico de Objeções e Próximos Passos
 */
function extractInsightsFromTranscript(transcript: string): {
  objection: string;
  nextSteps: string;
  sentiment: "positive" | "neutral" | "concerned";
  scoreDelta: number;
} {
  const lower = transcript.toLowerCase();

  let objection = "Aprovação orçamentária do CFO";
  let nextSteps = "Apresentar sumário executivo com cálculo de payback em 60 dias.";
  let sentiment: "positive" | "neutral" | "concerned" = "neutral";
  let scoreDelta = 0;

  if (
    lower.includes("preço") ||
    lower.includes("caro") ||
    lower.includes("orçamento") ||
    lower.includes("budget") ||
    lower.includes("cfo")
  ) {
    objection = "Alinhamento de verba/budget com diretoria financeira";
    sentiment = "concerned";
  } else if (
    lower.includes("tempo") ||
    lower.includes("prioridade") ||
    lower.includes("prazo") ||
    lower.includes("implementar")
  ) {
    objection = "Capacidade interna de implementação e cronograma técnico";
    sentiment = "concerned";
  } else if (lower.includes("segurança") || lower.includes("lgpd") || lower.includes("compliance")) {
    objection = "Validação de conformidade técnica e compliance de dados";
    sentiment = "concerned";
  }

  if (
    lower.includes("fechar") ||
    lower.includes("contrato") ||
    lower.includes("vamos avançar") ||
    lower.includes("aprovado") ||
    lower.includes("gostei")
  ) {
    nextSteps = "Envio da minuta de contrato para assinatura eletrônica e agendamento de kick-off.";
    sentiment = "positive";
    scoreDelta = 15; // Impulso positivo
  } else if (lower.includes("apresentar") || lower.includes("reunião") || lower.includes("alinhamento")) {
    nextSteps = "Reunião de alinhamento com stakeholders técnicos e decisores executivos.";
    scoreDelta = 5;
  } else {
    nextSteps = "Follow-up executivo via canal direto para validação de cronograma.";
    scoreDelta = -5;
  }

  return { objection, nextSteps, sentiment, scoreDelta };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await context.params;

    if (!leadId || !UUID_REGEX.test(leadId)) {
      return NextResponse.json(
        { error: "Identificador de lead inválido. Deve ser um UUID padrão." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const transcript = body?.transcript as string;
    const source = (body?.source as string) || "VoIP / Gravação de Reunião";

    if (!transcript || transcript.trim().length < 10) {
      return NextResponse.json(
        { error: "Transcrição inválida ou muito curta (mínimo de 10 caracteres)." },
        { status: 400 }
      );
    }

    // 1. Busca o lead no Supabase
    const [lead] = await db
      .select({
        id: leads.id,
        leadName: leads.leadName,
        dealScore: leads.dealScore,
        notes: leads.notes,
        telemetryEvents: leads.telemetryEvents,
      })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    }

    // 2. Extração NLP de Objeções e Próximos Passos
    const customObjection = body?.detectedObjection as string | undefined;
    const customNextSteps = body?.nextSteps as string | undefined;

    const insights = extractInsightsFromTranscript(transcript);
    const objection = customObjection || insights.objection;
    const nextSteps = customNextSteps || insights.nextSteps;

    // 3. Geração do vetor de embedding de 1536 dimensões
    const embedding = await generateEmbedding1536(
      `Objeção: ${objection}\nPróximos Passos: ${nextSteps}\nTranscrição: ${transcript}`
    );

    // 4. Persistência na tabela vetorial deal_telemetry_embeddings (pgvector)
    const [insertedEmbedding] = await db
      .insert(dealTelemetryEmbeddings)
      .values({
        leadId: lead.id,
        contentType: "call_transcript",
        rawContent: transcript,
        embedding,
        metadata: {
          source,
          objection,
          nextSteps,
          sentiment: insights.sentiment,
          scoreDelta: insights.scoreDelta,
          processedAt: new Date().toISOString(),
        },
      })
      .returning();

    // 5. Registro de nota estruturada no histórico de leads
    const nlpNote: NoteEntry = {
      id: "nlp-" + Date.now(),
      text: `[Transcrição NLP Analisada]\n• Objeção Identificada: ${objection}\n• Próximos Passos: ${nextSteps}\n• Fonte: ${source}`,
      createdAt: new Date().toISOString(),
      author: "Motor de Telemetria NLP",
    };

    const updatedNotes = [nlpNote, ...(lead.notes || [])];

    // 6. Atualização ponderada do Deal Momentum
    const telemetryEvent: TelemetryEvent = {
      type: "nlp_call_analyzed",
      weight: insights.scoreDelta,
      timestamp: new Date().toISOString(),
      details: `Chamada processada via NLP. Objeção: "${objection}".`,
    };

    const updatedEvents = [telemetryEvent, ...(lead.telemetryEvents || [])];
    const newScore = calculateDealScore(updatedEvents, lead.dealScore);

    // 7. Atualização no banco
    const [updatedLead] = await db
      .update(leads)
      .set({
        notes: updatedNotes,
        dealScore: newScore,
        telemetryEvents: updatedEvents,
      })
      .where(eq(leads.id, leadId))
      .returning();

    // 8. Resolução da Matriz NBA
    const parsed = parseLeadInfo(lead.leadName);
    const nba = resolveNextBestAction(newScore, {
      name: parsed.name,
      company: parsed.company,
      latestObjection: objection,
    });

    // 9. Broadcast em tempo real para o streaming
    broadcastDealEvent({
      type: "nlp_objection",
      leadId: lead.id,
      leadName: parsed.name,
      company: parsed.company,
      score: newScore,
      delta: insights.scoreDelta,
      triggerType: "nlp_call_analyzed",
      triggerLabel: `Objeção NLP: ${objection}`,
      command: nba.command,
      zone: nba.zone,
      details: nextSteps,
    });

    return NextResponse.json({
      success: true,
      message: "Transcrição processada, vetorizada e indexada no pgvector.",
      embeddingId: insertedEmbedding?.id,
      insights: {
        objection,
        nextSteps,
        sentiment: insights.sentiment,
        dimensions: embedding.length,
      },
      newScore,
      nba,
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Erro na rota POST /api/leads/[id]/nlp-transcript:", error);
    return NextResponse.json(
      {
        error: "Falha ao processar transcrição NLP.",
        details: error instanceof Error ? error.message : "Erro interno.",
      },
      { status: 500 }
    );
  }
}
