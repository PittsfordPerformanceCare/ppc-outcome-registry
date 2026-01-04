import React from 'react';
import { ResearchExportPanel } from '@/components/admin/ResearchExportPanel';
import { Shield } from 'lucide-react';

export default function AdminShellResearchExports() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Research Exports</h1>
        </div>
        <p className="text-muted-foreground">
          Generate de-identified datasets for registry submissions, publications, and research.
          All exports are automatically pseudonymized and logged for audit compliance.
        </p>
      </div>
      
      <ResearchExportPanel />
    </div>
  );
}
