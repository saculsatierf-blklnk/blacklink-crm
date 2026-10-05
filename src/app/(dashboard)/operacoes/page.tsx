import { OperationsKanbanBoard } from "@/components/operacao/OperationsKanbanBoard";

export const metadata = {
  title: "Operações & Prazos • Black Link CRM Enterprise",
  description: "Gestão executiva de prazos, refações e fluxo operacional de entregas com badges de alta visibilidade.",
};

export default function OperacoesPage() {
  return (
    <div className="space-y-6">
      <OperationsKanbanBoard />
    </div>
  );
}
