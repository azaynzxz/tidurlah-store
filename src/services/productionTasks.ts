import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================
// Production Tasks Service — Supabase CRUD
// ============================================================

export interface ProductionTask {
  id: string;
  schedule_date: string;
  order_id: string | null;
  title: string;
  description: string;
  priority: number; // 0=normal, 1=urgent
  is_completed: boolean;
  sort_order: number;
  created_by: string;
  deadline: string | null;
  customer_name: string;
  items_summary: string;
  cabang: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductionTaskInsert = Omit<ProductionTask, 'id' | 'created_at' | 'updated_at'>;

/**
 * Fetch all tasks for a given date, ordered by sort_order.
 */
export async function fetchTasksByDate(
  date: string
): Promise<{ success: boolean; tasks: ProductionTask[]; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, tasks: [], error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('production_tasks')
      .select('*')
      .eq('schedule_date', date)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { success: true, tasks: (data || []) as unknown as ProductionTask[] };
  } catch (err) {
    console.error('[ProductionTasks] Fetch failed:', err);
    return {
      success: false,
      tasks: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Insert or update a single task.
 * If the task has an `id`, it updates; otherwise it inserts.
 */
export async function upsertTask(
  task: Partial<ProductionTask> & { schedule_date: string; title: string }
): Promise<{ success: boolean; task?: ProductionTask; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    if (task.id) {
      // Update existing
      const { id, created_at, updated_at, ...updateData } = task;
      const { data, error } = await supabase
        .from('production_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, task: data as unknown as ProductionTask };
    } else {
      // Insert new
      const { id, created_at, updated_at, ...insertData } = task as any;
      const { data, error } = await supabase
        .from('production_tasks')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, task: data as unknown as ProductionTask };
    }
  } catch (err) {
    console.error('[ProductionTasks] Upsert failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Batch insert multiple tasks at once (e.g. from order selection).
 */
export async function bulkInsertTasks(
  tasks: ProductionTaskInsert[]
): Promise<{ success: boolean; tasks?: ProductionTask[]; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  if (tasks.length === 0) {
    return { success: true, tasks: [] };
  }

  try {
    const { data, error } = await supabase
      .from('production_tasks')
      .insert(tasks)
      .select();

    if (error) throw error;
    return { success: true, tasks: (data || []) as unknown as ProductionTask[] };
  } catch (err) {
    console.error('[ProductionTasks] Bulk insert failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Hard-delete a task by ID.
 */
export async function deleteTask(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('production_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[ProductionTasks] Delete failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Toggle task completion status.
 */
export async function toggleTaskComplete(
  id: string,
  isCompleted: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('production_tasks')
      .update({ is_completed: isCompleted })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[ProductionTasks] Toggle complete failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Batch update sort_order for reordering.
 */
export async function updateTaskOrder(
  taskOrders: { id: string; sort_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Update each task's sort_order individually (Supabase doesn't support bulk update with different values)
    const updates = taskOrders.map(({ id, sort_order }) =>
      supabase!
        .from('production_tasks')
        .update({ sort_order })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);
    if (failed?.error) throw failed.error;

    return { success: true };
  } catch (err) {
    console.error('[ProductionTasks] Update order failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Delete all tasks for a given date (used before re-saving a full schedule).
 */
export async function clearTasksForDate(
  date: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('production_tasks')
      .delete()
      .eq('schedule_date', date);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[ProductionTasks] Clear date failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
