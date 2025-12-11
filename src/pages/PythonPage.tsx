import { Link } from "react-router-dom";
import { Code2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ConceptCard = ({ 
  title, 
  description, 
  href 
}: {
  title: string;
  description: string;
  href: string;
}) => {
  return (
    <Link to={href}>
      <Card className="group hover:border-secondary transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
        <CardHeader>
          <CardTitle className="text-xl font-mono">{title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" className="w-full group-hover:text-secondary">
            Try it <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

const PythonPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
        <div className="container mx-auto px-4 py-12">
          <Link to="/programming" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors">
            <span>←</span> Back to Programming
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <Code2 className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Python</h1>
              <p className="text-slate-300 text-lg mt-2">
                Interactive Python concepts and animations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ConceptCard
            title="while loop"
            description="See how a while loop repeats code as long as a condition is true."
            href="/programming/python/while-loop"
          />
          <ConceptCard
            title="for loop"
            description="Understand how for loops iterate through sequences with range()."
            href="/programming/python/for-loop"
          />
          <ConceptCard
            title="variables"
            description="Learn how variables work as containers that hold values."
            href="/programming/python/variables"
          />
          {/* Future concepts can be added here */}
        </div>
      </div>
    </div>
  );
};

export default PythonPage;

