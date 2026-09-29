import { create } from "zustand";

export type InvoicePaymentStatus = "pending" | "paid" | "overdue";

export interface Invoice {
  id: string;
  companyId?: string;
  title: string;
  amount: string;
  dueDate: string;
  paymentStatus: InvoicePaymentStatus;
  invoicePdfUrl?: string | null;
  paidAt?: string | null;
  createdAt?: string;
}

export interface BillingMetrics {
  totalMRR: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalCount: number;
}

interface BillingState {
  invoices: Invoice[];
  metrics: BillingMetrics;
  isLoading: boolean;
  isUploadingPdfId: string | null;
  error: string | null;
  statusFilter: string;

  // Actions
  fetchInvoices: () => Promise<void>;
  createInvoice: (data: {
    title: string;
    amount: number | string;
    dueDate: string;
    paymentStatus?: InvoicePaymentStatus;
    invoicePdfUrl?: string | null;
  }) => Promise<boolean>;
  markAsPaid: (invoiceId: string) => Promise<boolean>;
  updateStatus: (invoiceId: string, status: InvoicePaymentStatus) => Promise<boolean>;
  uploadInvoicePdf: (invoiceId: string, file: File) => Promise<boolean>;
  deleteInvoice: (invoiceId: string) => Promise<boolean>;
  setStatusFilter: (filter: string) => void;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  invoices: [],
  metrics: {
    totalMRR: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    totalCount: 0,
  },
  isLoading: false,
  isUploadingPdfId: null,
  error: null,
  statusFilter: "all",

  fetchInvoices: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      if (data.success) {
        set({
          invoices: data.invoices || [],
          metrics: data.metrics || {
            totalMRR: 0,
            totalPaid: 0,
            totalPending: 0,
            totalOverdue: 0,
            totalCount: 0,
          },
          isLoading: false,
        });
      } else {
        set({ isLoading: false, error: data.error || "Erro ao carregar cobranças." });
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Erro de conexão." });
    }
  },

  createInvoice: async (data) => {
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success && result.invoice) {
        // Recarrega lista e métricas
        await get().fetchInvoices();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  markAsPaid: async (invoiceId) => {
    try {
      const res = await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoiceId, paymentStatus: "paid" }),
      });
      const result = await res.json();
      if (result.success) {
        await get().fetchInvoices();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  updateStatus: async (invoiceId, status) => {
    try {
      const res = await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoiceId, paymentStatus: status }),
      });
      const result = await res.json();
      if (result.success) {
        await get().fetchInvoices();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  uploadInvoicePdf: async (invoiceId, file) => {
    set({ isUploadingPdfId: invoiceId });
    try {
      const formData = new FormData();
      formData.append("invoiceId", invoiceId);
      formData.append("file", file);

      const res = await fetch("/api/invoices/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      set({ isUploadingPdfId: null });

      if (result.success && result.invoicePdfUrl) {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, invoicePdfUrl: result.invoicePdfUrl } : inv
          ),
        }));
        return true;
      }
      return false;
    } catch {
      set({ isUploadingPdfId: null });
      return false;
    }
  },

  deleteInvoice: async (invoiceId) => {
    try {
      const res = await fetch(`/api/invoices?id=${encodeURIComponent(invoiceId)}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        await get().fetchInvoices();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  setStatusFilter: (filter) => set({ statusFilter: filter }),
}));
