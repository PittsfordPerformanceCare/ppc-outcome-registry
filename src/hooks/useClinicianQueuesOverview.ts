import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClinicianQueueSummary {
  clinicianId: string;
  clinicianName: string;
  openCount: number;
  overdueCount: number;
  completedLast7Days: number;
}

export interface UrgentTask {
  id: string;
  clinicianId: string;
  clinicianName: string;
  patientName: string | null;
  type: string;
  dueAt: string;
  status: string;
  priority: string;
  isOverdue: boolean;
}

export interface RecentlyCompletedTask {
  id: string;
  clinicianId: string;
  clinicianName: string;
  patientName: string | null;
  type: string;
  completedAt: string;
}

interface UseClinicianQueuesOverviewReturn {
  clinicianSummaries: ClinicianQueueSummary[];
  urgentTasks: UrgentTask[];
  recentlyCompleted: RecentlyCompletedTask[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClinicianQueuesOverview(): UseClinicianQueuesOverviewReturn {
  const [clinicianSummaries, setClinicianSummaries] = useState<ClinicianQueueSummary[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<UrgentTask[]>([]);
  const [recentlyCompleted, setRecentlyCompleted] = useState<RecentlyCompletedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date().toISOString();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Fetch all clinicians
      const { data: clinicians, error: cliniciansError } = await supabase
        .from('profiles')
        .select('id, full_name, clinician_name')
        .not('clinician_name', 'is', null);

      if (cliniciansError) throw cliniciansError;

      // Fetch all communication tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('communication_tasks')
        .select('*')
        .order('due_at', { ascending: true });

      if (tasksError) throw tasksError;

      // Build clinician summaries
      const summaries: ClinicianQueueSummary[] = (clinicians || []).map(clinician => {
        const clinicianTasks = (tasks || []).filter(t => t.assigned_clinician_id === clinician.id);
        
        const openTasks = clinicianTasks.filter(t => 
          t.status === 'OPEN' || t.status === 'IN_PROGRESS'
        );
        
        const overdueTasks = openTasks.filter(t => 
          new Date(t.due_at) < new Date(now)
        );
        
        const completedRecently = clinicianTasks.filter(t => 
          t.status === 'COMPLETED' && 
          t.completed_at && 
          new Date(t.completed_at) >= new Date(sevenDaysAgo)
        );

        return {
          clinicianId: clinician.id,
          clinicianName: clinician.clinician_name || clinician.full_name || 'Unknown',
          openCount: openTasks.length,
          overdueCount: overdueTasks.length,
          completedLast7Days: completedRecently.length,
        };
      }).filter(s => s.openCount > 0 || s.completedLast7Days > 0);

      // Build urgent tasks list (overdue OR high priority, limit 10)
      const urgent: UrgentTask[] = (tasks || [])
        .filter(t => {
          const isOpenOrInProgress = t.status === 'OPEN' || t.status === 'IN_PROGRESS';
          const isOverdue = new Date(t.due_at) < new Date(now);
          const isHighPriority = t.priority === 'HIGH';
          return isOpenOrInProgress && (isOverdue || isHighPriority);
        })
        .sort((a, b) => {
          // Overdue first, then by due_at
          const aOverdue = new Date(a.due_at) < new Date(now);
          const bOverdue = new Date(b.due_at) < new Date(now);
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;
          return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
        })
        .slice(0, 10)
        .map(t => {
          const clinician = clinicians?.find(c => c.id === t.assigned_clinician_id);
          return {
            id: t.id,
            clinicianId: t.assigned_clinician_id,
            clinicianName: clinician?.clinician_name || clinician?.full_name || 'Unknown',
            patientName: t.patient_name,
            type: t.type,
            dueAt: t.due_at,
            status: t.status,
            priority: t.priority,
            isOverdue: new Date(t.due_at) < new Date(now),
          };
        });

      // Build recently completed list (last 24 hours, limit 10)
      const completed: RecentlyCompletedTask[] = (tasks || [])
        .filter(t => 
          t.status === 'COMPLETED' && 
          t.completed_at && 
          new Date(t.completed_at) >= new Date(twentyFourHoursAgo)
        )
        .sort((a, b) => 
          new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
        )
        .slice(0, 10)
        .map(t => {
          const clinician = clinicians?.find(c => c.id === t.assigned_clinician_id);
          return {
            id: t.id,
            clinicianId: t.assigned_clinician_id,
            clinicianName: clinician?.clinician_name || clinician?.full_name || 'Unknown',
            patientName: t.patient_name,
            type: t.type,
            completedAt: t.completed_at!,
          };
        });

      setClinicianSummaries(summaries);
      setUrgentTasks(urgent);
      setRecentlyCompleted(completed);
    } catch (err) {
      console.error('Error fetching clinician queues overview:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    clinicianSummaries,
    urgentTasks,
    recentlyCompleted,
    loading,
    error,
    refetch: fetchData,
  };
}
