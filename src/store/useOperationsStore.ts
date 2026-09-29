import { create } from "zustand";

export type TaskStatus =
  | "backlog"
  | "in_production"
  | "internal_review"
  | "awaiting_client"
  | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface OperationTask {
  id: string;
  companyId?: string;
  title: string;
  description?: string | null;
  assigneeName: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt?: string;
}

interface OperationsState {
  tasks: OperationTask[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  priorityFilter: string;

  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (data: {
    title: string;
    description?: string;
    assigneeName?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string | null;
  }) => Promise<boolean>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<OperationTask>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  setPriorityFilter: (priority: string) => void;
}

export const useOperationsStore = create<OperationsState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  searchQuery: "",
  priorityFilter: "all",

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        set({ tasks: data.tasks, isLoading: false });
      } else {
        set({ isLoading: false, error: data.error || "Erro ao listar tarefas." });
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Erro de conexão com o servidor." });
    }
  },

  createTask: async (data) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success && result.task) {
        set((state) => ({
          tasks: [result.task, ...state.tasks],
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  updateTaskStatus: async (taskId, newStatus) => {
    // Atualização otimista na interface
    const prevTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    }));

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      const result = await res.json();
      if (!result.success) {
        // Reverte se falhar
        set({ tasks: prevTasks });
        return false;
      }
      return true;
    } catch {
      set({ tasks: prevTasks });
      return false;
    }
  },

  updateTask: async (taskId, updates) => {
    const prevTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    }));

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, ...updates }),
      });
      const result = await res.json();
      if (!result.success) {
        set({ tasks: prevTasks });
        return false;
      }
      return true;
    } catch {
      set({ tasks: prevTasks });
      return false;
    }
  },

  deleteTask: async (taskId) => {
    const prevTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));

    try {
      const res = await fetch(`/api/tasks?id=${encodeURIComponent(taskId)}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!result.success) {
        set({ tasks: prevTasks });
        return false;
      }
      return true;
    } catch {
      set({ tasks: prevTasks });
      return false;
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
}));
