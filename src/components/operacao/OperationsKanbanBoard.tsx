"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  useOperationsStore,
  type OperationTask,
  type TaskPriority,
  type TaskStatus,
} from "@/store/useOperationsStore";

const COLUMNS: { id: TaskStatus; label: string; accentColor: string }[] = [
  { id: "backlog", label: "Briefing / Backlog", accentColor: "border-zinc-600/50 text-zinc-400" },
  { id: "in_production", label: "Em Produção (Design & Copy)", accentColor: "border-cyan-500/50 text-cyan-400" },
  { id: "internal_review", label: "Revisão Interna", accentColor: "border-amber-500/50 text-amber-400" },
  { id: "awaiting_client", label: "Aguardando Cliente", accentColor: "border-purple-500/50 text-purple-400" },
  { id: "done", label: "Concluído", accentColor: "border-emerald-500/50 text-emerald-400" },
];

export function OperationsKanbanBoard() {
  const {
    tasks,
    isLoading,
    fetchTasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
  } = useOperationsStore();

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAssignee, setNewAssignee] = useState("Equipe Black Link");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newStatus, setNewStatus] = useState<TaskStatus>("backlog");
  const [newDueDate, setNewDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filtro de tarefas
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.assigneeName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  // Métricas
  const totalTasks = tasks.length;
  const inProductionCount = tasks.filter((t) => t.status === "in_production").length;
  const awaitingClientCount = tasks.filter((t) => t.status === "awaiting_client").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  // Handlers de drag and drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (id) {
      await updateTaskStatus(id, targetStatus);
    }
    setDraggedTaskId(null);
  };

  // Movimentação rápida de coluna
  const handleShiftColumn = async (task: OperationTask, direction: "prev" | "next") => {
    const currentIndex = COLUMNS.findIndex((c) => c.id === task.status);
    if (currentIndex === -1) return;

    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      await updateTaskStatus(task.id, COLUMNS[newIndex].id);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    const success = await createTask({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      assigneeName: newAssignee.trim() || "Equipe Black Link",
      priority: newPriority,
      status: newStatus,
      dueDate: newDueDate || null,
    });

    setIsSubmitting(false);
    if (success) {
      setIsNewTaskModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="rounded bg-red-950/70 border border-red-700/60 px-2 py-0.5 text-[10px] font-mono font-bold text-red-400">
            Urgente
          </span>
        );
      case "high":
        return (
          <span className="rounded bg-amber-950/70 border border-amber-700/60 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400">
            Alta
          </span>
        );
      case "medium":
        return (
          <span className="rounded bg-sky-950/70 border border-sky-700/60 px-2 py-0.5 text-[10px] font-mono font-medium text-sky-400">
            Média
          </span>
        );
      case "low":
      default:
        return (
          <span className="rounded bg-zinc-900 border border-zinc-700/60 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
            Baixa
          </span>
        );
    }
  };

  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isPast = date < now;

    const formatted = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

    return {
      text: formatted,
      isPast,
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Ações */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-glass-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-void">
              <Layers className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-bold font-mono uppercase tracking-wider text-platinum">
              Operação & Prazos • Kanban de Agência
            </h1>
            <span className="rounded bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent">
              SLA Operacional
            </span>
          </div>
          <p className="text-xs text-sub mt-1">
            Gestão unificada de prazos, refações, alocação de equipe (Design & Copy) e aprovação de clientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchTasks()}
            className="flex items-center gap-1.5 rounded-lg border border-glass-border bg-carbon px-3 py-2 text-xs font-mono text-sub hover:text-platinum transition-colors cursor-pointer"
            title="Atualizar tarefas"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sincronizar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-accent text-void px-4 py-2 text-xs font-mono font-bold hover:bg-platinum transition-all cursor-pointer shadow-lg shadow-accent/10"
          >
            <Plus className="h-4 w-4" />
            <span>+ Nova Demanda</span>
          </button>
        </div>
      </div>

      {/* KPI Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-glass-border bg-carbon p-4 shadow-sm">
          <span className="text-[11px] font-mono text-sub uppercase">Total em Andamento</span>
          <div className="mt-1 text-2xl font-bold font-mono text-platinum">{totalTasks}</div>
        </div>
        <div className="rounded-xl border border-glass-border bg-carbon p-4 shadow-sm">
          <span className="text-[11px] font-mono text-cyan-400 uppercase">Em Produção Ativa</span>
          <div className="mt-1 text-2xl font-bold font-mono text-cyan-400">{inProductionCount}</div>
        </div>
        <div className="rounded-xl border border-glass-border bg-carbon p-4 shadow-sm">
          <span className="text-[11px] font-mono text-purple-400 uppercase">Aguardando Cliente</span>
          <div className="mt-1 text-2xl font-bold font-mono text-purple-400">{awaitingClientCount}</div>
        </div>
        <div className="rounded-xl border border-glass-border bg-carbon p-4 shadow-sm">
          <span className="text-[11px] font-mono text-emerald-400 uppercase">Entregas Concluídas</span>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">{doneCount}</div>
        </div>
      </div>

      {/* Barra de Filtros & Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-glass-border bg-carbon/60 p-3 backdrop-blur">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-sub" />
          <input
            type="text"
            placeholder="Buscar por demanda, briefing ou responsável..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-glass-border bg-void/80 pl-9 pr-3 py-1.5 text-xs text-platinum placeholder-sub focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="h-3.5 w-3.5 text-sub shrink-0" />
          <span className="text-[11px] font-mono text-sub">Prioridade:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-glass-border bg-void/80 px-2.5 py-1 text-xs font-mono text-platinum focus:border-accent focus:outline-none cursor-pointer"
          >
            <option value="all">Todas</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </div>

      {/* Grid de 5 Colunas do Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start min-h-[550px]">
        {COLUMNS.map((col, colIndex) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col rounded-xl border border-glass-border bg-carbon/40 min-h-[500px] p-3 shadow-inner"
            >
              {/* Header da Coluna */}
              <div className="flex items-center justify-between border-b border-glass-border/60 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full border ${col.accentColor} bg-current`} />
                  <span className="text-xs font-bold font-mono text-platinum truncate max-w-[140px]">
                    {col.label}
                  </span>
                </div>
                <span className="rounded-full bg-void border border-glass-border px-2 py-0.5 text-[10px] font-mono text-sub">
                  {columnTasks.length}
                </span>
              </div>

              {/* Lista de Cards da Coluna */}
              <div className="flex-1 space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-glass-border/50 p-6 text-center text-[11px] font-mono text-sub">
                    Sem tarefas nesta etapa
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const dueInfo = formatDueDate(task.dueDate);

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="rounded-lg border border-glass-border bg-carbon p-3.5 shadow-md hover:border-glass-highlight transition-all space-y-2.5 cursor-grab active:cursor-grabbing group"
                      >
                        {/* Header do Card: Prioridade & Ações */}
                        <div className="flex items-center justify-between gap-1">
                          {getPriorityBadge(task.priority)}

                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className="text-sub/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                            title="Excluir tarefa"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Título & Descrição */}
                        <div>
                          <h4 className="text-xs font-semibold text-platinum line-clamp-2">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[11px] text-sub line-clamp-2 mt-1 font-sans">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Metadados: Responsável & Prazo */}
                        <div className="pt-2 border-t border-glass-border/40 flex flex-col gap-1.5 text-[10px] font-mono text-sub">
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="h-3 w-3 text-accent shrink-0" />
                            <span className="truncate">{task.assigneeName}</span>
                          </div>

                          {dueInfo && (
                            <div
                              className={`flex items-center gap-1.5 ${
                                dueInfo.isPast ? "text-red-400 font-semibold" : "text-sub"
                              }`}
                            >
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>
                                {dueInfo.isPast ? "Atrasado: " : "Entrega: "}
                                {dueInfo.text}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Controles de Transição Rápida */}
                        <div className="pt-1 flex items-center justify-between border-t border-glass-border/30">
                          <button
                            type="button"
                            disabled={colIndex === 0}
                            onClick={() => handleShiftColumn(task, "prev")}
                            className="p-1 text-sub hover:text-platinum disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            title="Mover para coluna anterior"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </button>

                          <span className="text-[9px] font-mono text-sub/60 uppercase">Mover</span>

                          <button
                            type="button"
                            disabled={colIndex === COLUMNS.length - 1}
                            onClick={() => handleShiftColumn(task, "next")}
                            className="p-1 text-sub hover:text-platinum disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            title="Avançar para próxima coluna"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Criação de Nova Tarefa */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border border-glass-border bg-carbon p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-glass-border pb-3">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-bold font-mono text-platinum">
                  Nova Demanda de Operação
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-sub hover:text-platinum cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-sub mb-1">Título da Demanda *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roteiro Carrossel Q4 - Vendas B2B"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-glass-border bg-void px-3 py-2 text-platinum focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sub mb-1">Briefing & Instruções Técnicas</label>
                <textarea
                  rows={3}
                  placeholder="Detalhes sobre tom de voz, referências visuais, formato ou diretrizes de copy..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-lg border border-glass-border bg-void px-3 py-2 text-platinum focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sub mb-1">Responsável</label>
                  <input
                    type="text"
                    placeholder="Ex: Beatriz Lima • Design"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full rounded-lg border border-glass-border bg-void px-3 py-2 text-platinum focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sub mb-1">Prazo de Entrega</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-lg border border-glass-border bg-void px-3 py-2 text-platinum focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sub mb-1">Prioridade</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-lg border border-glass-border bg-void px-3 py-2 text-platinum focus:border-accent focus:outline-none"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sub mb-1">Etapa Inicial</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="w-full rounded-lg border border-glass-border bg-void px-3 py-2 text-platinum focus:border-accent focus:outline-none"
                  >
                    <option value="backlog">Briefing / Backlog</option>
                    <option value="in_production">Em Produção</option>
                    <option value="internal_review">Revisão Interna</option>
                    <option value="awaiting_client">Aguardando Cliente</option>
                    <option value="done">Concluído</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-glass-border">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="rounded-lg border border-glass-border bg-void px-4 py-2 text-sub hover:text-platinum cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="flex items-center gap-2 rounded-lg bg-accent text-void px-5 py-2 font-bold hover:bg-platinum transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Criar Demanda</span>
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
