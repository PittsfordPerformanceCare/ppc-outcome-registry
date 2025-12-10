import { Outlet } from "react-router-dom";

const ShellAdminLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 border-b bg-muted/30">
        <span className="text-sm text-muted-foreground">AdminLayout Placeholder</span>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default ShellAdminLayout;
