import { ConfiguracoesClientView } from "@/components/configuracoes/ConfiguracoesClientView";

export const metadata = {
  title: "Governança & Configurações • Black Link CRM Enterprise",
  description: "Painel de governança corporativa, Brand Memory da IA, permissões de equipe (RBAC) e status de integrações.",
};

export default function ConfiguracoesPage() {
  return <ConfiguracoesClientView />;
}
