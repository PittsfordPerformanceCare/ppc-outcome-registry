import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Mail, Trash2, Eye, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useHaptics } from "@/hooks/useHaptics";

interface Episode {
  id: string;
  patient_name: string;
  region: string;
  date_of_service: string;
  discharge_date?: string;
  diagnosis?: string;
  episode_type?: string;
}

interface EpisodeCardWithSwipeProps {
  episode: Episode;
  isSelected: boolean;
  onSelect: () => void;
  onInvite: () => void;
  onDelete: () => void;
}

export function EpisodeCardWithSwipe({
  episode,
  isSelected,
  onSelect,
  onInvite,
  onDelete,
}: EpisodeCardWithSwipeProps) {
  const { light, warning } = useHaptics();
  const [swipeAction, setSwipeAction] = useState<"delete" | "view" | null>(null);

  const { elementRef, dragOffset, isDragging } = useSwipeGesture({
    onSwipeLeft: () => {
      warning();
      setSwipeAction("delete");
      setTimeout(() => {
        onDelete();
        setSwipeAction(null);
      }, 300);
    },
    onSwipeRight: () => {
      light();
      // Quick action: navigate to details
      window.location.href = `/episode-summary?id=${episode.id}`;
    },
    threshold: 100,
    enabled: true,
  });

  const showDeleteAction = dragOffset.x < -50;
  const showViewAction = dragOffset.x > 50;

  return (
    <div className="relative overflow-hidden">
      {/* Background Actions */}
      {showDeleteAction && (
        <div className="absolute inset-0 bg-destructive/20 flex items-center justify-end px-6">
          <Trash2 className="h-5 w-5 text-destructive" />
        </div>
      )}
      {showViewAction && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-start px-6">
          <Eye className="h-5 w-5 text-primary" />
        </div>
      )}

      {/* Card */}
      <div
        ref={elementRef}
        className="flex items-center gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50 bg-background"
        style={{
          transform: `translateX(${dragOffset.x}px)`,
          opacity: swipeAction ? 0.5 : 1,
          transition: isDragging ? "none" : "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          aria-label={`Select episode ${episode.id}`}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{episode.patient_name}</p>
            <Badge variant="outline" className="text-xs">
              {episode.region}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Episode ID: {episode.id} | Service Date:{" "}
            {format(new Date(episode.date_of_service), "MMM dd, yyyy")}
          </p>
          {episode.diagnosis && (
            <p className="text-sm text-muted-foreground">
              Diagnosis: {episode.diagnosis}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {episode.discharge_date && (
            <Badge className="badge-complete">Completed</Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onInvite();
            }}
            title="Send patient invitation"
          >
            <Mail className="h-4 w-4" />
            Invite Patient
          </Button>
          {episode.episode_type === 'Neurology' && (
            <Link to={`/neuro-exam?episode=${episode.id}`} onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="outline" className="gap-1">
                <Activity className="h-4 w-4" />
                Neuro Exam
              </Button>
            </Link>
          )}
          <Link to={`/episode-summary?id=${episode.id}`} onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </Link>
          {!episode.discharge_date && (
            <Link to={`/follow-up?episode=${episode.id}`} onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="outline">
                Schedule Follow-up
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
