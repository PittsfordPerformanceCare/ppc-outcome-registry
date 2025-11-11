import { SampleDataGenerator } from "@/components/SampleDataGenerator";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome to PPC Outcome Registry</h1>
          <p className="text-xl text-muted-foreground">
            Generate sample data below to explore the dashboard and features
          </p>
        </div>
        
        <SampleDataGenerator />
        
        <div className="text-center text-sm text-muted-foreground">
          <p>After generating data, navigate to:</p>
          <ul className="mt-2 space-y-1">
            <li>• Dashboard - View episode analytics</li>
            <li>• Episodes - Manage patient episodes</li>
            <li>• Webhooks - Configure integrations</li>
            <li>• Notifications - Track communication</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Index;
