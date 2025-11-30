import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Search,
  User,
  Printer,
} from "lucide-react";
import { format, isAfter, isBefore, isWithinInterval, parseISO } from "date-fns";
import { toast } from "sonner";
import { EPISODE_STATUS_LABELS, getStatusColor, BODY_REGIONS } from "@/lib/orthoReferralUtils";
import { OrthoReferralPrint } from "@/components/OrthoReferralPrint";

interface OrthoEpisode {
  episode_id: string;
  patient_name: string;
  body_region: string;
  current_status: string;
  referral_date: string;
  ortho_partner_name: string;
  ortho_partner_subspecialty: string;
  expected_return_window_start: string | null;
  expected_return_window_end: string | null;
  surgery_date: string | null;
  surgery_performed: boolean;
  priority_flag: boolean;
  referral_id: string;
}

export default function OrthoReturnDashboard() {
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<OrthoEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterPartner, setFilterPartner] = useState<string>("all");
  const [orthoPartners, setOrthoPartners] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load ortho partners for filter
      const { data: partnersData } = await supabase
        .from("ortho_partners")
        .select("id, name")
        .order("name");
      
      setOrthoPartners(partnersData || []);

      // Load episodes with ortho referrals
      const { data: episodesData, error } = await supabase
        .from("episodes")
        .select(`
          id,
          patient_name,
          body_region,
          region,
          current_status,
          surgery_date,
          surgery_performed,
          referral_id,
          ortho_referrals!episodes_referral_id_fkey (
            id,
            referral_date,
            priority_flag,
            expected_return_window_start,
            expected_return_window_end,
            destination_ortho_id,
            ortho_partners!ortho_referrals_destination_ortho_id_fkey (
              name,
              subspecialty
            )
          )
        `)
        .eq("has_ortho_referral", true)
        .not("referral_id", "is", null)
        .in("current_status", [
          "REFERRED_TO_ORTHO",
          "ORTHO_CONSULT_COMPLETED",
          "SURGERY_COMPLETED",
          "ORTHO_REHAB_IN_PROGRESS",
          "ORTHO_REHAB_COMPLETED",
          "PENDING_RETURN_TO_PPC"
        ]);

      if (error) throw error;

      // Transform data
      const transformed: OrthoEpisode[] = (episodesData || []).map((ep: any) => {
        const referral = ep.ortho_referrals[0];
        const partner = referral?.ortho_partners;
        
        return {
          episode_id: ep.id,
          patient_name: ep.patient_name,
          body_region: ep.body_region || ep.region,
          current_status: ep.current_status,
          referral_date: referral?.referral_date,
          ortho_partner_name: partner?.name || "Unknown",
          ortho_partner_subspecialty: partner?.subspecialty || "",
          expected_return_window_start: referral?.expected_return_window_start,
          expected_return_window_end: referral?.expected_return_window_end,
          surgery_date: ep.surgery_date,
          surgery_performed: ep.surgery_performed,
          priority_flag: referral?.priority_flag || false,
          referral_id: referral?.id,
        };
      });

      setEpisodes(transformed);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load ortho episodes");
    } finally {
      setLoading(false);
    }
  };

  // Filter episodes
  const filteredEpisodes = episodes.filter((ep) => {
    const matchesSearch =
      ep.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.episode_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || ep.current_status === filterStatus;
    const matchesRegion = filterRegion === "all" || ep.body_region === filterRegion;
    const matchesPartner = filterPartner === "all" || ep.ortho_partner_name === filterPartner;

    return matchesSearch && matchesStatus && matchesRegion && matchesPartner;
  });

  // Categorize episodes
  const now = new Date();
  
  const rehabCompleted = filteredEpisodes.filter(
    (ep) =>
      ep.current_status === "ORTHO_REHAB_COMPLETED" ||
      ep.current_status === "PENDING_RETURN_TO_PPC"
  );

  const returnWindowActive = filteredEpisodes.filter((ep) => {
    if (!ep.expected_return_window_start || !ep.expected_return_window_end) return false;
    const start = parseISO(ep.expected_return_window_start);
    const end = parseISO(ep.expected_return_window_end);
    return isWithinInterval(now, { start, end });
  });

  const overdueReturns = filteredEpisodes.filter((ep) => {
    if (!ep.expected_return_window_end) return false;
    const end = parseISO(ep.expected_return_window_end);
    return isAfter(now, end) && 
           (ep.current_status === "ORTHO_REHAB_COMPLETED" || 
            ep.current_status === "PENDING_RETURN_TO_PPC");
  });

  const inProgress = filteredEpisodes.filter(
    (ep) =>
      ep.current_status === "REFERRED_TO_ORTHO" ||
      ep.current_status === "ORTHO_CONSULT_COMPLETED" ||
      ep.current_status === "SURGERY_COMPLETED" ||
      ep.current_status === "ORTHO_REHAB_IN_PROGRESS"
  );

  const handleViewEpisode = (episodeId: string) => {
    navigate(`/episode-summary?id=${episodeId}`);
  };

  const renderEpisodeRow = (episode: OrthoEpisode) => (
    <TableRow key={episode.episode_id} className="cursor-pointer hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{episode.patient_name}</p>
            <p className="text-xs text-muted-foreground">{episode.episode_id}</p>
          </div>
          {episode.priority_flag && (
            <Badge variant="destructive" className="ml-2">Priority</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{episode.body_region}</Badge>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{episode.ortho_partner_name}</p>
          {episode.ortho_partner_subspecialty && (
            <p className="text-xs text-muted-foreground">{episode.ortho_partner_subspecialty}</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(episode.current_status)}>
          {EPISODE_STATUS_LABELS[episode.current_status] || episode.current_status}
        </Badge>
      </TableCell>
      <TableCell>
        {episode.expected_return_window_start && episode.expected_return_window_end ? (
          <div className="text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(parseISO(episode.expected_return_window_start), "MMM d")}</span>
              <span>-</span>
              <span>{format(parseISO(episode.expected_return_window_end), "MMM d, yyyy")}</span>
            </div>
            {episode.expected_return_window_end && 
             isAfter(now, parseISO(episode.expected_return_window_end)) && (
              <p className="text-xs text-destructive mt-1">Overdue</p>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Not set</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <OrthoReferralPrint 
            episodeId={episode.episode_id}
            trigger={
              <Button variant="ghost" size="sm">
                <Printer className="h-4 w-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewEpisode(episode.episode_id)}
          >
            View
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary">Return to PPC Dashboard</h1>
          <p className="text-muted-foreground">
            Track patients in ortho referral pipeline and manage returns
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rehab Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rehabCompleted.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pending return to PPC
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Return Window Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{returnWindowActive.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Due for assessment now
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueReturns.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Past return window
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{inProgress.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Not yet ready to return
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patient or episode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="REFERRED_TO_ORTHO">Referred to Ortho</SelectItem>
                  <SelectItem value="ORTHO_CONSULT_COMPLETED">Consult Completed</SelectItem>
                  <SelectItem value="SURGERY_COMPLETED">Surgery Completed</SelectItem>
                  <SelectItem value="ORTHO_REHAB_IN_PROGRESS">Rehab In Progress</SelectItem>
                  <SelectItem value="ORTHO_REHAB_COMPLETED">Rehab Completed</SelectItem>
                  <SelectItem value="PENDING_RETURN_TO_PPC">Pending Return</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRegion} onValueChange={setFilterRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {BODY_REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPartner} onValueChange={setFilterPartner}>
                <SelectTrigger>
                  <SelectValue placeholder="All partners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Partners</SelectItem>
                  {orthoPartners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.name}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Views */}
        <Tabs defaultValue="overdue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overdue" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Overdue ({overdueReturns.length})
            </TabsTrigger>
            <TabsTrigger value="ready" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Ready to Return ({rehabCompleted.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              <Clock className="h-4 w-4" />
              Return Window Active ({returnWindowActive.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              All ({filteredEpisodes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overdue">
            <Card>
              <CardHeader>
                <CardTitle>Overdue Returns</CardTitle>
                <CardDescription>
                  Patients past their expected return window who need scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                {overdueReturns.length === 0 ? (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      No overdue returns! All patients are on track.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Ortho Partner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Return Window</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overdueReturns.map(renderEpisodeRow)}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ready">
            <Card>
              <CardHeader>
                <CardTitle>Ready to Return</CardTitle>
                <CardDescription>
                  Patients who have completed ortho rehab and are ready for final assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rehabCompleted.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No patients ready to return at this time.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Ortho Partner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Return Window</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rehabCompleted.map(renderEpisodeRow)}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Return Window Active</CardTitle>
                <CardDescription>
                  Patients currently in their expected return window
                </CardDescription>
              </CardHeader>
              <CardContent>
                {returnWindowActive.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No patients currently in their return window.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Ortho Partner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Return Window</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returnWindowActive.map(renderEpisodeRow)}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Ortho Episodes</CardTitle>
                <CardDescription>
                  Complete list of all patients in the ortho referral pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading episodes...</p>
                  </div>
                ) : filteredEpisodes.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No episodes match your current filters.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Ortho Partner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Return Window</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEpisodes.map(renderEpisodeRow)}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}