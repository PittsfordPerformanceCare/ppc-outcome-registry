import { Outlet } from "react-router-dom";

const SiteLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 border-b bg-muted/30">
        <span className="text-sm text-muted-foreground">SiteLayout Placeholder</span>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default SiteLayout;
