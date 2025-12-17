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
  | "OTHER_ACTION"
  // Admin task types
  | "PATIENT_CALLBACK"
  | "PATIENT_EMAIL_RESPONSE"
  | "PORTAL_MESSAGE_RESPONSE"
  | "RESEND_INTAKE_FORMS"
  | "FOLLOWUP_INCOMPLETE_FORMS"
  | "SEND_RECEIPT"
  | "ORDER_IMAGING"
  | "SCHEDULE_APPOINTMENT"
  | "CONFIRM_APPOINTMENT"
  | "REQUEST_OUTSIDE_RECORDS"
  | "SEND_RECORDS_TO_PATIENT"
  | "UPDATE_PATIENT_CONTACT"
  | "DOCUMENT_PATIENT_REQUEST";

export type TaskSource = "ADMIN" | "CLINICIAN" | "PATIENT_PORTAL";
export type TaskPriority = "HIGH" | "NORMAL";
export type TaskStatus = "OPEN" | "IN_PROGRESS" | "WAITING_ON_CLINICIAN" | "WAITING_ON_PATIENT" | "BLOCKED" | "COMPLETED" | "CANCELLED";
export type TaskCategory = "CLINICAL_EXECUTION" | "ADMIN_EXECUTION" | "COORDINATION";
export type TaskOwnerType = "ADMIN" | "CLINICIAN";

export interface CommunicationTask {
  id: string;
  patient_id: string | null;
  patient_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  guardian_phone: string | null;
  episode_id: string | null;
  assigned_clinician_id: string;
  type: TaskType;
  source: TaskSource;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  owner_type: TaskOwnerType;
  due_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  letter_subtype: string | null;
  letter_file_url: string | null;
  patient_message_id: string | null;
  cancelled_reason: string | null;
  status_changed_at: string | null;
  admin_acknowledged_at: string | null;
  // Joined data
  episode?: {
    region: string;
    episode_type: string;
  } | null;
  clinician?: {
    full_name: string;
  } | null;
}

export interface TaskNote {
  id: string;
  task_id: string;
  author_id: string;
  note: string;
  created_at: string;
  author?: {
    full_name: string;
  };
}

export interface CreateTaskInput {
  patient_id?: string | null;
  patient_name?: string | null;
  patient_email?: string | null;
  patient_phone?: string | null;
  guardian_phone?: string | null;
  episode_id?: string | null;
  assigned_clinician_id: string;
  type: TaskType;
  source: TaskSource;
  description: string;
  priority?: TaskPriority;
  due_at?: string;
  letter_subtype?: string | null;
  category?: TaskCategory;
  owner_type?: TaskOwnerType;
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
  const openTasks = tasks.filter(t => 
    t.status === "OPEN" || 
    t.status === "IN_PROGRESS" || 
    t.status === "WAITING_ON_CLINICIAN" || 
    t.status === "WAITING_ON_PATIENT" || 
    t.status === "BLOCKED"
  );
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");
  const cancelledTasks = tasks.filter(t => t.status === "CANCELLED");
  
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
          category: input.category || "CLINICAL_EXECUTION",
          owner_type: input.owner_type || "CLINICIAN",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["all-communication-tasks"] });
      toast.success("Task created successfully");
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    },
  });

  // Update task status mutation
  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status, cancelledReason }: { taskId: string; status: TaskStatus; cancelledReason?: string }) => {
      const updates: Record<string, unknown> = { 
        status,
        status_changed_at: new Date().toISOString(),
      };
      if (status === "COMPLETED") {
        updates.completed_at = new Date().toISOString();
      }
      if (status === "CANCELLED" && cancelledReason) {
        updates.cancelled_reason = cancelledReason;
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
      queryClient.invalidateQueries({ queryKey: ["all-communication-tasks"] });
      toast.success("Task updated");
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    },
  });

  // Reassign task mutation
  const reassignTask = useMutation({
    mutationFn: async ({ taskId, newClinicianId }: { taskId: string; newClinicianId: string }) => {
      const { data, error } = await supabase
        .from("communication_tasks")
        .update({
          assigned_clinician_id: newClinicianId,
          status_changed_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["all-communication-tasks"] });
      toast.success("Task reassigned");
    },
    onError: (error) => {
      console.error("Error reassigning task:", error);
      toast.error("Failed to reassign task");
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
          status_changed_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["all-communication-tasks"] });
      toast.success("Task completed!");
    },
    onError: (error) => {
      console.error("Error completing task:", error);
      toast.error("Failed to complete task");
    },
  });

  // Acknowledge completed tasks (admin only)
  const acknowledgeCompletedTasks = useMutation({
    mutationFn: async (taskIds: string[]) => {
      const { error } = await supabase
        .from("communication_tasks")
        .update({
          admin_acknowledged_at: new Date().toISOString(),
        })
        .in("id", taskIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["all-communication-tasks"] });
    },
  });

  return {
    tasks,
    openTasks,
    completedTasks,
    cancelledTasks,
    overdueTasks,
    todayTasks,
    thisWeekTasks,
    isLoading,
    refetch,
    createTask,
    updateTaskStatus,
    reassignTask,
    markCompleted,
    acknowledgeCompletedTasks,
    openCount: openTasks.length,
    overdueCount: overdueTasks.length,
  };
}

// Hook to fetch all tasks (for admin view)
export function useAllCommunicationTasks() {
  return useQuery({
    queryKey: ["all-communication-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communication_tasks")
        .select("*")
        .order("due_at", { ascending: true });

      if (error) throw error;
      return (data || []) as CommunicationTask[];
    },
  });
}

// Hook to fetch task notes
export function useTaskNotes(taskId: string | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["task-notes", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      
      const { data, error } = await supabase
        .from("communication_task_notes")
        .select(`
          *,
          author:profiles!communication_task_notes_author_id_fkey(full_name)
        `)
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching task notes:", error);
        throw error;
      }

      return (data || []) as TaskNote[];
    },
    enabled: !!taskId,
  });

  const addNote = useMutation({
    mutationFn: async ({ taskId, note }: { taskId: string; note: string }) => {
      const { data, error } = await supabase
        .from("communication_task_notes")
        .insert({
          task_id: taskId,
          author_id: user?.id,
          note,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-notes", taskId] });
      toast.success("Note added");
    },
    onError: (error) => {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    },
  });

  return { notes, isLoading, addNote };
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

// Hook to get task summary for dashboard
export function useTaskSummary() {
  const { data: tasks = [], isLoading } = useAllCommunicationTasks();

  const activeTasks = tasks.filter(t => 
    t.status !== "COMPLETED" && t.status !== "CANCELLED"
  );

  const summary = {
    waitingOnClinician: activeTasks.filter(t => t.status === "WAITING_ON_CLINICIAN").length,
    waitingOnPatient: activeTasks.filter(t => t.status === "WAITING_ON_PATIENT").length,
    inProgress: activeTasks.filter(t => t.status === "IN_PROGRESS").length,
    blocked: activeTasks.filter(t => t.status === "BLOCKED").length,
    open: activeTasks.filter(t => t.status === "OPEN").length,
    total: activeTasks.length,
    recentlyCompleted: tasks.filter(t => 
      t.status === "COMPLETED" && 
      !t.admin_acknowledged_at &&
      new Date(t.completed_at || "").getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length,
  };

  return { summary, isLoading };
}
