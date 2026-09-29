"use client";

import { useEffect, useState, useRef } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Filter,
  Loader2,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  useBillingStore,
  type Invoice,
  type InvoicePaymentStatus,
} from "@/store/useBillingStore";
import { GlassCard } from "@/components/ui/GlassCard";

export function BillingManagementView() {
  const {
    invoices,
    metrics,
    isLoading,
    isUploadingPdfId,
    fetchInvoices,
    createInvoice,
    markAsPaid,
    uploadInvoicePdf,
    deleteInvoice,
    statusFilter,
    setStatusFilter,
  } = useBillingStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  // Form states para nova cobrança
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<InvoicePaymentStatus>("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref para upload de NF avulso
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadInvoiceId, setActiveUploadInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Formatação de Moeda
  const formatBRL = (value: number | string) => {
    const num = typeof value === "number" ? value : parseFloat(value) || 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  // Formatação de data e status de prazo
  const formatDueDateInfo = (dateStr: string, status: InvoicePaymentStatus) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    if (status === "paid") {
      return { text: formatted, label: "Liquidado", color: "text-zinc-500 font-medium" };
    }

    if (diffDays < 0) {
      return {
        text: formatted,
        label: `Atrasado há ${Math.abs(diffDays)}d`,
        color: "text-red-400 font-medium",
      };
    }

    if (diffDays === 0) {
      return { text: formatted, label: "Vence hoje!", color: "text-amber-400 font-medium" };
    }

    return {
      text: formatted,
      label: `Vence em ${diffDays}d`,
      color: "text-zinc-400",
    };
  };

  // Filtragem de faturas
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.amount.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" || inv.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || !dueDate) return;

    setIsSubmitting(true);
    const success = await createInvoice({
      title: title.trim(),
      amount: parseFloat(amount),
      dueDate,
      paymentStatus,
    });

    setIsSubmitting(false);
    if (success) {
      setIsModalOpen(false);
      setTitle("");
      setAmount("");
      setDueDate("");
      setPaymentStatus("pending");
    }
  };

  const handleCopyPix = (invoice: Invoice) => {
    const pixPayload = `00020126360014BR.GOV.BCB.PIX011400000000000000520400005303986540${parseFloat(
      invoice.amount
    ).toFixed(2)}5802BR5916BLACK LINK CRM6009SAO PAULO62070503***6304E2B1`;

    navigator.clipboard.writeText(pixPayload);
    setCopiedInvoiceId(invoice.id);
    setTimeout(() => setCopiedInvoiceId(null), 3000);
  };

  const handleTriggerUpload = (invoiceId: string) => {
    setActiveUploadInvoiceId(invoiceId);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadInvoiceId) {
      await uploadInvoicePdf(activeUploadInvoiceId, file);
      setActiveUploadInvoiceId(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Input de arquivo invisível para anexo de Nota Fiscal */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      {/* Top Banner & Ações */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Receipt className="h-5 w-5" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-medium tracking-tight text-white">
              Faturamento & Contratos
            </h1>
            <span className="rounded-full bg-white/[0.08] border border-white/15 px-3.5 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              Multi-tenant Financeiro
            </span>
          </div>
          <p className="text-xs lg:text-sm text-zinc-400 mt-2 leading-relaxed">
            Gestão de retainers mensais, liquidação de cobranças, vencimentos e auditoria de Notas Fiscais anexas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchInvoices()}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            title="Atualizar dados"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Atualizar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2.5 text-xs font-semibold tracking-tight hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <Plus className="h-4 w-4" />
            <span>+ Nova Cobrança</span>
          </button>
        </div>
      </div>

      {/* KPI Cards de Faturamento Apple Glass */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
        <GlassCard className="p-6 lg:p-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3 block">
            MRR / Faturado Total
          </span>
          <div className="text-3xl lg:text-4xl font-medium tracking-tight text-white">
            {formatBRL(metrics.totalMRR)}
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:p-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-3 block">
            Recebido / Liquidado
          </span>
          <div className="text-3xl lg:text-4xl font-medium tracking-tight text-emerald-300">
            {formatBRL(metrics.totalPaid)}
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:p-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 mb-3 block">
            A Receber (No Prazo)
          </span>
          <div className="text-3xl lg:text-4xl font-medium tracking-tight text-amber-300">
            {formatBRL(metrics.totalPending)}
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:p-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 mb-3 block">
            Em Atraso
          </span>
          <div className="text-3xl lg:text-4xl font-medium tracking-tight text-red-300">
            {formatBRL(metrics.totalOverdue)}
          </div>
        </GlassCard>
      </div>

      {/* Controles de Filtros & Busca Apple Glass */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por descrição de contrato ou valor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-black/20 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
          />
        </div>

        {/* Filtros de Status */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/20 border border-white/10">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer ${
              statusFilter === "all"
                ? "bg-white/[0.12] text-white font-medium shadow-sm border border-white/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Todas ({invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("paid")}
            className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer ${
              statusFilter === "paid"
                ? "bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30"
                : "text-zinc-400 hover:text-emerald-300"
            }`}
          >
            Pagas
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer ${
              statusFilter === "pending"
                ? "bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30"
                : "text-zinc-400 hover:text-amber-300"
            }`}
          >
            Pendentes
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("overdue")}
            className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer ${
              statusFilter === "overdue"
                ? "bg-red-500/20 text-red-300 font-medium border border-red-500/30"
                : "text-zinc-400 hover:text-red-300"
            }`}
          >
            Em Atraso
          </button>
        </div>
      </div>

      {/* Tabela Executiva de Cobranças Apple Glass */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.08] bg-white/[0.01] font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Serviço / Contrato</th>
                <th className="px-6 py-4 font-medium">Valor (BRL)</th>
                <th className="px-6 py-4 font-medium">Vencimento</th>
                <th className="px-6 py-4 font-medium">Status de Pagamento</th>
                <th className="px-6 py-4 font-medium">Nota Fiscal (PDF)</th>
                <th className="px-6 py-4 text-right font-medium">Ações Executivas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-zinc-500">
                    Nenhuma cobrança localizada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const dueInfo = formatDueDateInfo(invoice.dueDate, invoice.paymentStatus);
                  const isUploadingThis = isUploadingPdfId === invoice.id;
                  const isCopied = copiedInvoiceId === invoice.id;

                  return (
                    <tr
                      key={invoice.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Descrição do Serviço */}
                      <td className="px-6 py-5">
                        <div className="font-medium text-white tracking-tight font-sans text-sm">
                          {invoice.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1">
                          ID: {invoice.id.slice(0, 8)} &bull; Emitido via Black Link Hub
                        </div>
                      </td>

                      {/* Valor */}
                      <td className="px-6 py-5 font-medium text-white text-sm">
                        {formatBRL(invoice.amount)}
                      </td>

                      {/* Vencimento */}
                      <td className="px-6 py-5">
                        <div className="text-zinc-200">{dueInfo.text}</div>
                        <div className={`text-[10px] mt-0.5 ${dueInfo.color}`}>
                          {dueInfo.label}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        {invoice.paymentStatus === "paid" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Pago
                          </span>
                        )}
                        {invoice.paymentStatus === "pending" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-300">
                            <Clock className="h-3 w-3" />
                            Pendente
                          </span>
                        )}
                        {invoice.paymentStatus === "overdue" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-300">
                            <AlertCircle className="h-3 w-3" />
                            Atrasado
                          </span>
                        )}
                      </td>

                      {/* Nota Fiscal PDF */}
                      <td className="px-6 py-5">
                        {invoice.invoicePdfUrl ? (
                          <a
                            href={invoice.invoicePdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-3 py-1.5 text-xs text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/40 transition-all shadow-sm"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Ver NF Anexa</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled={isUploadingThis}
                            onClick={() => handleTriggerUpload(invoice.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {isUploadingThis ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Enviando NF...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="h-3 w-3" />
                                <span>+ Anexar NF</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Botão Copiar Pix */}
                          <button
                            type="button"
                            onClick={() => handleCopyPix(invoice)}
                            className="rounded-xl p-2 text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                            title="Copiar Payload Pix"
                          >
                            {isCopied ? (
                              <span className="text-[10px] text-emerald-400 font-medium font-sans">Copiado!</span>
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* Botão Marcar como Pago */}
                          {invoice.paymentStatus !== "paid" && (
                            <button
                              type="button"
                              onClick={() => markAsPaid(invoice.id)}
                              className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer"
                            >
                              Baixar Pago
                            </button>
                          )}

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => deleteInvoice(invoice.id)}
                            className="rounded-xl p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Excluir cobrança"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação de Cobrança Apple Glass */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4 sm:p-6 animate-fadeIn">
          <div className="relative overflow-hidden w-full max-w-md rounded-3xl border border-white/[0.12] bg-[#0A0A0A]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-md">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium text-white tracking-tight">
                  Registrar Nova Cobrança
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="relative z-10 space-y-5 text-xs">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                  Descrição do Serviço / Contrato *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Retainer Mensal: Growth & Tráfego B2B"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                  Valor da Cobrança (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 6500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                    Status Inicial
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as InvoicePaymentStatus)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:border-white/30 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="pending" className="bg-[#0A0A0A] text-white">Pendente</option>
                    <option value="paid" className="bg-[#0A0A0A] text-white">Pago</option>
                    <option value="overdue" className="bg-[#0A0A0A] text-white">Em Atraso</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !amount}
                  className="flex items-center gap-2 rounded-xl bg-white text-black px-6 py-2.5 text-xs font-semibold hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <span>Registrar Cobrança</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
