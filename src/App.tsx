import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlertTriangle } from "lucide-react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Games from "./pages/dashboard/Games";
import Predictions from "./pages/dashboard/Predictions";
import Overlay from "./pages/Overlay";

const queryClient = new QueryClient();

function RouteErrorFallback({ routeName }: { routeName: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 shadow-lg space-y-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">{routeName} crashed</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          This section hit an unexpected error. You can reload this page and continue using other parts of the app.
        </p>
      </div>
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ErrorBoundary fallback={<RouteErrorFallback routeName="Login" />}>
                  <Login />
                </ErrorBoundary>
              }
            />
            <Route
              path="/chat"
              element={
                <ErrorBoundary fallback={<RouteErrorFallback routeName="Chat" />}>
                  <Index />
                </ErrorBoundary>
              }
            />
            <Route
              path="/dashboard/*"
              element={
                <ErrorBoundary fallback={<RouteErrorFallback routeName="Dashboard" />}>
                  <Dashboard />
                </ErrorBoundary>
              }
            />
            <Route
              path="/dashboard/games"
              element={
                <ErrorBoundary fallback={<RouteErrorFallback routeName="Games" />}>
                  <Games />
                </ErrorBoundary>
              }
            />
            <Route
              path="/dashboard/predictions"
              element={
                <ErrorBoundary fallback={<RouteErrorFallback routeName="Predictions" />}>
                  <Predictions />
                </ErrorBoundary>
              }
            />
            <Route
              path="/overlay"
              element={
                <ErrorBoundary fallback={<RouteErrorFallback routeName="Overlay" />}>
                  <Overlay />
                </ErrorBoundary>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
