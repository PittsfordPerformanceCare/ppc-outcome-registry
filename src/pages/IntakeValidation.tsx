import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  TrendingUp,
  AlertCircle,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { 
  calculateCompletenessScore, 
  getGradeColor, 
  getScoreColor,
  getProgressColor,
  CompletenessResult 
} from "@/lib/intakeCompletenessScoring";

interface IntakeWithScore {
  id: string;
  access_code: string;
  patient_name: string;
  date_of_birth: string;
  submitted_at: string;
  status: string;
  converted_to_episode_id?: string;
  completeness: CompletenessResult;
}

export default function IntakeValidation() {
  const navigate = useNavigate();
  const [intakes, setIntakes] = useState<IntakeWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIntake, setSelectedIntake] = useState<IntakeWithScore | null>(null);

  useEffect(() => {
    loadIntakes();
  }, []);

  const loadIntakes = async () => {
    try {
      const { data, error } = await supabase
        .from("intake_forms")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      // Calculate completeness scores for each intake
      const intakesWithScores: IntakeWithScore[] = (data || []).map(intake => ({
        ...intake,
        completeness: calculateCompletenessScore(intake)
      }));

      setIntakes(intakesWithScores);
    } catch (error: any) {
      toast.error(`Failed to load intakes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredIntakes = useMemo(() => {
    return intakes.filter(intake => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          intake.patient_name.toLowerCase().includes(query) ||
          intake.access_code.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filterStatus !== "all") {
        if (filterStatus === "ready" && !intake.completeness.isReadyForConversion) return false;
        if (filterStatus === "incomplete" && intake.completeness.isReadyForConversion) return false;
        if (filterStatus === "converted" && !intake.converted_to_episode_id) return false;
        if (filterStatus === "pending" && (intake.status !== "pending" || intake.converted_to_episode_id)) return false;
      }

      // Grade filter
      if (filterGrade !== "all" && intake.completeness.grade !== filterGrade) {
        return false;
      }

      return true;
    });
  }, [intakes, searchQuery, filterStatus, filterGrade]);

  const hasActiveFilters = searchQuery || filterStatus !== "all" || filterGrade !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setFilterGrade("all");
  };

  // Statistics
  const stats = useMemo(() => {
    const total = intakes.length;
    const ready = intakes.filter(i => i.completeness.isReadyForConversion && !i.converted_to_episode_id).length;
    const needsReview = intakes.filter(i => !i.completeness.isReadyForConversion && !i.converted_to_episode_id).length;
    const converted = intakes.filter(i => i.converted_to_episode_id).length;
    const avgScore = total > 0 
      ? Math.round(intakes.reduce((sum, i) => sum + i.completeness.overallScore, 0) / total)
      : 0;

    return { total, ready, needsReview, converted, avgScore };
  }, [intakes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading intake validation data...</p>
      </div>
    );
  }

  if (selectedIntake) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Intake Validation Details</h1>
            <p className="text-muted-foreground">Completeness analysis for {selectedIntake.patient_name}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedIntake(null)}>
            Back to List
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Overall Score Card */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Completeness</CardTitle>
              <CardDescription>
                Submitted {format(new Date(selectedIntake.submitted_at), "MMM d, yyyy 'at' h:mm a")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className={`text-6xl font-bold ${getScoreColor(selectedIntake.completeness.overallScore)}`}>
                    {selectedIntake.completeness.overallScore}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Grade: <span className={`font-bold ${getGradeColor(selectedIntake.completeness.grade)}`}>
                      {selectedIntake.completeness.grade}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {selectedIntake.completeness.isReadyForConversion ? (
                    <Badge className="bg-green-600 dark:bg-green-700 mb-2">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Ready for Conversion
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="mb-2">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Needs Completion
                    </Badge>
                  )}
                </div>
              </div>
              <Progress 
                value={selectedIntake.completeness.overallScore} 
                className="h-3"
              />
            </CardContent>
          </Card>

          {/* Missing Required Fields */}
          {selectedIntake.completeness.missingRequiredFields.length > 0 && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Missing Required Fields
                </CardTitle>
                <CardDescription>
                  These fields must be completed before conversion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedIntake.completeness.missingRequiredFields.map((field, idx) => (
                    <Badge key={idx} variant="destructive">
                      {field}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Group Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Completeness by Section</CardTitle>
              <CardDescription>
                Detailed breakdown of each information category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedIntake.completeness.groupScores.map((group, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{group.groupName}</span>
                      {group.missingFields.length === 0 && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <span className={`font-bold ${getScoreColor(group.percentage)}`}>
                      {group.percentage}%
                    </span>
                  </div>
                  <Progress value={group.percentage} className="h-2" />
                  {group.missingFields.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Missing: {group.missingFields.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Optional Fields */}
          {selectedIntake.completeness.missingOptionalFields.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Info className="h-5 w-5" />
                  Missing Optional Fields
                </CardTitle>
                <CardDescription>
                  Optional fields that would improve data quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedIntake.completeness.missingOptionalFields.map((field, idx) => (
                    <Badge key={idx} variant="outline" className="text-amber-600 dark:text-amber-400">
                      {field}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate(`/intake-review`)} 
              className="flex-1"
              size="lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Full Intake
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Intake Validation Dashboard</h1>
        <p className="text-muted-foreground">Monitor intake form completeness and data quality</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Intakes</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All submitted forms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ready for Conversion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.ready}</div>
            <p className="text-xs text-muted-foreground">Complete & ready</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.needsReview}</div>
            <p className="text-xs text-muted-foreground">Incomplete data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.avgScore)}`}>{stats.avgScore}%</div>
            <p className="text-xs text-muted-foreground">Overall quality</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Search & Filter</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient name or access code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label htmlFor="filter-status">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="filter-status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ready">Ready for Conversion</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="converted">Already Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-grade">Grade</Label>
                <Select value={filterGrade} onValueChange={setFilterGrade}>
                  <SelectTrigger id="filter-grade">
                    <SelectValue placeholder="All grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="A">A (90-100%)</SelectItem>
                    <SelectItem value="B">B (80-89%)</SelectItem>
                    <SelectItem value="C">C (70-79%)</SelectItem>
                    <SelectItem value="D">D (60-69%)</SelectItem>
                    <SelectItem value="F">F (&lt;60%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between rounded-md bg-muted p-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Active Filters:</span>
                {searchQuery && (
                  <Badge variant="secondary">Search: {searchQuery}</Badge>
                )}
                {filterStatus !== "all" && (
                  <Badge variant="secondary">Status: {filterStatus}</Badge>
                )}
                {filterGrade !== "all" && (
                  <Badge variant="secondary">Grade: {filterGrade}</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredIntakes.length}</span> of{" "}
            <span className="font-semibold text-foreground">{intakes.length}</span> intakes
          </div>
        </CardContent>
      </Card>

      {/* Intakes List */}
      <div className="grid gap-4">
        {filteredIntakes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {hasActiveFilters ? "No intakes match your filters" : "No intakes found"}
              </p>
              {hasActiveFilters && (
                <Button className="mt-4" variant="outline" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredIntakes.map((intake) => (
            <Card 
              key={intake.id} 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedIntake(intake)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold truncate">{intake.patient_name}</h3>
                      <Badge variant="outline" className="shrink-0">
                        {intake.access_code}
                      </Badge>
                      {intake.converted_to_episode_id ? (
                        <Badge variant="outline" className="shrink-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Converted
                        </Badge>
                      ) : intake.completeness.isReadyForConversion ? (
                        <Badge className="bg-green-600 dark:bg-green-700 shrink-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Ready
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="shrink-0">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Incomplete
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Submitted {format(new Date(intake.submitted_at), "MMM d, yyyy")} •{" "}
                      {intake.completeness.missingRequiredFields.length} required field{intake.completeness.missingRequiredFields.length !== 1 ? 's' : ''} missing
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress 
                          value={intake.completeness.overallScore} 
                          className="h-2"
                        />
                      </div>
                      <div className={`text-xl font-bold min-w-[4rem] text-right ${getScoreColor(intake.completeness.overallScore)}`}>
                        {intake.completeness.overallScore}%
                      </div>
                      <div className={`text-2xl font-bold min-w-[3rem] text-center ${getGradeColor(intake.completeness.grade)}`}>
                        {intake.completeness.grade}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
