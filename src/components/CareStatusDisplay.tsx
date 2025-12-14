import { useCareCoordinationPause, PAUSE_REASON_LABELS } from '@/hooks/useCareCoordinationPause';

interface CareStatusDisplayProps {
  episodeId: string;
}

export function CareStatusDisplay({ episodeId }: CareStatusDisplayProps) {
  const { activePause, loading } = useCareCoordinationPause(episodeId);

  if (loading) {
    return (
      <div>
        <p className="text-xs text-slate-500">Care status</p>
        <p className="text-lg font-semibold text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!activePause) {
    return (
      <div>
        <p className="text-xs text-slate-500">Care status</p>
        <p className="text-lg font-semibold text-slate-900">Active</p>
      </div>
    );
  }

  return (
    <div className="col-span-2">
      <p className="text-xs text-slate-500">Care status</p>
      <p className="text-lg font-semibold text-amber-700">Care coordination pause</p>
      <p className="text-sm text-slate-600 mt-1">
        PPC remains the coordinating provider. Episode discharge is completed by PPC when the patient returns.
      </p>
      <p className="text-sm text-slate-700 mt-1 font-medium">
        {PAUSE_REASON_LABELS[activePause.pause_reason]}
      </p>
    </div>
  );
}
