import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Team from "./pages/Team";
import PlayerDetail from "./pages/PlayerDetail";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Stats from "./pages/Stats";
import Training from "./pages/Training";
import DrillDetail from "./pages/DrillDetail";
import Playbook from "./pages/Playbook";
import PlayDetail from "./pages/PlayDetail";
import Development from "./pages/Development";
import TacticsBoard from "./pages/TacticsBoard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/team" element={<Team />} />
          <Route path="/team/:playerId" element={<PlayerDetail />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/:gameId" element={<GameDetail />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/drill/:drillId" element={<DrillDetail />} />
          <Route path="/playbook" element={<Playbook />} />
          <Route path="/playbook/:playId" element={<PlayDetail />} />
          <Route path="/development" element={<Development />} />
          <Route path="/tactics" element={<TacticsBoard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
