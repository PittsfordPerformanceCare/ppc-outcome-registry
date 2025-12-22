import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, AlertCircle, ShieldCheck, FileText } from 'lucide-react';

export function InterpretationPanel() {
  return (
    <Card className="border-info/50 bg-info-soft/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-info">
          <Info className="h-5 w-5" />
          Interpretation Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 text-sm">
          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 text-info mt-0.5 shrink-0" />
            <p>
              <strong>All outcomes are Care Target–level baseline → discharge comparisons.</strong>{' '}
              Each row represents a single complaint, not an entire episode.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <p>
              <strong>Episode metrics are descriptive and not outcome-scored.</strong>{' '}
              Episodes aggregate Care Target counts; they do not compute overall "success."
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p>
              <strong>MCID is an interpretive reference and may vary by population.</strong>{' '}
              Thresholds are guideline-based and should not be treated as universal clinical standards.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <p>
              <strong>Default views exclude integrity overrides.</strong>{' '}
              Override records are available via filter but are not included in primary metrics by default.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
