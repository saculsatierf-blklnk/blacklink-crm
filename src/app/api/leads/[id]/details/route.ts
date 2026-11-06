import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { leads, type CadenceState, type Lead } from "@/db/schema";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function handleUpdateLeadDetails(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await context.params;

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: "Identificador do lead ausente." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      company,
      contactPerson,
      email,
      phone,
      whatsapp,
      location,
      roleTitle,
      estimatedValue,
      website,
      leadName,
    } = body || {};

    let resolvedLeadName = leadName;
    if (!resolvedLeadName) {
      if (contactPerson && company) {
        resolvedLeadName = `${contactPerson} (${company})`;
      } else if (company) {
        resolvedLeadName = company;
      } else if (contactPerson) {
        resolvedLeadName = contactPerson;
      }
    }

    const cleanPhone = (whatsapp || phone || "").trim();

    // Fallback lead caso ID não seja UUID do banco
    const fallbackLead: Lead = {
      id: leadId,
      companyId: "cad1caea-2de8-46f3-8dd0-17ab0ede7377",
      leadName: resolvedLeadName || company || "Lead",
      leadEmail: email !== undefined ? email.trim() || null : null,
      leadPhone: cleanPhone || null,
      origin: "Kanban",
      status: "new",
      ownerId: "070af81b-047d-480a-8207-10d93b1a3c38",
      dealScore: 75,
      telemetryEvents: [],
      cadenceState: {
        completedSteps: [],
        roleTitle: roleTitle?.trim() || "",
        estimatedValue: estimatedValue?.trim() || "",
        website: website?.trim() || "",
        location: location?.trim() || "",
        companyName: company?.trim() || "",
        contactPerson: contactPerson?.trim() || "",
        phone: phone?.trim() || "",
        whatsapp: whatsapp?.trim() || cleanPhone || "",
      },
      notes: [],
      scriptVersion: "v1_direct",
      nextActivityDate: null,
      nextActivityType: null,
      createdAt: new Date(),
    };

    if (!UUID_REGEX.test(leadId)) {
      return NextResponse.json({ success: true, lead: fallbackLead });
    }

    // Busca o lead no PostgreSQL
    const [existing] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: true, lead: fallbackLead });
    }

    const currentCadence = (existing.cadenceState as CadenceState) || {
      completedSteps: [],
    };
    const updatedCadence: CadenceState = {
      ...currentCadence,
      roleTitle:
        roleTitle !== undefined ? roleTitle.trim() : currentCadence.roleTitle,
      estimatedValue:
        estimatedValue !== undefined
          ? estimatedValue.trim()
          : currentCadence.estimatedValue,
      website:
        website !== undefined ? website.trim() : currentCadence.website,
      location:
        location !== undefined ? location.trim() : currentCadence.location,
      companyName:
        company !== undefined ? company.trim() : currentCadence.companyName,
      contactPerson:
        contactPerson !== undefined
          ? contactPerson.trim()
          : currentCadence.contactPerson,
      phone: phone !== undefined ? phone.trim() : currentCadence.phone,
      whatsapp:
        whatsapp !== undefined ? whatsapp.trim() : currentCadence.whatsapp,
    };

    const updatePayload: Partial<typeof leads.$inferInsert> = {
      cadenceState: updatedCadence,
    };

    if (resolvedLeadName !== undefined && resolvedLeadName.trim()) {
      updatePayload.leadName = resolvedLeadName.trim();
    }
    if (email !== undefined) {
      updatePayload.leadEmail = email.trim() || null;
    }
    if (cleanPhone) {
      updatePayload.leadPhone = cleanPhone;
    }

    const [updated] = await db
      .update(leads)
      .set(updatePayload)
      .where(eq(leads.id, leadId))
      .returning();

    try {
      revalidatePath("/vendas");
      revalidatePath("/leads");
    } catch {}

    return NextResponse.json({
      success: true,
      lead: updated || fallbackLead,
    });
  } catch (error) {
    console.warn("Erro ao atualizar detalhes do lead via API:", error);
    return NextResponse.json(
      { success: false, error: "Falha interna ao salvar detalhes do lead." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdateLeadDetails(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdateLeadDetails(request, context);
}
