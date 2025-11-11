import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Calendar as CalendarIcon, User, FileText, ChevronDown, ChevronUp, Download, FileSpreadsheet, X, CalendarRange } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MergeAuditLog {
  id: string;
  created_at: string;
  user_id: string;
  old_data: {
    merged_patients: Array<{
      patient_name: string;
      date_of_birth: string;
      episode_ids: string[];
      episode_count: number;
    }>;
    total_episodes_affected: number;
  };
  new_data: {
    primary_patient: {
      patient_name: string;
      date_of_birth: string;
      total_episodes: number;
    };
    episode_ids_updated: string[];
  };
}

interface UserProfile {
  full_name: string;
  email: string;
}

export function PatientMergeHistory() {
  const [mergeHistory, setMergeHistory] = useState<MergeAuditLog[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  useEffect(() => {
    loadMergeHistory();
  }, []);

  const loadMergeHistory = async () => {
    setIsLoading(true);
    try {
      const { data: logs, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("action", "patient_merge")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const typedLogs = logs as unknown as MergeAuditLog[];
      setMergeHistory(typedLogs);

      // Load user profiles for all unique user IDs
      const userIds = [...new Set(logs?.map((log) => log.user_id) || [])];
      if (userIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        if (profileError) throw profileError;

        const profileMap: Record<string, UserProfile> = {};
        profiles?.forEach((profile) => {
          profileMap[profile.id] = {
            full_name: profile.full_name || profile.email || "Unknown User",
            email: profile.email || "",
          };
        });
        setUserProfiles(profileMap);
      }
    } catch (error) {
      console.error("Error loading merge history:", error);
      toast.error("Failed to load merge history");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatDOB = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Filter merge history based on date range
  const filteredMergeHistory = mergeHistory.filter(log => {
    const logDate = new Date(log.created_at);
    
    if (dateFrom && logDate < dateFrom) {
      return false;
    }
    
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (logDate > endOfDay) {
        return false;
      }
    }
    
    return true;
  });

  const clearDateFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasDateFilters = dateFrom || dateTo;

  const exportToCSV = () => {
    try {
      const dataToExport = filteredMergeHistory;
      
      if (dataToExport.length === 0) {
        toast.error("No merge history to export");
        return;
      }

      // CSV header
      const headers = [
        "Merge Date/Time",
        "Performed By",
        "Primary Patient Name",
        "Primary Patient DOB",
        "Merged Patient Names",
        "Total Episodes Merged",
        "Episode IDs Updated"
      ];

      // CSV rows
      const rows = dataToExport.map(log => [
        formatDate(log.created_at),
        userProfiles[log.user_id]?.full_name || "Unknown User",
        log.new_data.primary_patient.patient_name,
        formatDOB(log.new_data.primary_patient.date_of_birth),
        log.old_data.merged_patients.map(p => p.patient_name).join("; "),
        log.old_data.total_episodes_affected.toString(),
        log.new_data.episode_ids_updated.join("; ")
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      
      const dateRangeSuffix = hasDateFilters 
        ? `_${dateFrom ? format(dateFrom, 'yyyy-MM-dd') : 'all'}_to_${dateTo ? format(dateTo, 'yyyy-MM-dd') : 'now'}`
        : `_${new Date().toISOString().split('T')[0]}`;
      
      link.setAttribute("download", `patient_merge_history${dateRangeSuffix}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${dataToExport.length} merge records to CSV`);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast.error("Failed to export to CSV");
    }
  };

  const exportToPDF = () => {
    try {
      const dataToExport = filteredMergeHistory;
      
      if (dataToExport.length === 0) {
        toast.error("No merge history to export");
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Title
      doc.setFontSize(18);
      doc.text("Patient Merge History - Audit Report", pageWidth / 2, 15, { align: "center" });
      
      // Subtitle with date and filter info
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 22, { align: "center" });
      
      if (hasDateFilters) {
        const filterText = `Filter: ${dateFrom ? format(dateFrom, 'MMM dd, yyyy') : 'All'} to ${dateTo ? format(dateTo, 'MMM dd, yyyy') : 'Now'}`;
        doc.text(filterText, pageWidth / 2, 27, { align: "center" });
      }
      
      // Summary statistics
      const summaryY = hasDateFilters ? 35 : 32;
      doc.setFontSize(12);
      doc.text("Summary", 14, summaryY);
      doc.setFontSize(10);
      doc.text(`Total Merges: ${dataToExport.length}`, 14, summaryY + 6);
      const totalEpisodes = dataToExport.reduce((sum, log) => sum + log.old_data.total_episodes_affected, 0);
      doc.text(`Total Episodes Affected: ${totalEpisodes}`, 14, summaryY + 12);

      // Table data
      const tableData = dataToExport.map(log => [
        formatDate(log.created_at),
        userProfiles[log.user_id]?.full_name || "Unknown",
        log.new_data.primary_patient.patient_name,
        log.old_data.merged_patients.map(p => p.patient_name).join(", "),
        log.old_data.total_episodes_affected.toString()
      ]);

      // Add table
      const tableStartY = hasDateFilters ? 55 : 52;
      autoTable(doc, {
        startY: tableStartY,
        head: [["Date/Time", "User", "Primary Patient", "Merged Patients", "Episodes"]],
        body: tableData,
        theme: "striped",
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 30 },
          2: { cellWidth: 35 },
          3: { cellWidth: 60 },
          4: { cellWidth: 20 }
        },
        margin: { top: tableStartY }
      });

      // Add page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Save PDF
      const dateRangeSuffix = hasDateFilters 
        ? `_${dateFrom ? format(dateFrom, 'yyyy-MM-dd') : 'all'}_to_${dateTo ? format(dateTo, 'yyyy-MM-dd') : 'now'}`
        : `_${new Date().toISOString().split('T')[0]}`;
      
      doc.save(`patient_merge_history${dateRangeSuffix}.pdf`);
      
      toast.success(`Exported ${dataToExport.length} merge records to PDF`);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Failed to export to PDF");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Patient Merge History
            </CardTitle>
            <CardDescription>
              Complete audit trail of all patient record merges
            </CardDescription>
          </div>
          {mergeHistory.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Filter */}
        {mergeHistory.length > 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-end gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <label className="text-sm font-medium">From Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 min-w-[200px] space-y-2">
                  <label className="text-sm font-medium">To Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        disabled={(date) => dateFrom ? date < dateFrom : false}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {hasDateFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateFilters}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>

              {hasDateFilters && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarRange className="h-4 w-4" />
                  <span>
                    Showing {filteredMergeHistory.length} of {mergeHistory.length} merge records
                    {dateFrom && ` from ${format(dateFrom, "MMM dd, yyyy")}`}
                    {dateTo && ` to ${format(dateTo, "MMM dd, yyyy")}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading merge history...
          </div>
        ) : mergeHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No patient merges have been performed yet
          </div>
        ) : filteredMergeHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No merge records found for the selected date range
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredMergeHistory.map((log) => (
                <Card key={log.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          Merged into: {log.new_data.primary_patient.patient_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDate(log.created_at)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          {userProfiles[log.user_id]?.full_name || "Unknown User"}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {log.old_data.total_episodes_affected} episodes merged
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            View Details
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 pt-4">
                        {/* Primary Patient Info */}
                        <div className="rounded-lg border bg-primary/5 p-3">
                          <h4 className="font-semibold text-sm mb-2">Primary Patient (Kept)</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Name:</span>{" "}
                              {log.new_data.primary_patient.patient_name}
                            </p>
                            <p>
                              <span className="font-medium">DOB:</span>{" "}
                              {formatDOB(log.new_data.primary_patient.date_of_birth)}
                            </p>
                            <p>
                              <span className="font-medium">Total Episodes:</span>{" "}
                              {log.new_data.primary_patient.total_episodes}
                            </p>
                          </div>
                        </div>

                        {/* Merged Patients */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">
                            Merged Records ({log.old_data.merged_patients.length})
                          </h4>
                          {log.old_data.merged_patients.map((patient, index) => (
                            <div
                              key={index}
                              className="rounded-lg border bg-muted/50 p-3 text-sm"
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <p className="font-medium">{patient.patient_name}</p>
                                  <p className="text-muted-foreground">
                                    DOB: {formatDOB(patient.date_of_birth)}
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  {patient.episode_count} episode{patient.episode_count !== 1 ? "s" : ""}
                                </Badge>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                Episode IDs: {patient.episode_ids.slice(0, 3).join(", ")}
                                {patient.episode_ids.length > 3 && ` +${patient.episode_ids.length - 3} more`}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Episode IDs Updated */}
                        <div className="rounded-lg border bg-muted/50 p-3">
                          <h4 className="font-semibold text-sm mb-2">
                            Episodes Updated ({log.new_data.episode_ids_updated.length})
                          </h4>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {log.new_data.episode_ids_updated.slice(0, 5).map((id) => (
                              <div key={id} className="font-mono">
                                {id}
                              </div>
                            ))}
                            {log.new_data.episode_ids_updated.length > 5 && (
                              <div className="text-center pt-1">
                                +{log.new_data.episode_ids_updated.length - 5} more episodes
                              </div>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
