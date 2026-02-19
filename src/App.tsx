import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import ProgrammingPage from "./pages/ProgrammingPage";
import PythonPage from "./pages/PythonPage";
import HtmlCssJsPage from "./pages/HtmlCssJsPage";
import DomPage from "./pages/DomPage";
import WhileLoopPage from "./pages/WhileLoopPage";
import ForLoopPage from "./pages/ForLoopPage";
import VariablePage from "./pages/VariablePage";
import FunctionPage from "./pages/FunctionPage";
import SciencePage from "./pages/SciencePage";
import PlantGrowthPage from "./pages/PlantGrowthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/programming" element={<ProgrammingPage />} />
            <Route path="/programming/python" element={<PythonPage />} />
            <Route path="/programming/html-css-js" element={<HtmlCssJsPage />} />
            <Route path="/programming/html-css-js/dom" element={<DomPage />} />
            <Route path="/programming/python/while-loop" element={<WhileLoopPage />} />
            <Route path="/programming/python/for-loop" element={<ForLoopPage />} />
            <Route path="/programming/python/variables" element={<VariablePage />} />
            <Route path="/programming/python/functions" element={<FunctionPage />} />
            <Route path="/science" element={<SciencePage />} />
            <Route path="/science/plant-growth" element={<PlantGrowthPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
