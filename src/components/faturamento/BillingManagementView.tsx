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
    // Zera horas para comparação de dias
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    if (status === "paid") {
      return { text: formatted, label: "Liquidado", color: "text-sub" };
    }

    if (diffDays < 0) {
      return {
        text: formatted,
        label: `Atrasado há ${Math.abs(diffDays)}d`,
        color: "text-red-400 font-bold",
      };
    }

    if (diffDays === 0) {
      return { text: formatted, label: "Vence hoje!", color: "text-amber-400 font-bold" };
    }

    return {
      text: formatted,
      label: `Vence em ${diffDays}d`,
      color: "text-sub",
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Input de arquivo invisível para anexo de Nota Fiscal */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      {/* Top Banner & Ações */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-glass-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-void">
              <Receipt className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-bold font-mono uppercase tracking-wider text-platinum">
              Controle de Faturamento & Contratos
            </h1>
            <span className="rounded bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent">
              Multi-tenant Financeiro
            </span>
          </div>
          <p className="text-xs text-sub mt-1">
            Gestão de retainers mensais, liquidação de cobranças, vencimentos e auditoria de Notas Fiscais anexas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchInvoices()}
            className="flex items-center gap-1.5 rounded-lg border border-glass-border bg-carbon px-3 py-2 text-xs font-mono text-sub hover:text-platinum transition-colors cursor-pointer"
            title="Atualizar dados"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Atualizar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-accent text-void px-4 py-2 text-xs font-mono font-bold hover:bg-platinum transition-all cursor-pointer shadow-lg shadow-accent/10"
          >
            <Plus className="h-4 w-4" />
            <span>+ Nova Cobrança</span>
          </button>
        </div>
      </div>

      {/* KPI Cards de Faturamento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-glass-border bg-carbon p-4 shadow-sm">
          <span className="text-[11px] font-mono text-sub uppercase">MRR / Faturado Total</span>
          <div className="mt-1 text-2xl font-bold font-mono text-platinum">
            {formatBRL(metrics.totalMRR)}
          </div>
        </div>

        <div className="rounded-xl border border-glass-border bg-carbon p-4 shadow-sm">
          <span className="text-[11px] font-mono text-emerald-400 uppercase">Recebido / Liquidado</span>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">
            {formatBRL(metrics.totalPaid)}
          </div>
        </div>

        <div className="rounded-xl border border-glass-border bg-carbon p-4 shadow-sm">
          <span className="text-[11px] font-mono text-amber-400 uppercase">A Receber (No Prazo)</span>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-400">
            {formatBRL(metrics.totalPending)}
          </div>
        </div>

        <div className="rounded-xl border border-glass-border bg-carbon p-4 shadow-sm">
          <span className="text-[11px] font-mono text-red-400 uppercase">Em Atraso</span>
          <div className="mt-1 text-2xl font-bold font-mono text-red-400">
            {formatBRL(metrics.totalOverdue)}
          </div>
        </div>
      </div>

      {/* Controles de Filtros & Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-glass-border bg-carbon/60 p-3 backdrop-blur">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-sub" />
          <input
            type="text"
            placeholder="Buscar por descrição de contrato ou valor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-glass-border bg-void/80 pl-9 pr-3 py-1.5 text-xs text-platinum placeholder-sub focus:border-accent focus:outline-none"
          />
        </div>

        {/* Filtros de Status */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
              statusFilter === "all"
                ? "bg-carbon-muted border border-glass-highlight text-platinum font-bold"
                : "text-sub hover:text-platinum"
            }`}
          >
            Todas ({invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("paid")}
            className={`rounded px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
              statusFilter === "paid"
                ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30"
                : "text-sub hover:text-emerald-400"
            }`}
          >
            Pagas
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`rounded px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
              statusFilter === "pending"
                ? "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30"
                : "text-sub hover:text-amber-400"
            }`}
          >
            Pendentes
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("overdue")}
            className={`rounded px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
              statusFilter === "overdue"
                ? "bg-red-500/20 text-red-400 font-bold border border-red-500/30"
                : "text-sub hover:text-red-400"
            }`}
          >
            Em Atraso
          </button>
        </div>
      </div>

      {/* Tabela Executiva de Cobranças */}
      <div className="rounded-xl border border-glass-border bg-carbon overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-glass-border bg-void/50 font-mono text-[10px] uppercase tracking-wider text-sub">
              <tr>
                <th className="px-5 py-3.5">Serviço / Contrato</th>
                <th className="px-5 py-3.5">Valor (BRL)</th>
                <th className="px-5 py-3.5">Vencimento</th>
                <th className="px-5 py-3.5">Status de Pagamento</th>
                <th className="px-5 py-3.5">Nota Fiscal (PDF)</th>
                <th className="px-5 py-3.5 text-right">Ações Executivas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border/40 font-mono">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sub">
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
                      className="hover:bg-carbon-muted/40 transition-colors group"
                    >
                      {/* Descrição do Serviço */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-platinum font-sans">
                          {invoice.title}
                        </div>
                        <div className="text-[10px] text-sub font-mono mt-0.5">
                          ID: {invoice.id.slice(0, 8)} • Emitido via Black Link Hub
                        </div>
                      </td>

                      {/* Valor */}
                      <td className="px-5 py-4 font-bold text-platinum">
                        {formatBRL(invoice.amount)}
                      </td>

                      {/* Vencimento */}
                      <td className="px-5 py-4">
                        <div className="text-platinum">{dueInfo.text}</div>
                        <div className={`text-[10px] ${dueInfo.color}`}>
                          {dueInfo.label}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {invoice.paymentStatus === "paid" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Pago
                          </span>
                        )}
                        {invoice.paymentStatus === "pending" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                            <Clock className="h-3 w-3" />
                            Pendente
                          </span>
                        )}
                        {invoice.paymentStatus === "overdue" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">
                            <AlertCircle className="h-3 w-3" />
                            Atrasado
                          </span>
                        )}
                      </td>

                      {/* Nota Fiscal PDF */}
                      <td className="px-5 py-4">
                        {invoice.invoicePdfUrl ? (
                          <a
                            href={invoice.invoicePdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-1 text-[11px] text-cyan-300 hover:border-cyan-400 transition-colors"
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
                            className="inline-flex items-center gap-1.5 rounded-md border border-glass-border bg-void/60 px-2.5 py-1 text-[11px] text-sub hover:text-platinum hover:border-glass-highlight transition-colors cursor-pointer disabled:opacity-50"
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
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Botão Copiar Pix */}
                          <button
                            type="button"
                            onClick={() => handleCopyPix(invoice)}
                            className="rounded p-1.5 text-sub hover:text-platinum border border-transparent hover:border-glass-border hover:bg-void transition-all cursor-pointer"
                            title="Copiar Payload Pix"
                          >
                            {isCopied ? (
                              <span className="text-[10px] text-emerald-400 font-bold">Copiado!</span>
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* Botão Marcar como Pago */}
                          {invoice.paymentStatus !== "paid" && (
                            <button
                              type="button"
                              onClick={() => markAsPaid(invoice.id)}
                              className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer"
                            >
                              Baixar Pago
                            </button>
                          )}

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => deleteInvoice(invoice.id)}
                            className="rounded p-1.5 text-sub/50 hover:text-red-400 transition-colors cursor-pointer"
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

      {/* Modal de Criação de Cobrança */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border border-glass-border bg-carbon p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-glass-border pb-3">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-bold font-mono text-platinum">
                  Registrar Nova Cobrança
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-sub hover:text-platinum cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-sub mb-1">Descrição do Serviço / Contrato *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Retainer Mensal: Growth & Tráfego B2B"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-glass-border bg-void px-3 py-2 text-platinum focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sub mb-1">Valor da Cobrança (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 6500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-glass-border bg-void px-3 py-2 text-platinum focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sub mb-1">Data de Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-lg border border-glass-border bg-void px-3 py-2 text-platinum focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sub mb-1">Status Inicial</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as InvoicePaymentStatus)}
                    className="w-full rounded-lg border border-glass-border bg-void px-3 py-2 text-platinum focus:border-accent focus:outline-none"
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="overdue">Em Atraso</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-glass-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-glass-border bg-void px-4 py-2 text-sub hover:text-platinum cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !amount}
                  className="flex items-center gap-2 rounded-lg bg-accent text-void px-5 py-2 font-bold hover:bg-platinum transition-colors cursor-pointer disabled:opacity-50"
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
