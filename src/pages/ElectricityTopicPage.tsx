import { Link } from "react-router-dom";
import { Zap, ChevronRight, Cable } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ElectricityTopicPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-amber-950/90 via-orange-950/85 to-amber-950/90 border-b border-amber-900/50">
        <div className="container mx-auto px-4 py-12">
          <Link
            to="/engineering"
            className="inline-flex items-center gap-2 text-amber-100/90 hover:text-white mb-6 transition-colors"
          >
            <span>←</span> Back to Engineering
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/30">
              <Zap className="h-8 w-8 text-amber-300" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Electricity</h1>
              <p className="text-amber-100/85 text-lg mt-2">
                Interactive lab: current, energy, and materials
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
          <Link to="/engineering/electricity/lab">
            <Card className="group h-full hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Zap className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                  Electricity Flow Simulator
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Press and hold to push electrons, switch to the handle for smooth strength control, then
                  compare copper, wood, and plastic.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full group-hover:text-amber-700 dark:group-hover:text-amber-300">
                  Open lab <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
          <Link to="/engineering/electricity/continuity">
            <Card className="group h-full hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Cable className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                  Continuity test
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Use a virtual multimeter in continuity mode: place probes, test for a complete path, and hear a steady tone
                  when copper completes the circuit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full group-hover:text-amber-700 dark:group-hover:text-amber-300">
                  Open continuity lab <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ElectricityTopicPage;
