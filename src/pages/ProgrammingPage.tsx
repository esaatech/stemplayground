import { Link } from "react-router-dom";
import { Code2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LanguageCard = ({ 
  name, 
  description, 
  href, 
  icon: Icon 
}: {
  name: string;
  description: string;
  href: string;
  icon: React.ElementType;
}) => {
  return (
    <Link to={href}>
      <Card className="group hover:border-secondary transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <Icon className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle className="text-2xl">{name}</CardTitle>
          </div>
          <CardDescription className="text-base mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" className="w-full group-hover:text-secondary">
            Explore <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

const ProgrammingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
        <div className="container mx-auto px-4 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors">
            <span>←</span> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <Code2 className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Programming</h1>
              <p className="text-slate-300 text-lg mt-2">
                Learn programming concepts through interactive visualizations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LanguageCard
            name="Python"
            description="Visualize loops, functions, and data structures with interactive Python examples."
            href="/programming/python"
            icon={Code2}
          />
          {/* Future languages can be added here */}
        </div>
      </div>
    </div>
  );
};

export default ProgrammingPage;

