import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type TaskType = 
  | "CALL_BACK" 
  | "EMAIL_REPLY" 
  | "IMAGING_REPORT" 
  | "PATIENT_MESSAGE" 
  | "LETTER" 
  | "OTHER_ACTION";

export type TaskSource = "ADMIN" | "CLINICIAN" | "PATIENT_PORTAL";
export type TaskPriority = "HIGH" | "NORMAL";
export type TaskStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED";

export interface CommunicationTask {
  id: string;
  patient_id: string | null;
  patient_name: string | null;
  episode_id: string | null;
  assigned_clinician_id: string;
  type: TaskType;
  source: TaskSource;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  letter_subtype: string | null;
  letter_file_url: string | null;
  patient_message_id: string | null;
  // Joined data
  episode?: {
    region: string;
    episode_type: string;
  } | null;
  clinician?: {
    full_name: string;
  } | null;
}

export interface CreateTaskInput {
  patient_id?: string | null;
  patient_name?: string | null;
  episode_id?: string | null;
  assigned_clinician_id: string;
  type: TaskType;
  source: TaskSource;
  description: string;
  priority?: TaskPriority;
  due_at?: string;
  letter_subtype?: string | null;
}

export function useCommunicationTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch tasks for the current clinician
  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ["communication-tasks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("communication_tasks")
        .select("*")
        .or(`assigned_clinician_id.eq.${user.id},created_by.eq.${user.id}`)
        .order("due_at", { ascending: true });

      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }

      return (data || []) as CommunicationTask[];
    },
    enabled: !!user?.id,
  });

  // Filter tasks by status
  const openTasks = tasks.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");
  
  // Calculate overdue tasks
  const overdueTasks = openTasks.filter(t => new Date(t.due_at) < new Date());
  const todayTasks = openTasks.filter(t => {
    const dueDate = new Date(t.due_at);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  });
  const thisWeekTasks = openTasks.filter(t => {
    const dueDate = new Date(t.due_at);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= weekFromNow;
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data, error } = await supabase
        .from("communication_tasks")
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-tasks"] });
      toast.success("Task created successfully");
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    },
  });

  // Update task status mutation
  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const updates: Record<string, unknown> = { status };
      if (status === "COMPLETED") {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("communication_tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-tasks"] });
      toast.success("Task updated");
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    },
  });

  // Mark task as completed
  const markCompleted = useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from("communication_tasks")
        .update({
          status: "COMPLETED",
          completed_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-tasks"] });
      toast.success("Task completed!");
    },
    onError: (error) => {
      console.error("Error completing task:", error);
      toast.error("Failed to complete task");
    },
  });

  return {
    tasks,
    openTasks,
    completedTasks,
    overdueTasks,
    todayTasks,
    thisWeekTasks,
    isLoading,
    refetch,
    createTask,
    updateTaskStatus,
    markCompleted,
    openCount: openTasks.length,
    overdueCount: overdueTasks.length,
  };
}

// Hook to fetch all clinicians (for admin task assignment)
export function useClinicians() {
  return useQuery({
    queryKey: ["clinicians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

      if (error) throw error;
      return data || [];
    },
  });
}
