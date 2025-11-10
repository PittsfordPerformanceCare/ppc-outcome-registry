import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BookmarkPlus, Trash2, Edit, Copy, Share2 } from "lucide-react";

interface ExportTemplate {
  id: string;
  name: string;
  description: string | null;
  export_type: string;
  filters: any;
  recipient_emails: string[];
  is_shared: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface ExportTemplateManagerProps {
  onApplyTemplate?: (template: ExportTemplate) => void;
  currentFilters?: Record<string, any>;
  currentType?: string;
  currentRecipients?: string[];
}

export function ExportTemplateManager({ 
  onApplyTemplate,
  currentFilters,
  currentType,
  currentRecipients = []
}: ExportTemplateManagerProps) {
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExportTemplate | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [exportType, setExportType] = useState("episodes");
  const [recipientEmails, setRecipientEmails] = useState("");
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("export_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading templates",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  const handleSaveTemplate = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    const emails = recipientEmails
      .split(",")
      .map(e => e.trim())
      .filter(e => e.length > 0);

    const templateData = {
      user_id: user.id,
      name: name.trim(),
      description: description.trim() || null,
      export_type: exportType,
      filters: currentFilters || {},
      recipient_emails: emails,
      is_shared: isShared,
    };

    if (editingTemplate) {
      const { error } = await supabase
        .from("export_templates")
        .update(templateData)
        .eq("id", editingTemplate.id);

      if (error) {
        toast({
          title: "Error updating template",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Template updated",
          description: "Export template has been updated successfully",
        });
        resetForm();
        loadTemplates();
      }
    } else {
      const { error } = await supabase
        .from("export_templates")
        .insert(templateData);

      if (error) {
        toast({
          title: "Error creating template",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Template created",
          description: "Export template has been saved successfully",
        });
        resetForm();
        loadTemplates();
      }
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    const { error } = await supabase
      .from("export_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error deleting template",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Template deleted",
        description: "Export template has been removed",
      });
      loadTemplates();
    }
  };

  const handleEditTemplate = (template: ExportTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setDescription(template.description || "");
    setExportType(template.export_type);
    setRecipientEmails(template.recipient_emails.join(", "));
    setIsShared(template.is_shared);
    setDialogOpen(true);
  };

  const handleApplyTemplate = (template: ExportTemplate) => {
    if (onApplyTemplate) {
      onApplyTemplate(template);
      toast({
        title: "Template applied",
        description: `Using "${template.name}" configuration`,
      });
    }
  };

  const handleSaveAsTemplate = () => {
    setEditingTemplate(null);
    setName("");
    setDescription("");
    setExportType(currentType || "episodes");
    setRecipientEmails(currentRecipients.join(", "));
    setIsShared(false);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
    setName("");
    setDescription("");
    setExportType("episodes");
    setRecipientEmails("");
    setIsShared(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Export Templates</h3>
          <p className="text-sm text-muted-foreground">
            Save and reuse export configurations
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleSaveAsTemplate} className="gap-2">
              <BookmarkPlus className="h-4 w-4" />
              Save Current as Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Create Export Template"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., Weekly Episodes Export"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  placeholder="Describe this template's purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="template-type">Export Type</Label>
                <Select value={exportType} onValueChange={setExportType}>
                  <SelectTrigger id="template-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="episodes">Episodes</SelectItem>
                    <SelectItem value="followups">Follow-ups</SelectItem>
                    <SelectItem value="outcomes">Outcome Scores</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template-recipients">Recipient Emails</Label>
                <Textarea
                  id="template-recipients"
                  placeholder="email1@example.com, email2@example.com"
                  value={recipientEmails}
                  onChange={(e) => setRecipientEmails(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated email addresses
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="template-shared">Share with Clinic</Label>
                  <p className="text-xs text-muted-foreground">
                    Make this template available to all clinic members
                  </p>
                </div>
                <Switch
                  id="template-shared"
                  checked={isShared}
                  onCheckedChange={setIsShared}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>
                  {editingTemplate ? "Update Template" : "Save Template"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading templates...</p>
      ) : templates.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            No templates saved yet. Create your first template to get started.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {templates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{template.name}</h4>
                    {template.is_shared && (
                      <Badge variant="secondary" className="gap-1">
                        <Share2 className="h-3 w-3" />
                        Shared
                      </Badge>
                    )}
                    {template.user_id !== user?.id && (
                      <Badge variant="outline">Clinic Template</Badge>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">{template.export_type}</Badge>
                    <Badge variant="outline">
                      {template.recipient_emails.length} recipients
                    </Badge>
                    {Object.keys(template.filters).length > 0 && (
                      <Badge variant="outline">
                        {Object.keys(template.filters).length} filters
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApplyTemplate(template)}
                    title="Apply template"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {template.user_id === user?.id && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        title="Edit template"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        title="Delete template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
