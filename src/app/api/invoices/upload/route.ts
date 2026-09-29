import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { invoices } from "@/db/schema";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Endpoint de upload de Nota Fiscal (PDF) para uma cobrança
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const invoiceId = formData.get("invoiceId") as string;
    const file = formData.get("file") as File | null;

    if (!invoiceId) {
      return NextResponse.json({ error: "ID da cobrança é obrigatório." }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "Arquivo PDF não enviado." }, { status: 400 });
    }

    // Garante que o diretório de destino existe
    const uploadDir = join(process.cwd(), "public", "uploads", "invoices");
    await mkdir(uploadDir, { recursive: true });

    // Gera nome de arquivo higienizado
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `nf_${timestamp}_${originalName}`;
    const filePath = join(uploadDir, filename);

    // Salva o arquivo no disco
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const invoicePdfUrl = `/uploads/invoices/${filename}`;

    // Atualiza a fatura no banco
    const updated = await db
      .update(invoices)
      .set({ invoicePdfUrl })
      .where(eq(invoices.id, invoiceId))
      .returning();

    return NextResponse.json({
      success: true,
      invoicePdfUrl,
      invoice: updated[0] || null,
    });
  } catch (error: any) {
    console.error("Erro no upload de Nota Fiscal:", error);
    return NextResponse.json(
      { error: "Falha ao processar upload do comprovante de Nota Fiscal.", details: error.message },
      { status: 500 }
    );
  }
}
