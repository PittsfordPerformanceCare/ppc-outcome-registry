import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldOff, Users, Building2, Clock } from "lucide-react";
import { ClinicBrandingSettings } from "@/components/ClinicBrandingSettings";
import { PendingEpisodeThresholdManagement } from "@/components/PendingEpisodeThresholdManagement";
import { useUserRole } from "@/hooks/useUserRole";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  role: string | null;
}

const AdminManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      if (profilesError) throw profilesError;

      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = profiles.map((profile) => {
        const userRole = roles.find((r) => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || "clinician",
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      // First check if they already have a role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select()
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (existingRole) {
        toast({
          title: "Already an admin",
          description: "This user is already an admin.",
        });
        return;
      }

      // Insert admin role
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "admin",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User promoted to admin",
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin role removed",
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user roles, permissions, and clinic settings
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Clinic Branding
          </TabsTrigger>
          <TabsTrigger value="thresholds" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Thresholds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                View and manage user roles. Admins can access all patient data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.role === "admin" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeAdmin(user.id)}
                          >
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Remove Admin
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => promoteToAdmin(user.id)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Make Admin
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <ClinicBrandingSettings />
        </TabsContent>

        <TabsContent value="thresholds">
          <PendingEpisodeThresholdManagement isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminManagement;
