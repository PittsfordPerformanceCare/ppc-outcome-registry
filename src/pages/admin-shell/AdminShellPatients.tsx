import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/navigation";
import { SkeletonStats, SkeletonTable } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/error";
import { 
  Users, 
  Search, 
  ArrowRight, 
  User,
  FileText,
  Calendar,
  Mail,
  Phone
} from "lucide-react";
import { format } from "date-fns";

interface PatientData {
  patient_name: string;
  episode_count: number;
  latest_episode_date: string;
  regions: string[];
  has_active_episode: boolean;
}

const AdminShellPatients = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch episodes and aggregate by patient
  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ["admin-patients-episodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("id, patient_name, region, date_of_service, discharge_date, date_of_birth")
        .order("date_of_service", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Aggregate episodes by patient name
  const patients: PatientData[] = Object.values(
    episodes.reduce((acc: Record<string, PatientData>, ep) => {
      const key = ep.patient_name;
      if (!acc[key]) {
        acc[key] = {
          patient_name: ep.patient_name,
          episode_count: 0,
          latest_episode_date: ep.date_of_service,
          regions: [],
          has_active_episode: false,
        };
      }
      acc[key].episode_count++;
      if (!ep.discharge_date) {
        acc[key].has_active_episode = true;
      }
      if (!acc[key].regions.includes(ep.region)) {
        acc[key].regions.push(ep.region);
      }
      return acc;
    }, {})
  );

  // Filter by search
  const filteredPatients = patients.filter((patient) => {
    if (!searchQuery) return true;
    return patient.patient_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Patient Directory"
        description="View patient profiles and episode history"
        icon={Users}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Patients" },
        ]}
      />

      {/* Stats */}
      {isLoading ? (
        <SkeletonStats count={3} />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">With Active Episodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {patients.filter((p) => p.has_active_episode).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Episodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{episodes.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Patient List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Patients</CardTitle>
              <CardDescription>Search and view patient records</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable rows={5} columns={6} />
          ) : filteredPatients.length === 0 ? (
            <EmptyState
              type="search"
              title="No patients found"
              description="Try adjusting your search query."
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Episodes</TableHead>
                    <TableHead>Regions</TableHead>
                    <TableHead>Latest Episode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.slice(0, 50).map((patient, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {patient.patient_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {patient.episode_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {patient.regions.slice(0, 2).map((region) => (
                            <Badge key={region} variant="outline" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                          {patient.regions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{patient.regions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(patient.latest_episode_date), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.has_active_episode ? (
                          <Badge>Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/episodes?patient=${encodeURIComponent(patient.patient_name)}`}>
                            View Episodes
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
        </CardContent>
      </Card>

      {/* Patient Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Tools</CardTitle>
          <CardDescription>Access patient-related functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/admin/registry">
                <Users className="mr-2 h-4 w-4" />
                Lead Intake Review
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/intake-review">
                <FileText className="mr-2 h-4 w-4" />
                Intake Forms
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/admin/communications">
                <Mail className="mr-2 h-4 w-4" />
                Patient Communications
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminShellPatients;
