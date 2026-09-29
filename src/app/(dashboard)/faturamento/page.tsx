import { BillingManagementView } from "@/components/faturamento/BillingManagementView";

export const metadata = {
  title: "Faturamento & Contratos • Black Link CRM",
  description: "Controle financeiro executivo, retainers mensais, gestão de cobranças e Notas Fiscais.",
};

export default function FaturamentoPage() {
  return (
    <div className="space-y-6">
      <BillingManagementView />
    </div>
  );
}
