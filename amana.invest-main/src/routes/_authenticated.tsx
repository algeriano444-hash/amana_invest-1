import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
  const { user, loading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // soft client redirect
        window.location.href = "/login";
      } else {
        setChecked(true);
      }
    }
  }, [user, loading]);

  if (loading || !checked) {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">جارٍ التحقق...</div>
      </div>
    );
  }
  return <Outlet />;
}
