import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, Loader2, PlayCircle, CheckCircle, XCircle } from "lucide-react";

export function ReminderStatusPanel() {
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleManualTrigger = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-appointment-reminders', {
        body: { manual: true }
      });

      if (error) throw error;

      setLastResult(data);
      
      if (data.processed > 0) {
        toast.success(`Sent ${data.processed} appointment reminder${data.processed !== 1 ? 's' : ''}!`);
      } else {
        toast.info("No appointments found that need reminders at this time.");
      }
    } catch (error: any) {
      console.error("Error triggering reminders:", error);
      toast.error(`Failed to send reminders: ${error.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-purple-500" />
          Appointment Reminder Status
        </CardTitle>
        <CardDescription>
          Automated reminders run hourly. You can manually trigger a check below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Scheduled Task</p>
            <p className="text-xs text-muted-foreground">Runs every hour at :00</p>
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>

        {lastResult && (
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Last Manual Check:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2">
                  {lastResult.success ? (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Success
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Processed:</span>
                <span className="ml-2 font-semibold">{lastResult.processed || 0}</span>
              </div>
            </div>
            {lastResult.message && (
              <p className="text-xs text-muted-foreground">{lastResult.message}</p>
            )}
          </div>
        )}

        <Button 
          onClick={handleManualTrigger} 
          disabled={running}
          variant="outline"
          className="w-full"
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking for reminders...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 mr-2" />
              Run Manual Check Now
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          This will check for appointments scheduled within the configured reminder window and send notifications if needed.
        </p>
      </CardContent>
    </Card>
  );
}
