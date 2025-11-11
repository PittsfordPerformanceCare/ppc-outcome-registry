import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, TrendingUp, TrendingDown, Mail, Eye, MousePointerClick, Download, FileSpreadsheet } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface RecipientMetrics {
  email: string;
  totalReceived: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  lastReceived: string;
}

export function RecipientEngagementAnalytics() {
  const [recipients, setRecipients] = useState<RecipientMetrics[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<RecipientMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof RecipientMetrics>("openRate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  useEffect(() => {
    loadRecipientAnalytics();
  }, []);

  useEffect(() => {
    filterAndSortRecipients();
  }, [recipients, searchQuery, sortBy, sortOrder]);

  const loadRecipientAnalytics = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('comparison_report_deliveries')
        .select('*')
        .eq('status', 'success')
        .order('sent_at', { ascending: false });

      if (error) throw error;

      // Aggregate by recipient email
      const recipientMap = new Map<string, RecipientMetrics>();

      (data || []).forEach((delivery: any) => {
        delivery.recipient_emails.forEach((email: string) => {
          const existing = recipientMap.get(email) || {
            email,
            totalReceived: 0,
            totalOpened: 0,
            totalClicked: 0,
            openRate: 0,
            clickRate: 0,
            lastReceived: delivery.sent_at,
          };

          existing.totalReceived += 1;
          if (delivery.open_count > 0) existing.totalOpened += 1;
          if (delivery.click_count > 0) existing.totalClicked += 1;
          
          // Update last received if this is more recent
          if (new Date(delivery.sent_at) > new Date(existing.lastReceived)) {
            existing.lastReceived = delivery.sent_at;
          }

          recipientMap.set(email, existing);
        });
      });

      // Calculate rates
      const recipientsArray = Array.from(recipientMap.values()).map(recipient => ({
        ...recipient,
        openRate: recipient.totalReceived > 0 
          ? Math.round((recipient.totalOpened / recipient.totalReceived) * 100) 
          : 0,
        clickRate: recipient.totalReceived > 0 
          ? Math.round((recipient.totalClicked / recipient.totalReceived) * 100) 
          : 0,
      }));

      setRecipients(recipientsArray);
    } catch (error) {
      console.error('Error loading recipient analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRecipients = () => {
    let filtered = [...recipients];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    setFilteredRecipients(filtered);
  };

  const handleSort = (column: keyof RecipientMetrics) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getEngagementLevel = (openRate: number): { label: string; color: string } => {
    if (openRate >= 75) return { label: 'High', color: 'bg-green-500' };
    if (openRate >= 50) return { label: 'Medium', color: 'bg-yellow-500' };
    if (openRate >= 25) return { label: 'Low', color: 'bg-orange-500' };
    return { label: 'Very Low', color: 'bg-red-500' };
  };

  const exportToCSV = () => {
    try {
      const headers = [
        'Recipient Email',
        'Reports Received',
        'Reports Opened',
        'Open Rate (%)',
        'Reports Clicked',
        'Click Rate (%)',
        'Engagement Level',
        'Last Received'
      ];

      const rows = filteredRecipients.map(r => {
        const engagement = getEngagementLevel(r.openRate);
        return [
          r.email,
          r.totalReceived,
          r.totalOpened,
          r.openRate,
          r.totalClicked,
          r.clickRate,
          engagement.label,
          format(new Date(r.lastReceived), 'yyyy-MM-dd HH:mm:ss')
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `recipient-engagement-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: "Recipient engagement data has been exported to CSV",
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Export failed",
        description: "Failed to export recipient engagement data",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = async () => {
    try {
      // Create a simple HTML table that Excel can open
      const headers = [
        'Recipient Email',
        'Reports Received',
        'Reports Opened',
        'Open Rate (%)',
        'Reports Clicked',
        'Click Rate (%)',
        'Engagement Level',
        'Last Received'
      ];

      const rows = filteredRecipients.map(r => {
        const engagement = getEngagementLevel(r.openRate);
        return [
          r.email,
          r.totalReceived,
          r.totalOpened,
          r.openRate,
          r.totalClicked,
          r.clickRate,
          engagement.label,
          format(new Date(r.lastReceived), 'yyyy-MM-dd HH:mm:ss')
        ];
      });

      const htmlContent = `
        <html xmlns:x="urn:schemas-microsoft-com:office:excel">
          <head>
            <meta charset="UTF-8">
            <style>
              table { border-collapse: collapse; width: 100%; }
              th { background-color: #4472C4; color: white; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
              td { padding: 8px; border: 1px solid #ddd; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <table>
              <thead>
                <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `recipient-engagement-${format(new Date(), 'yyyy-MM-dd')}.xls`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: "Recipient engagement data has been exported to Excel",
      });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast({
        title: "Export failed",
        description: "Failed to export recipient engagement data",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (recipients.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No recipient data available</p>
        <p className="text-sm text-muted-foreground mt-1">
          Send comparison reports to see recipient engagement analytics
        </p>
      </Card>
    );
  }

  const topEngaged = filteredRecipients.slice(0, 3);
  const avgOpenRate = recipients.reduce((sum, r) => sum + r.openRate, 0) / recipients.length;
  const avgClickRate = recipients.reduce((sum, r) => sum + r.clickRate, 0) / recipients.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Recipient Engagement Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Track which recipients engage most with comparison reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={exportToExcel}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Top Recipients Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topEngaged.map((recipient, index) => {
          const engagement = getEngagementLevel(recipient.openRate);
          return (
            <Card key={recipient.email} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${engagement.color}`} />
                  <Badge variant="outline" className="text-xs">
                    #{index + 1} Top Engaged
                  </Badge>
                </div>
                <Badge variant="secondary">{engagement.label}</Badge>
              </div>
              <p className="font-medium text-sm mb-2 truncate" title={recipient.email}>
                {recipient.email}
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Open Rate:</span>
                  <span className="font-semibold text-foreground">{recipient.openRate}%</span>
                </div>
                <Progress value={recipient.openRate} className="h-1.5" />
                <div className="flex items-center justify-between mt-2">
                  <span>Reports:</span>
                  <span className="font-semibold text-foreground">{recipient.totalReceived}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Overall Stats */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total Recipients</p>
              <p className="text-xl font-bold">{recipients.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Open Rate</p>
              <p className="text-xl font-bold">{Math.round(avgOpenRate)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MousePointerClick className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Click Rate</p>
              <p className="text-xl font-bold">{Math.round(avgClickRate)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total Sent</p>
              <p className="text-xl font-bold">
                {recipients.reduce((sum, r) => sum + r.totalReceived, 0)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Search and Table */}
      <Card className="p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipients by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    Recipient Email
                    {sortBy === 'email' && (
                      sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('totalReceived')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Reports Received
                    {sortBy === 'totalReceived' && (
                      sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('totalOpened')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Opened
                    {sortBy === 'totalOpened' && (
                      sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('openRate')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Open Rate
                    {sortBy === 'openRate' && (
                      sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('totalClicked')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Clicked
                    {sortBy === 'totalClicked' && (
                      sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('clickRate')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Click Rate
                    {sortBy === 'clickRate' && (
                      sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Engagement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecipients.map((recipient) => {
                const engagement = getEngagementLevel(recipient.openRate);
                return (
                  <TableRow key={recipient.email}>
                    <TableCell className="font-medium">{recipient.email}</TableCell>
                    <TableCell className="text-right">{recipient.totalReceived}</TableCell>
                    <TableCell className="text-right">{recipient.totalOpened}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-semibold">{recipient.openRate}%</span>
                        <Progress value={recipient.openRate} className="h-1.5 w-16" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{recipient.totalClicked}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-semibold">{recipient.clickRate}%</span>
                        <Progress value={recipient.clickRate} className="h-1.5 w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={`${engagement.color} text-white`}
                      >
                        {engagement.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredRecipients.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recipients found matching "{searchQuery}"</p>
          </div>
        )}
      </Card>
    </div>
  );
}
