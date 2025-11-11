import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ExternalLink, Award, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Episode {
  id: string;
  patient_name: string;
  region: string;
  date_of_service: string;
  diagnosis: string;
  discharge_date?: string;
  mcidAchieved?: boolean;
  improvement?: number;
  baselineScore?: number;
  finalScore?: number;
  indexType?: string;
}

interface MetricDrillDownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  episodes: Episode[];
  metricType: 'mcid' | 'active' | 'completed' | 'regional' | 'outcome' | 'generic';
}

export function MetricDrillDownDialog({
  open,
  onOpenChange,
  title,
  description,
  episodes,
  metricType
}: MetricDrillDownDialogProps) {
  const navigate = useNavigate();

  const handleViewEpisode = (episodeId: string) => {
    navigate(`/episode-summary?id=${episodeId}`);
    onOpenChange(false);
  };

  const renderMCIDIndicator = (episode: Episode) => {
    if (!episode.mcidAchieved && episode.mcidAchieved !== false) return null;
    
    return (
      <div className="flex items-center gap-2">
        {episode.mcidAchieved ? (
          <>
            <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
            <Badge variant="default" className="bg-green-600 dark:bg-green-700">
              MCID Achieved
            </Badge>
          </>
        ) : (
          <Badge variant="secondary">No MCID</Badge>
        )}
      </div>
    );
  };

  const renderImprovement = (episode: Episode) => {
    if (episode.improvement === undefined) return null;
    
    const isPositive = episode.improvement > 0;
    return (
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
        )}
        <span className={isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
          {episode.improvement > 0 ? '+' : ''}{episode.improvement.toFixed(1)}
        </span>
      </div>
    );
  };

  const renderScores = (episode: Episode) => {
    if (!episode.baselineScore && !episode.finalScore) return null;
    
    return (
      <div className="text-sm">
        {episode.indexType && <div className="font-medium text-muted-foreground mb-1">{episode.indexType}</div>}
        <div className="flex items-center gap-2">
          {episode.baselineScore !== undefined && (
            <span className="text-muted-foreground">
              Baseline: <span className="font-medium text-foreground">{episode.baselineScore}</span>
            </span>
          )}
          {episode.finalScore !== undefined && (
            <span className="text-muted-foreground">
              Final: <span className="font-medium text-foreground">{episode.finalScore}</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {episodes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No episodes found for this metric</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Date of Service</TableHead>
                  {metricType === 'completed' && <TableHead>Discharge Date</TableHead>}
                  {(metricType === 'mcid' || metricType === 'outcome') && (
                    <>
                      <TableHead>Scores</TableHead>
                      <TableHead>Improvement</TableHead>
                      <TableHead>MCID Status</TableHead>
                    </>
                  )}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {episodes.map((episode) => (
                  <TableRow key={episode.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{episode.patient_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{episode.region}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={episode.diagnosis}>
                      {episode.diagnosis || 'Not specified'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(episode.date_of_service), 'MMM dd, yyyy')}
                    </TableCell>
                    {metricType === 'completed' && (
                      <TableCell>
                        {episode.discharge_date 
                          ? format(new Date(episode.discharge_date), 'MMM dd, yyyy')
                          : '-'
                        }
                      </TableCell>
                    )}
                    {(metricType === 'mcid' || metricType === 'outcome') && (
                      <>
                        <TableCell>{renderScores(episode)}</TableCell>
                        <TableCell>{renderImprovement(episode)}</TableCell>
                        <TableCell>{renderMCIDIndicator(episode)}</TableCell>
                      </>
                    )}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewEpisode(episode.id)}
                        className="gap-2"
                      >
                        <span>View</span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {episodes.length} {episodes.length === 1 ? 'episode' : 'episodes'}
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
