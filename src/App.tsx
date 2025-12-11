import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProgrammingPage from "./pages/ProgrammingPage";
import PythonPage from "./pages/PythonPage";
import WhileLoopPage from "./pages/WhileLoopPage";
import ForLoopPage from "./pages/ForLoopPage";
import VariablePage from "./pages/VariablePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/programming" element={<ProgrammingPage />} />
          <Route path="/programming/python" element={<PythonPage />} />
          <Route path="/programming/python/while-loop" element={<WhileLoopPage />} />
          <Route path="/programming/python/for-loop" element={<ForLoopPage />} />
          <Route path="/programming/python/variables" element={<VariablePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
