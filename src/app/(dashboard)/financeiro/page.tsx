import { BillingManagementView } from "@/components/faturamento/BillingManagementView";

export const metadata = {
  title: "Gestão Financeira & Contratos • Black Link CRM Enterprise",
  description: "Controle executivo de contratos, faturas B2B, retainers mensais e notas fiscais com data-grid de alta densidade.",
};

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <BillingManagementView />
    </div>
  );
}
