import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Docs from "./pages/Docs";
import Admin from "./pages/Admin";
import GettingStarted from "./pages/docs/GettingStarted";
import Applications from "./pages/docs/Applications";
import Facility from "./pages/docs/Facility";
import TerminalGuide from "./pages/docs/TerminalGuide";
import Advanced from "./pages/docs/Advanced";
import Shortcuts from "./pages/docs/Shortcuts";
import Troubleshooting from "./pages/docs/Troubleshooting";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/getting-started" element={<GettingStarted />} />
        <Route path="/docs/applications" element={<Applications />} />
        <Route path="/docs/facility" element={<Facility />} />
        <Route path="/docs/terminal" element={<TerminalGuide />} />
        <Route path="/docs/advanced" element={<Advanced />} />
        <Route path="/docs/shortcuts" element={<Shortcuts />} />
        <Route path="/docs/troubleshooting" element={<Troubleshooting />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
