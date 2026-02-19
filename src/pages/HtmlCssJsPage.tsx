import { Link } from "react-router-dom";
import { FileCode, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ConceptCard = ({
  title,
  description,
  href,
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

const HtmlCssJsPage = () => {
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
              <FileCode className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">HTML / CSS / JS</h1>
              <p className="text-slate-300 text-lg mt-2">
                Web development with HTML, CSS, and JavaScript
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ConceptCard
            title="DOM"
            description="Learn how the Document Object Model represents the page and how to access and change elements with JavaScript."
            href="/programming/html-css-js/dom"
          />
          {/* Future concepts can be added here */}
        </div>
      </div>
    </div>
  );
};

export default HtmlCssJsPage;
