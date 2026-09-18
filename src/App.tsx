import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NavProvider, useNav } from "@/context/NavContext";
import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ToolPage } from "@/pages/ToolPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

function AppRoutes() {
  const { page, navigate } = useNav();
  const { user, loading } = useAuth();

  // Show loader while auth state is being determined
  if (loading) return <FullPageLoader />;

  // Landing page
  if (page.name === "landing") {
    // If already logged in, could still show landing
    return <LandingPage />;
  }

  // Auth pages
  if (page.name === "login") {
    // If already logged in, redirect to dashboard
    if (user) {
      navigate({ name: "dashboard" });
      return null;
    }
    return <AuthPage mode="login" />;
  }

  if (page.name === "signup") {
    if (user) {
      navigate({ name: "dashboard" });
      return null;
    }
    return <AuthPage mode="signup" />;
  }

  // Protected pages — require auth
  if (!user) {
    navigate({ name: "login" });
    return null;
  }

  if (page.name === "dashboard") {
    return (
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    );
  }

  if (page.name === "tool") {
    return (
      <DashboardLayout>
        <ToolPage key={page.tool} tool={page.tool} />
      </DashboardLayout>
    );
  }

  if (page.name === "history") {
    return (
      <DashboardLayout>
        <HistoryPage />
      </DashboardLayout>
    );
  }

  // Fallback
  return <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavProvider>
        <AppRoutes />
      </NavProvider>
    </AuthProvider>
  );
}
