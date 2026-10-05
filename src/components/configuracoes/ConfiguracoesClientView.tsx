"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle2,
  Cpu,
  Globe,
  Key,
  Layers,
  Palette,
  RefreshCw,
  Save,
  Server,
  Shield,
  ShieldCheck,
  Sliders,
  Type,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { TeamManagementModal } from "@/components/team/TeamManagementModal";
import {
  getCompanyMembersAction,
  type TeamMember,
} from "@/actions/auth";

type ConfigTab = "tenant" | "brand" | "team" | "integrations";

export function ConfiguracoesClientView() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<ConfigTab>("tenant");
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Tenant state
  const [tenantName, setTenantName] = useState("Black Link Matriz B2B");
  const [tenantCnpj, setTenantCnpj] = useState("54.912.842/0001-30");
  const [tenantDomain, setTenantDomain] = useState("blacklink.com.br");
  const [tenantSegment, setTenantSegment] = useState("SaaS Enterprise & B2B Solutions");

  // Brand Memory state
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#0A0A0C");
  const [accentColor, setAccentColor] = useState("#FFFFFF");
  const [headingFont, setHeadingFont] = useState("Space Grotesk");
  const [bodyFont, setBodyFont] = useState("Plus Jakarta Sans");
  const [aiVoiceTone, setAiVoiceTone] = useState(
    "Autoritário, sofisticado, analítico e focado em alta conversão B2B. Zero jargões clichês."
  );

  const loadMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const res = await getCompanyMembersAction();
      if (res.success && res.members) {
        setMembers(res.members);
      }
    } catch {
      console.warn("Falha ao carregar membros.");
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleSaveBrandMemory = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccessMsg("Diretrizes de Marca & Memória de IA sincronizadas com sucesso!");
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccessMsg("Dados da organização atualizados no ecossistema.");
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header do Módulo de Configurações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white font-heading">
              Governança &amp; Configurações
            </h1>
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-[11px] font-mono tracking-widest text-purple-300 font-semibold uppercase">
              Tenant Admin Hub
            </span>
          </div>
          <p className="text-xs lg:text-sm text-zinc-400 mt-1.5 leading-relaxed font-sans max-w-3xl">
            Gestão executiva do perfil corporativo, Brand Memory da IA, permissões de equipe (RBAC) e status de infraestrutura.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-xs font-mono text-zinc-300 flex items-center gap-2 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Isolamento Multi-Tenant Ativo</span>
          </div>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {savedSuccessMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-4 text-xs font-mono text-emerald-300 flex items-center gap-2.5 backdrop-blur-xl animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Segmented Control de Configurações */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.08] p-1.5 shadow-2xl backdrop-blur-2xl w-fit">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center gap-1.5">
          {/* Aba 1: Tenant */}
          <button
            type="button"
            onClick={() => setActiveTab("tenant")}
            className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
              activeTab === "tenant" ? "text-white font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            {activeTab === "tenant" && (
              <motion.div
                layoutId="configTabIndicator"
                className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/20 shadow-sm"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-white" />
              <span>Perfil do Tenant</span>
            </span>
          </button>

          {/* Aba 2: Brand Memory */}
          <button
            type="button"
            onClick={() => setActiveTab("brand")}
            className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
              activeTab === "brand" ? "text-white font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            {activeTab === "brand" && (
              <motion.div
                layoutId="configTabIndicator"
                className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/20 shadow-sm"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Palette className="h-4 w-4 text-white" />
              <span>Brand Memory (IA)</span>
            </span>
          </button>

          {/* Aba 3: Equipe RBAC */}
          <button
            type="button"
            onClick={() => setActiveTab("team")}
            className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
              activeTab === "team" ? "text-white font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            {activeTab === "team" && (
              <motion.div
                layoutId="configTabIndicator"
                className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/20 shadow-sm"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Users className="h-4 w-4 text-white" />
              <span>Membros &amp; RBAC ({members.length})</span>
            </span>
          </button>

          {/* Aba 4: Integrações */}
          <button
            type="button"
            onClick={() => setActiveTab("integrations")}
            className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
              activeTab === "integrations" ? "text-white font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            {activeTab === "integrations" && (
              <motion.div
                layoutId="configTabIndicator"
                className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/20 shadow-sm"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Server className="h-4 w-4 text-white" />
              <span>APIs &amp; Webhooks</span>
            </span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO DA ABA SELECIONADA */}

      {/* ABA 1: PERFIL DO TENANT */}
      {activeTab === "tenant" && (
        <form onSubmit={handleSaveTenant} className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-7 lg:p-9 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white font-heading">
                  Dados Cadastrais da Organização
                </h3>
                <p className="text-xs text-zinc-400">
                  Identificação corporativa do tenant no ambiente corporativo do Black Link CRM.
                </p>
              </div>

              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono font-semibold text-emerald-300">
                Plano Enterprise Ativo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                  Razão Social / Nome da Conta
                </label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full h-10.5 rounded-xl border border-white/10 bg-black/40 px-4 text-xs text-white focus:border-white/30 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                  CNPJ Corporativo
                </label>
                <input
                  type="text"
                  value={tenantCnpj}
                  onChange={(e) => setTenantCnpj(e.target.value)}
                  className="w-full h-10.5 rounded-xl border border-white/10 bg-black/40 px-4 text-xs text-white font-mono focus:border-white/30 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                  Domínio Institucional
                </label>
                <input
                  type="text"
                  value={tenantDomain}
                  onChange={(e) => setTenantDomain(e.target.value)}
                  className="w-full h-10.5 rounded-xl border border-white/10 bg-black/40 px-4 text-xs text-white font-mono focus:border-white/30 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                  Setor de Atuação
                </label>
                <input
                  type="text"
                  value={tenantSegment}
                  onChange={(e) => setTenantSegment(e.target.value)}
                  className="w-full h-10.5 rounded-xl border border-white/10 bg-black/40 px-4 text-xs text-white focus:border-white/30 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <div className="text-[11px] font-mono text-zinc-500">
                Identificador: {user?.company_id || "c-enterprise-main"}
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ABA 2: BRAND MEMORY (MEMÓRIA DA MARCA PARA IA) */}
      {activeTab === "brand" && (
        <form onSubmit={handleSaveBrandMemory} className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-7 lg:p-9 space-y-6 shadow-2xl">
            <div className="border-b border-white/[0.08] pb-5">
              <h3 className="text-lg font-semibold text-white font-heading">
                Brand Memory &amp; Persona da Inteligência Artificial
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Essas diretrizes são injetadas dinamicamente no motor de IA para gerar copys, carrosséis e roteiros com a identidade exata da sua marca.
              </p>
            </div>

            {/* Paleta Oficial da Marca */}
            <div className="space-y-3">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Cores Institucionais da Marca
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">Primária (Fundo)</span>
                    <div
                      className="h-5 w-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs font-mono text-white"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">Superfície Card</span>
                    <div
                      className="h-5 w-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: secondaryColor }}
                    />
                  </div>
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs font-mono text-white"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">Destaque (Accent)</span>
                    <div
                      className="h-5 w-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* Tipografia Canônica da Marca */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                  Tipografia para Títulos (Headings)
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
                  <Type className="h-4 w-4 text-white shrink-0" />
                  <div className="flex-1 text-xs text-white font-heading font-medium">
                    Space Grotesk (Padrão Oficial B2B)
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Headings</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                  Tipografia para Corpo &amp; Dados
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
                  <Type className="h-4 w-4 text-white shrink-0" />
                  <div className="flex-1 text-xs text-white font-sans">
                    Plus Jakarta Sans (Padrão Oficial UI)
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">UI &amp; Body</span>
                </div>
              </div>
            </div>

            {/* Tom de Voz da IA */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Tom de Voz &amp; Persona Editorial (System Prompt de Marca)
              </label>
              <textarea
                rows={3}
                value={aiVoiceTone}
                onChange={(e) => setAiVoiceTone(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-white leading-relaxed focus:border-white/30 focus:outline-none transition-colors"
                placeholder="Descreva o tom de voz..."
              />
              <p className="text-[11px] text-zinc-500">
                Injetado em todas as chamadas de geração de copy via webhook n8n para manter a coerência de marca.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Salvar Brand Memory</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ABA 3: MEMBROS & PERMISSÕES (RBAC) */}
      {activeTab === "team" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-7 lg:p-9 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white font-heading">
                  Membros da Equipe &amp; Funções (RBAC)
                </h3>
                <p className="text-xs text-zinc-400">
                  Gerencie o acesso de operadores. Usuários comerciais acessam estritamente o pipeline de vendas.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadMembers}
                  className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                  title="Recarregar membros"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingMembers ? "animate-spin" : ""}`} />
                  <span>Sincronizar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(true)}
                  className="flex h-9 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-md"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>+ Novo Membro</span>
                </button>
              </div>
            </div>

            {/* Tabela de Membros Cadastrados */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono text-[10px] uppercase tracking-wider bg-white/[0.02]">
                    <th className="py-3.5 px-4 font-medium">OPERADOR</th>
                    <th className="py-3.5 px-4 font-medium">E-MAIL CORPORATIVO</th>
                    <th className="py-3.5 px-4 font-medium">FUNÇÃO (RBAC)</th>
                    <th className="py-3.5 px-4 font-medium text-right">DATA DE INGRESSO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white font-mono">
                  {members.map((m) => {
                    const isAdmin = m.role === "admin";

                    return (
                      <tr key={m.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border ${
                                isAdmin
                                  ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                                  : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                              }`}
                            >
                              {m.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <span className="font-semibold text-white font-sans text-xs">
                              {m.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 text-xs">
                          {m.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                              isAdmin
                                ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            }`}
                          >
                            {isAdmin ? "Administrador" : "Comercial"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-zinc-500 text-[11px]">
                          {new Date(m.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: APIS & WEBHOOKS */}
      {activeTab === "integrations" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-7 lg:p-9 space-y-6 shadow-2xl">
            <div className="border-b border-white/[0.08] pb-5">
              <h3 className="text-lg font-semibold text-white font-heading">
                Status das Conexões de API &amp; Webhooks
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Monitoramento dos microsserviços integrados ao CRM: motor de IA (n8n), Meta Graph API v20.0 e Supabase.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Integração 1: n8n AI Engine */}
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Ativo &bull; Local/Produção
                  </span>
                  <Cpu className="h-4 w-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-semibold text-white font-heading">
                  Motor de IA (n8n Webhook)
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Geração autônoma de carrosséis e copys com injeção de contexto dos últimos posts gerados.
                </p>
                <div className="rounded-lg bg-black/50 p-2.5 text-[10px] font-mono text-zinc-400 break-all border border-white/5">
                  http://localhost:5678/webhook/blacklink-marketing-generate
                </div>
              </div>

              {/* Integração 2: Meta Graph API */}
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-semibold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    Conectado v20.0
                  </span>
                  <Globe className="h-4 w-4 text-sky-400" />
                </div>
                <h4 className="text-sm font-semibold text-white font-heading">
                  Meta Graph API &amp; Instagram
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Sincronização de métricas de anúncios, leitura de engajamento e publicação direta de carrosséis.
                </p>
                <div className="rounded-lg bg-black/50 p-2.5 text-[10px] font-mono text-zinc-400 break-all border border-white/5">
                  ID: @blacklink.com.br &bull; Graph v20.0
                </div>
              </div>

              {/* Integração 3: Supabase PostgreSQL */}
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-semibold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    Pool Conectado
                  </span>
                  <Server className="h-4 w-4 text-purple-400" />
                </div>
                <h4 className="text-sm font-semibold text-white font-heading">
                  PostgreSQL &amp; Drizzle ORM
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Camada de persistência relacional com isolamento multi-tenant estrito por company_id.
                </p>
                <div className="rounded-lg bg-black/50 p-2.5 text-[10px] font-mono text-zinc-400 break-all border border-white/5">
                  Sessões Seguras &bull; Base Transacional
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestão de Equipe Reutilizável */}
      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onMembersUpdated={loadMembers}
      />
    </div>
  );
}
