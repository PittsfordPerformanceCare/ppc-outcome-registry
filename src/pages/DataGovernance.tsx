import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Lock, 
  FileCheck, 
  Database, 
  Users, 
  Eye, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  FileText,
  Server,
  Key
} from "lucide-react";

const DataGovernance = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Governance & Compliance</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive security framework and data handling practices
        </p>
      </div>

      {/* Compliance Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HIPAA</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">Compliant</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Business Associate ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Security</CardTitle>
            <Lock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-blue-600">Enterprise</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Encryption at rest & transit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Logging</CardTitle>
            <FileCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-purple-600">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              All actions tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Control</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-orange-600">RBAC</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Role-based permissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform-Wide Coverage Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Unified Platform Governance
          </CardTitle>
          <CardDescription>
            All data governance policies apply across the entire platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-3">
            <p className="font-medium">
              Our data governance framework provides comprehensive protection across <strong>all platform components</strong>, including:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-medium text-primary">Clinician Portal</p>
                <ul className="space-y-1 text-muted-foreground text-xs">
                  <li>• Patient management dashboard</li>
                  <li>• Intake review and validation</li>
                  <li>• Episode tracking and discharge</li>
                  <li>• Analytics and reporting</li>
                  <li>• Administrative settings</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-primary">Patient Companion App</p>
                <ul className="space-y-1 text-muted-foreground text-xs">
                  <li>• Patient authentication and access</li>
                  <li>• Self-service intake forms</li>
                  <li>• Progress tracking and outcome measures</li>
                  <li>• Appointment reminders</li>
                  <li>• Post-discharge follow-up</li>
                </ul>
              </div>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Same Infrastructure, Same Protection:</strong> Both the clinician portal and patient companion app share the same backend database, security controls, encryption standards, audit logging, and compliance framework. Whether data is entered by a clinician or a patient, it receives identical HIPAA-compliant protection with role-based access control, Row Level Security policies, and comprehensive audit trails.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Governance Framework</CardTitle>
              <CardDescription>
                Our comprehensive approach to data protection and compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Data Management Principles
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Data Minimization:</strong> Only collect necessary patient information for treatment and outcome tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Purpose Limitation:</strong> Data used solely for rehabilitative care outcomes, care coordination, and authorized research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Data Quality:</strong> Regular validation and accuracy checks on all clinical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Accountability:</strong> Clear ownership and responsibility for data governance</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Architecture
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Infrastructure Security</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• SOC 2 Type II certified infrastructure</li>
                      <li>• AES-256 encryption at rest</li>
                      <li>• TLS 1.3 encryption in transit</li>
                      <li>• Automated security patching</li>
                      <li>• DDoS protection</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Application Security</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Multi-factor authentication ready</li>
                      <li>• Session timeout (15 minutes)</li>
                      <li>• Password complexity enforcement</li>
                      <li>• SQL injection prevention</li>
                      <li>• XSS/CSRF protection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Controls & Measures</CardTitle>
              <CardDescription>
                Multi-layered security protecting patient health information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Access Control (RBAC)
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium">Role-Based Access Control</p>
                    <p className="text-muted-foreground">Separate roles table with server-side validation prevents privilege escalation attacks</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• <strong>Admin:</strong> Full system access, user management, clinic settings</li>
                      <li>• <strong>Clinician:</strong> Access to own patients and clinic data only</li>
                      <li>• <strong>Patient:</strong> Limited access to own episode data only</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">Row Level Security (RLS)</p>
                    <p className="text-muted-foreground">Database-level access control ensures users can only access authorized data</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Enforced on all sensitive tables</li>
                      <li>• Default deny policy</li>
                      <li>• Security definer functions for role checks</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Audit & Monitoring
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <p className="font-medium">Comprehensive Audit Logging</p>
                  <p className="text-muted-foreground">All security-relevant events are logged with:</p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• User ID and action type (CREATE, READ, UPDATE, DELETE)</li>
                    <li>• Table name and record ID</li>
                    <li>• Before/after data snapshots (for updates)</li>
                    <li>• IP address and user agent</li>
                    <li>• Timestamp with timezone</li>
                    <li>• Clinic ID for multi-tenant tracking</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">
                    Audit logs are tamper-evident and retained for 7 years per HIPAA requirements.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Session Management
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-2">Automatic Timeout</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• 15-minute inactivity timeout</li>
                      <li>• 2-minute warning before logout</li>
                      <li>• Activity detection on all user interactions</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Multi-Device Tracking</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Device fingerprinting</li>
                      <li>• Remote session revocation</li>
                      <li>• Concurrent session limits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data Protection</CardTitle>
              <CardDescription>
                Patient privacy controls and data subject rights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Patient Privacy Rights
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Access & Transparency</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Right to view all stored data</li>
                      <li>• Data portability in standard formats</li>
                      <li>• Clear consent mechanisms</li>
                      <li>• Privacy policy accessible to all</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Control & Deletion</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Right to request data deletion</li>
                      <li>• Opt-out of research participation</li>
                      <li>• Communication preferences control</li>
                      <li>• Account deactivation options</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Data Retention Policy
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium mb-2">Clinical Records</p>
                    <p className="text-muted-foreground">
                      Patient episodes, outcome scores, and clinical documentation retained for <strong>7 years</strong> from last date of service (HIPAA requirement)
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium mb-2">Audit Logs</p>
                    <p className="text-muted-foreground">
                      Security and access logs retained for <strong>7 years</strong> for compliance and forensic purposes
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium mb-2">Operational Data</p>
                    <p className="text-muted-foreground">
                      Notifications, session logs, and analytics data retained for <strong>2 years</strong> or until no longer needed
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium mb-2">De-identified Research Data</p>
                    <p className="text-muted-foreground">
                      Anonymized outcome data may be retained indefinitely for research purposes (with patient consent)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Data Processing & Storage
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Data Location:</strong> All patient data stored in secure US-based data centers (compliance with data residency requirements)</p>
                  <p><strong>Backup & Recovery:</strong> Automated daily backups with 30-day retention, encrypted in transit and at rest</p>
                  <p><strong>Disaster Recovery:</strong> Multi-region redundancy with 99.95% uptime SLA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Compliance</CardTitle>
              <CardDescription>
                Adherence to healthcare regulations and industry standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  HIPAA Compliance
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">Administrative Safeguards</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>✓ Security risk assessment and management</li>
                      <li>✓ Workforce security policies and training</li>
                      <li>✓ Information access management controls</li>
                      <li>✓ Security incident response procedures</li>
                      <li>✓ Contingency and disaster recovery plans</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium">Physical Safeguards</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>✓ Facility access controls (SOC 2 certified data centers)</li>
                      <li>✓ Workstation and device security policies</li>
                      <li>✓ Physical access logs and monitoring</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <p className="font-medium">Technical Safeguards</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>✓ Unique user identification and authentication</li>
                      <li>✓ Automatic session timeout controls</li>
                      <li>✓ Encryption of data at rest and in transit</li>
                      <li>✓ Audit controls and integrity monitoring</li>
                      <li>✓ Transmission security protocols</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Business Associate Agreements (BAA)
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                  <p className="text-muted-foreground">
                    Our infrastructure provider maintains BAAs covering all hosting, database, and processing services. We can provide BAAs to covered entities (clinics, hospitals, insurance providers) upon request.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Additional Standards
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">SOC 2 Type II</h4>
                    <p className="text-muted-foreground">Infrastructure meets Security, Availability, and Confidentiality criteria</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">GDPR Ready</h4>
                    <p className="text-muted-foreground">Data subject rights, consent management, and data portability</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">21 CFR Part 11</h4>
                    <p className="text-muted-foreground">Electronic records and signatures for research use</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">ISO 27001 Aligned</h4>
                    <p className="text-muted-foreground">Information security management practices</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Research Tab */}
        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Research Data Governance</CardTitle>
              <CardDescription>
                Protocols for research partnerships and data sharing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Data Sharing Framework
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium mb-2">De-identification Process</p>
                    <p className="text-muted-foreground">
                      All research datasets undergo HIPAA-compliant de-identification:
                    </p>
                    <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                      <li>• Removal of 18 HIPAA identifiers (names, dates, contact info, etc.)</li>
                      <li>• Statistical disclosure control techniques</li>
                      <li>• Expert determination when required</li>
                      <li>• Re-identification risk assessment</li>
                    </ul>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium mb-2">Patient Consent</p>
                    <p className="text-muted-foreground">
                      Research participation requires explicit opt-in consent:
                    </p>
                    <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                      <li>• Clear explanation of research purposes</li>
                      <li>• Ability to withdraw consent at any time</li>
                      <li>• Separate from treatment consent</li>
                      <li>• Documented in audit trail</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Research Partnership Requirements
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium">Academic Institutions</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• IRB approval or exemption determination</li>
                      <li>• Data Use Agreement (DUA) execution</li>
                      <li>• Publication and attribution rights defined</li>
                      <li>• Security and access controls verified</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">Industry Partners</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Business Associate Agreement (BAA) required</li>
                      <li>• Limited Data Set Agreement where applicable</li>
                      <li>• Audit rights and compliance verification</li>
                      <li>• Prohibited re-identification clauses</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <p className="font-medium">Insurance Providers</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Value-based care agreements</li>
                      <li>• Outcome reporting specifications</li>
                      <li>• Quality measure validation</li>
                      <li>• Real-time vs. aggregated data access</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Available Research Datasets
                </h3>
                <div className="grid gap-3">
                  <div className="border rounded-lg p-4 text-sm">
                    <h4 className="font-medium mb-1">Outcome Measure Registry</h4>
                    <p className="text-muted-foreground text-xs mb-2">De-identified longitudinal outcome data</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">NDI</Badge>
                      <Badge variant="secondary" className="text-xs">ODI</Badge>
                      <Badge variant="secondary" className="text-xs">QuickDASH</Badge>
                      <Badge variant="secondary" className="text-xs">LEFS</Badge>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 text-sm">
                    <h4 className="font-medium mb-1">MCID Achievement Database</h4>
                    <p className="text-muted-foreground text-xs mb-2">Clinically significant improvement tracking</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">Region-specific</Badge>
                      <Badge variant="secondary" className="text-xs">Diagnosis-tagged</Badge>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 text-sm">
                    <h4 className="font-medium mb-1">Treatment Efficacy Analytics</h4>
                    <p className="text-muted-foreground text-xs mb-2">Aggregated treatment outcome patterns</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">Time-series</Badge>
                      <Badge variant="secondary" className="text-xs">Multi-clinic</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-2">Research Inquiries</h4>
                <p className="text-sm text-muted-foreground">
                  For research partnerships or data access requests, please contact your system administrator or Data Protection Officer (DPO).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Contact */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Security & Compliance Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            For security concerns, compliance questions, or Business Associate Agreement requests:
          </p>
          <ul className="space-y-1 text-muted-foreground ml-4">
            <li>• Contact your system administrator</li>
            <li>• Submit security issues through admin dashboard</li>
            <li>• Request BAA through compliance page</li>
          </ul>
          <p className="text-muted-foreground pt-2">
            This page provides an overview of our data governance framework. Detailed technical documentation is available in SECURITY.md.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataGovernance;
