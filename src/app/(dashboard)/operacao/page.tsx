import { OperationsKanbanBoard } from "@/components/operacao/OperationsKanbanBoard";

export const metadata = {
  title: "Operação & Prazos • Black Link CRM",
  description: "Gestão de prazos, refações e fluxo operacional de entregas de agência.",
};

export default function OperacaoPage() {
  return (
    <div className="space-y-6">
      <OperationsKanbanBoard />
    </div>
  );
}
