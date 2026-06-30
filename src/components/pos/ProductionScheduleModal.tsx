import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ClipboardList, Download, Save, Plus, Trash2, ChevronUp, ChevronDown,
  Loader2, X, AlertCircle, Calendar, Check
} from "lucide-react";
import { toast } from "sonner";
import type { OrderHistoryItem } from "@/utils/api";
import {
  fetchTasksByDate, bulkInsertTasks, clearTasksForDate,
  toggleTaskComplete, deleteTask as deleteTaskApi,
  type ProductionTask, type ProductionTaskInsert
} from "@/services/productionTasks";

// ============================================================
// Types
// ============================================================

interface LocalTask {
  id: string; // UUID from Supabase or temp-id for new tasks
  order_id: string | null;
  title: string;
  description: string;
  priority: number;
  is_completed: boolean;
  sort_order: number;
  deadline: string | null;
  customer_name: string;
  items_summary: string;
  cabang: string | null;
  isNew?: boolean; // not yet saved to DB
}

interface ProductionScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderHistoryItem[];
  cashierName: string;
  cabang: string;
  // Logos passed from parent (already loaded as base64)
  logoBelwis: string;
  logoUnila: string;
  logoTidurlah: string;
}

// ============================================================
// Helpers
// ============================================================

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateIndonesian(dateStr: string): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const d = new Date(dateStr + "T00:00:00");
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDeadlineShort(deadlineStr: string | null): string {
  if (!deadlineStr) return "";
  try {
    const d = new Date(deadlineStr);
    if (isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm} ${hh}:${min}`;
  } catch {
    return "";
  }
}

function formatTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} | ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// ============================================================
// Component
// ============================================================

export function ProductionScheduleModal({
  isOpen,
  onClose,
  orders,
  cashierName,
  cabang,
  logoBelwis,
  logoUnila,
  logoTidurlah,
}: ProductionScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Custom task form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState(0);
  const [newTaskDeadline, setNewTaskDeadline] = useState("");

  const exportRef = useRef<HTMLDivElement>(null);

  // ──────────────────────────────────────────
  // Load tasks from Supabase when date changes
  // ──────────────────────────────────────────
  const loadTasks = useCallback(async (date: string) => {
    setIsLoading(true);
    const result = await fetchTasksByDate(date);
    if (result.success && result.tasks.length > 0) {
      setTasks(
        result.tasks.map((t) => ({
          id: t.id,
          order_id: t.order_id,
          title: t.title,
          description: t.description,
          priority: t.priority,
          is_completed: t.is_completed,
          sort_order: t.sort_order,
          deadline: t.deadline,
          customer_name: t.customer_name,
          items_summary: t.items_summary,
          cabang: t.cabang,
        }))
      );
    } else {
      // Auto-populate from pending/partial orders
      autoPopulateFromOrders(date);
    }
    setIsLoading(false);
  }, [orders]);

  const autoPopulateFromOrders = (date: string) => {
    const pendingOrders = orders.filter(
      (o) => o.orderStatus === "pending" || o.orderStatus === "partial"
    );

    const autoTasks: LocalTask[] = pendingOrders.map((order, idx) => ({
      id: `temp-${Date.now()}-${idx}`,
      order_id: order.orderId,
      title: `${order.customerName || "Tanpa Nama"} — ${order.itemsSummary || `${order.itemCount || 0} item`}`,
      description: "",
      priority: 0,
      is_completed: false,
      sort_order: idx,
      deadline: order.deadline || null,
      customer_name: order.customerName || "",
      items_summary: order.itemsSummary || "",
      cabang: order.cabang || null,
      isNew: true,
    }));

    setTasks(autoTasks);
  };

  useEffect(() => {
    if (isOpen) {
      loadTasks(selectedDate);
    }
  }, [isOpen, selectedDate, loadTasks]);

  // ──────────────────────────────────────────
  // Task Actions
  // ──────────────────────────────────────────
  const handleToggleComplete = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
      )
    );
    // Persist if not a new task
    const task = tasks.find((t) => t.id === taskId);
    if (task && !task.isNew) {
      await toggleTaskComplete(taskId, !task.is_completed);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (task && !task.isNew) {
      await deleteTaskApi(taskId);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setTasks((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated.map((t, i) => ({ ...t, sort_order: i }));
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= tasks.length - 1) return;
    setTasks((prev) => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated.map((t, i) => ({ ...t, sort_order: i }));
    });
  };

  const handleTogglePriority = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, priority: t.priority === 1 ? 0 : 1 } : t
      )
    );
  };

  // ──────────────────────────────────────────
  // Add Custom Task
  // ──────────────────────────────────────────
  const handleAddCustomTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: LocalTask = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      order_id: null,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      priority: newTaskPriority,
      is_completed: false,
      sort_order: tasks.length,
      deadline: newTaskDeadline ? new Date(newTaskDeadline).toISOString() : null,
      customer_name: "",
      items_summary: "",
      cabang: cabang || null,
      isNew: true,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskPriority(0);
    setNewTaskDeadline("");
    setShowAddForm(false);
  };

  // ──────────────────────────────────────────
  // Save All Tasks to Supabase
  // ──────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Clear existing tasks for this date, then bulk insert current list
      await clearTasksForDate(selectedDate);

      const tasksToInsert: ProductionTaskInsert[] = tasks.map((t, idx) => ({
        schedule_date: selectedDate,
        order_id: t.order_id || undefined,
        title: t.title,
        description: t.description,
        priority: t.priority,
        is_completed: t.is_completed,
        sort_order: idx,
        created_by: cashierName,
        deadline: t.deadline || undefined,
        customer_name: t.customer_name,
        items_summary: t.items_summary,
        cabang: t.cabang || cabang || undefined,
      }));

      const result = await bulkInsertTasks(tasksToInsert);
      if (result.success && result.tasks) {
        // Update local state with server-generated IDs
        setTasks(
          result.tasks.map((t) => ({
            id: t.id,
            order_id: t.order_id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            is_completed: t.is_completed,
            sort_order: t.sort_order,
            deadline: t.deadline,
            customer_name: t.customer_name,
            items_summary: t.items_summary,
            cabang: t.cabang,
          }))
        );
        toast.success("Jadwal produksi berhasil disimpan!", {
          position: "top-center",
          duration: 2000,
        });
      } else {
        toast.error("Gagal menyimpan jadwal: " + (result.error || "Unknown error"), {
          position: "top-center",
        });
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Gagal menyimpan jadwal produksi", { position: "top-center" });
    } finally {
      setIsSaving(false);
    }
  };

  // ──────────────────────────────────────────
  // Export to JPG
  // ──────────────────────────────────────────
  const handleExportJPG = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);

    try {
      // Small delay to ensure the hidden div renders fully
      await new Promise((r) => setTimeout(r, 300));

      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: exportRef.current.scrollWidth,
        height: exportRef.current.scrollHeight,
        removeContainer: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `jadwal-produksi-${selectedDate}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success("Jadwal berhasil di-export!", {
            position: "top-center",
            duration: 2000,
          });
        }
      }, "image/jpeg", 0.95);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Gagal export jadwal", { position: "top-center" });
    } finally {
      setIsExporting(false);
    }
  };

  // ──────────────────────────────────────────
  // Determine branch logo
  // ──────────────────────────────────────────
  const isUnila = (cabang || "").toLowerCase().includes("unila");
  const topLogo = isUnila ? logoUnila : logoBelwis;

  const renderTaskItem = (task: LocalTask, idx: number) => (
    <div
      key={task.id}
      style={{
        padding: "6px 0",
        display: "flex",
        gap: "8px",
        alignItems: "flex-start",
      }}
    >
      {/* Checkbox */}
      <span
        style={{
          fontFamily: "'Courier New', Consolas, monospace",
          fontSize: "13px",
          fontWeight: "700",
          flexShrink: 0,
          minWidth: "30px",
          display: "inline-block",
          lineHeight: "1.35",
        }}
      >
        {task.is_completed ? "[x]" : task.priority === 1 ? "[!]" : "[ ]"}
      </span>
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "700",
            color: "#000000",
            textDecoration: task.is_completed ? "line-through" : "none",
            lineHeight: "1.35",
          }}
        >
          {idx + 1}. {task.title}
        </div>
        {task.description && (
          <div
            style={{
              fontSize: "10.5px",
              color: "#000000",
              marginTop: "2px",
              lineHeight: "1.3",
              fontWeight: "600",
            }}
          >
            {task.description}
          </div>
        )}
        {task.deadline && (
          <div
            style={{
              fontSize: "11px",
              color: "#000000",
              marginTop: "4px",
              fontWeight: "800",
              lineHeight: "1.3",
            }}
          >
            DEADLINE: {formatDeadlineShort(task.deadline)}
          </div>
        )}
        {!task.order_id && (
          <div
            style={{
              fontSize: "10px",
              fontWeight: "800",
              color: "#000000",
              marginTop: "2px",
              lineHeight: "1.2",
            }}
          >
            [CUSTOM TASK]
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#FF5E01]" />
              Jadwal Produksi
            </DialogTitle>
            <DialogDescription>
              Atur jadwal produksi harian untuk tim. Simpan ke database atau export sebagai gambar.
            </DialogDescription>
          </DialogHeader>

          {/* Date Picker */}
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 text-sm w-auto"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {formatDateIndonesian(selectedDate)}
            </span>
          </div>

          {/* Task Count */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">
              {tasks.length} tugas
              {tasks.filter((t) => t.is_completed).length > 0 &&
                ` (${tasks.filter((t) => t.is_completed).length} selesai)`}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Tugas
            </Button>
          </div>

          {/* Add Custom Task Form */}
          {showAddForm && (
            <div className="border border-dashed border-[#FF5E01]/40 rounded-lg p-3 mb-2 bg-orange-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Tugas Baru</span>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Input
                autoFocus
                placeholder="Judul tugas..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCustomTask();
                }}
              />
              <Input
                placeholder="Deskripsi (opsional)..."
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                className="h-8 text-sm"
              />
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500">Deadline (opsional):</label>
                <Input
                  type="datetime-local"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setNewTaskPriority(newTaskPriority === 1 ? 0 : 1)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border transition-colors ${
                    newTaskPriority === 1
                      ? "bg-red-100 text-red-700 border-red-300"
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  <AlertCircle className="w-3 h-3" />
                  {newTaskPriority === 1 ? "Prioritas Tinggi" : "Normal"}
                </button>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-[#FF5E01] hover:bg-[#E05301]"
                  onClick={handleAddCustomTask}
                  disabled={!newTaskTitle.trim()}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Tambah
                </Button>
              </div>
            </div>
          )}

          {/* Task List */}
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#FF5E01]" />
              <p className="text-xs text-gray-500 mt-2">Memuat jadwal...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada tugas untuk tanggal ini</p>
              <p className="text-xs mt-1">Tekan "Tambah Tugas" untuk menambahkan</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1">
              {tasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between gap-3 p-1.5 px-2.5 rounded-lg border transition-all ${
                    task.is_completed
                      ? "bg-gray-50 border-gray-200 opacity-60"
                      : task.priority === 1
                        ? "bg-red-50 border-red-200"
                        : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        task.is_completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-[#FF5E01]"
                      }`}
                    >
                      {task.is_completed && <Check className="w-3 h-3" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400 font-mono">
                          {idx + 1}.
                        </span>
                        {task.priority === 1 && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Prioritas Tinggi" />
                        )}
                        <span
                          className={`text-sm font-medium truncate ${
                            task.is_completed ? "line-through text-gray-400" : "text-gray-800"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {task.description}
                        </p>
                      )}
                      {task.deadline && (
                        <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                          Deadline: {formatDeadlineShort(task.deadline)}
                        </p>
                      )}
                      {!task.order_id && (
                        <span className="text-[9px] font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                          TUGAS CUSTOM
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => handleTogglePriority(task.id)}
                      className={`p-1 rounded transition-colors ${
                        task.priority === 1
                          ? "text-red-500 hover:bg-red-100"
                          : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                      }`}
                      title="Toggle Prioritas"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveUp(idx)}
                      className="p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                      disabled={idx === 0}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      className="p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                      disabled={idx === tasks.length - 1}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center gap-2 pt-3 border-t mt-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleExportJPG}
              disabled={isExporting || tasks.length === 0}
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Export JPG
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 bg-[#FF5E01] hover:bg-[#E05301]"
              onClick={handleSave}
              disabled={isSaving || tasks.length === 0}
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Simpan
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────
          Hidden Export Template (for html2canvas)
          Uses same receipt design system
          ────────────────────────────────────────── */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
        <div
          ref={exportRef}
          style={{
            width: tasks.length > 10 ? "720px" : "380px",
            background: "#ffffff",
            padding: "0",
            margin: "0",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontFamily: "'Roboto', 'Arial', 'Helvetica', sans-serif",
              fontSize: "13px",
              lineHeight: "1.4",
              maxWidth: tasks.length > 10 ? "720px" : "380px",
              background: "white",
              color: "#000000",
              padding: "12px 16px",
              boxSizing: "border-box",
            }}
          >
            {/* Header with Branch Logo */}
            <div style={{ textAlign: "center", paddingBottom: "6px", marginBottom: "6px" }}>
              {topLogo && (
                <div style={{ marginBottom: "8px" }}>
                  <img
                    src={topLogo}
                    alt={isUnila ? "Cabang Unila" : "Cabang Belwis"}
                    style={{
                      maxHeight: "52px",
                      width: "auto",
                      objectFit: "contain",
                      margin: "0 auto",
                      display: "block",
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "800",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "#000",
                  marginBottom: "2px",
                }}
              >
                JADWAL PRODUKSI HARIAN
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontStyle: "italic",
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: "3px",
                }}
              >
                "ID Card Cepat, Jalur Pintas!"
              </div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#333" }}>
                {formatDateIndonesian(selectedDate)}
              </div>
            </div>

            {/* Dashed Separator */}
            <div
              style={{
                borderTop: "1.5px dashed #000",
                margin: "6px 0",
              }}
            />

            {/* Task List */}
            {tasks.length <= 10 ? (
              tasks.map((task, idx) => (
                <div key={task.id}>
                  {renderTaskItem(task, idx)}
                  {idx < tasks.length - 1 && (
                    <div
                      style={{
                        borderTop: "1.5px dashed #000",
                        margin: "6px 0",
                      }}
                    />
                  )}
                </div>
              ))
            ) : (
              <div style={{ display: "flex", gap: "24px", alignItems: "stretch" }}>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                  {tasks.slice(0, Math.ceil(tasks.length / 2)).map((task, idx) => (
                    <div key={task.id}>
                      {renderTaskItem(task, idx)}
                      {idx < Math.ceil(tasks.length / 2) - 1 && (
                        <div style={{ borderTop: "1px dashed #ccc", margin: "6px 0" }} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ borderLeft: "1.5px dashed #000", alignSelf: "stretch" }} />
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                  {tasks.slice(Math.ceil(tasks.length / 2)).map((task, idx) => {
                    const actualIdx = Math.ceil(tasks.length / 2) + idx;
                    return (
                      <div key={task.id}>
                        {renderTaskItem(task, actualIdx)}
                        {actualIdx < tasks.length - 1 && (
                          <div style={{ borderTop: "1px dashed #ccc", margin: "6px 0" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Separator */}
            <div
              style={{
                borderTop: "1.5px dashed #000",
                margin: "6px 0",
              }}
            />

            {/* Footer */}
            <div style={{ textAlign: "center", paddingTop: "4px" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#000",
                  fontWeight: "600",
                  marginBottom: "2px",
                }}
              >
                Total: {tasks.length} tugas
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#000000",
                  marginBottom: "4px",
                }}
              >
                Dibuat oleh: {cashierName || "Admin"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#000",
                  fontWeight: "500",
                  marginBottom: "6px",
                }}
              >
                {formatTimestamp()}
              </div>
              {logoTidurlah && (
                <img
                  src={logoTidurlah}
                  alt="Tidurlah Grafika"
                  style={{
                    maxHeight: "26px",
                    width: "auto",
                    objectFit: "contain",
                    margin: "0 auto",
                    display: "block",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
