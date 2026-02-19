import { Link } from "react-router-dom";
import { FileCode } from "lucide-react";
import DomDemo from "@/components/DomDemo";

const DomPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
        <div className="container mx-auto px-4 py-12">
          <Link to="/programming/html-css-js" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors">
            <span>←</span> Back to HTML / CSS / JS
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <FileCode className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">DOM</h1>
              <p className="text-slate-300 text-lg mt-2">
                The Document Object Model — access and change page elements with JavaScript
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <DomDemo />
      </div>
    </div>
  );
};

export default DomPage;
