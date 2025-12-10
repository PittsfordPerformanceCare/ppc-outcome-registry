import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Search, 
  ArrowRight, 
  Plus,
  Calendar,
  User,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

const AdminShellEpisodes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "discharged">("all");

  // Fetch episodes
  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ["admin-episodes", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("episodes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (statusFilter === "active") {
        query = query.is("discharge_date", null);
      } else if (statusFilter === "discharged") {
        query = query.not("discharge_date", "is", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Filter by search
  const filteredEpisodes = episodes.filter((ep) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ep.patient_name?.toLowerCase().includes(query) ||
      ep.id?.toLowerCase().includes(query) ||
      ep.clinician?.toLowerCase().includes(query) ||
      ep.region?.toLowerCase().includes(query)
    );
  });

  // Stats
  const activeCount = episodes.filter((ep) => !ep.discharge_date).length;
  const dischargedCount = episodes.filter((ep) => ep.discharge_date).length;
  const pendingFollowup = episodes.filter((ep) => !ep.discharge_date && ep.followup_date).length;

  const getStatusBadge = (episode: any) => {
    if (episode.discharge_date) {
      return <Badge variant="secondary">Discharged</Badge>;
    }
    if (episode.current_status === "pending") {
      return <Badge variant="outline">Pending</Badge>;
    }
    return <Badge>Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Episode Management
          </h1>
          <p className="text-muted-foreground">
            View and manage patient episodes, discharges, and outcomes
          </p>
        </div>
        <Button asChild>
          <Link to="/new-episode">
            <Plus className="mr-2 h-4 w-4" />
            New Episode
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Episodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{episodes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Discharged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dischargedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Pending Follow-up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingFollowup}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Episodes</CardTitle>
              <CardDescription>Search and filter episodes</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search episodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({episodes.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
              <TabsTrigger value="discharged">Discharged ({dischargedCount})</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredEpisodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No episodes found matching your criteria.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Clinician</TableHead>
                      <TableHead>Date of Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEpisodes.slice(0, 50).map((episode) => (
                      <TableRow key={episode.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {episode.patient_name}
                          </div>
                        </TableCell>
                        <TableCell>{episode.region}</TableCell>
                        <TableCell>{episode.clinician || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(episode.date_of_service), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(episode)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/episode/${episode.id}`}>
                              View
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Episode Tools</CardTitle>
          <CardDescription>Access episode-related functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/followup">Follow-up Queue</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/discharge">Discharge Workflow</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/pcp-summary">PCP Summaries</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/admin/episode-integrity">Integrity Check</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminShellEpisodes;
