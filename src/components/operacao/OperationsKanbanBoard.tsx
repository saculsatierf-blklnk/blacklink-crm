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

const COLUMNS: { id: TaskStatus; label: string; accentColor: string; pillColor: string }[] = [
  { id: "backlog", label: "Briefing / Backlog", accentColor: "border-zinc-500/40 text-zinc-400", pillColor: "bg-zinc-800 text-zinc-300 border-zinc-700" },
  { id: "in_production", label: "Em Produção (Design & Copy)", accentColor: "border-cyan-500/40 text-cyan-300", pillColor: "bg-cyan-950/60 text-cyan-300 border-cyan-800/40" },
  { id: "internal_review", label: "Revisão Interna", accentColor: "border-amber-500/40 text-amber-300", pillColor: "bg-amber-950/60 text-amber-300 border-amber-800/40" },
  { id: "awaiting_client", label: "Aguardando Cliente", accentColor: "border-purple-500/40 text-purple-300", pillColor: "bg-purple-950/60 text-purple-300 border-purple-800/40" },
  { id: "done", label: "Concluído", accentColor: "border-emerald-500/40 text-emerald-300", pillColor: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40" },
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
          <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[9px] font-mono font-bold text-red-300 uppercase tracking-wider">
            Urgente
          </span>
        );
      case "high":
        return (
          <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider">
            Alta
          </span>
        );
      case "medium":
        return (
          <span className="rounded-full bg-sky-500/20 border border-sky-500/40 px-2.5 py-0.5 text-[9px] font-mono font-semibold text-sky-300 uppercase tracking-wider">
            Média
          </span>
        );
      case "low":
      default:
        return (
          <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-[9px] font-mono text-zinc-300 uppercase tracking-wider">
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Ações */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <Layers className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Operação & Prazos • Kanban
            </h1>
            <span className="rounded-full bg-white/[0.08] border border-white/15 px-3 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              SLA Operacional
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Gestão unificada de prazos, refações, alocação de equipe (Design & Copy) e aprovação de clientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchTasks()}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            title="Atualizar tarefas"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sincronizar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2 text-xs font-semibold tracking-tight hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <Plus className="h-4 w-4" />
            <span>+ Nova Demanda</span>
          </button>
        </div>
      </div>

      {/* KPI Cards de Resumo Apple Glass */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 shadow-2xl shadow-black/50">
          <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">
            Total em Andamento
          </span>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{totalTasks}</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 shadow-2xl shadow-black/50">
          <span className="text-[11px] font-mono tracking-wider text-cyan-400 uppercase font-semibold">
            Em Produção Ativa
          </span>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-cyan-300">{inProductionCount}</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 shadow-2xl shadow-black/50">
          <span className="text-[11px] font-mono tracking-wider text-purple-400 uppercase font-semibold">
            Aguardando Cliente
          </span>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-purple-300">{awaitingClientCount}</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 shadow-2xl shadow-black/50">
          <span className="text-[11px] font-mono tracking-wider text-emerald-400 uppercase font-semibold">
            Entregas Concluídas
          </span>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-emerald-300">{doneCount}</div>
        </div>
      </div>

      {/* Barra de Filtros & Busca Apple Glass */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-3.5">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por demanda, briefing ou responsável..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Filter className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <span className="text-[11px] font-mono text-zinc-400">Prioridade:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-mono text-white focus:bg-white/[0.07] focus:border-white/30 focus:outline-none cursor-pointer transition-all"
          >
            <option value="all">Todas</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </div>

      {/* Grid de 5 Colunas do Kanban Apple Glass */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4.5 items-start min-h-[580px]">
        {COLUMNS.map((col, colIndex) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl min-h-[540px] p-4 shadow-xl shadow-black/40 transition-all"
            >
              {/* Header da Coluna */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`h-2 w-2 rounded-full border ${col.accentColor} bg-current shrink-0`} />
                  <span className="text-xs font-semibold text-white tracking-tight truncate max-w-[130px]">
                    {col.label}
                  </span>
                </div>
                <span className="rounded-full bg-white/[0.06] border border-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                  {columnTasks.length}
                </span>
              </div>

              {/* Lista de Cards da Coluna */}
              <div className="flex-1 space-y-3.5">
                {columnTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-[11px] font-mono text-zinc-500">
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
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg shadow-black/40 hover:border-white/25 hover:bg-white/[0.06] transition-all duration-300 space-y-3 cursor-grab active:cursor-grabbing group"
                      >
                        {/* Header do Card: Prioridade & Ações */}
                        <div className="flex items-center justify-between gap-1">
                          {getPriorityBadge(task.priority)}

                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Excluir tarefa"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Título & Descrição */}
                        <div>
                          <h4 className="text-xs font-semibold text-white tracking-tight line-clamp-2">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Metadados: Responsável & Prazo */}
                        <div className="pt-2.5 border-t border-white/10 flex flex-col gap-1.5 text-[10px] font-mono text-zinc-400">
                          <div className="flex items-center gap-2 truncate">
                            <User className="h-3 w-3 text-white shrink-0" />
                            <span className="truncate">{task.assigneeName}</span>
                          </div>

                          {dueInfo && (
                            <div
                              className={`flex items-center gap-1.5 ${
                                dueInfo.isPast ? "text-red-400 font-semibold" : "text-zinc-400"
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
                        <div className="pt-2 flex items-center justify-between border-t border-white/10">
                          <button
                            type="button"
                            disabled={colIndex === 0}
                            onClick={() => handleShiftColumn(task, "prev")}
                            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all"
                            title="Mover para coluna anterior"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </button>

                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
                            Mover
                          </span>

                          <button
                            type="button"
                            disabled={colIndex === COLUMNS.length - 1}
                            onClick={() => handleShiftColumn(task, "next")}
                            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all"
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

      {/* Modal de Criação de Nova Tarefa Apple Glass */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-black/90 p-8 sm:p-10 shadow-2xl shadow-black/90 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Nova Demanda de Operação
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-tight text-zinc-300">
                  Título da Demanda *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roteiro Carrossel Q4 - Vendas B2B"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-tight text-zinc-300">
                  Briefing & Instruções Técnicas
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes sobre tom de voz, referências visuais, formato ou diretrizes de copy..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-tight text-zinc-300">
                    Responsável
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Beatriz Lima • Design"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-tight text-zinc-300">
                    Prazo de Entrega
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-tight text-zinc-300">
                    Prioridade
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 font-mono text-white focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-tight text-zinc-300">
                    Etapa Inicial
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 font-mono text-white focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="backlog">Briefing / Backlog</option>
                    <option value="in_production">Em Produção</option>
                    <option value="internal_review">Revisão Interna</option>
                    <option value="awaiting_client">Aguardando Cliente</option>
                    <option value="done">Concluído</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2.5 font-semibold hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
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
