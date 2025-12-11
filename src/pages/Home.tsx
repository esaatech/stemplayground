import { Link } from "react-router-dom";
import { Code2, FlaskConical, Wrench, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

const CategoryCard = ({ 
  title, 
  icon: Icon, 
  description, 
  href, 
  bgClass,
  hoverClass,
  accentColor,
  textColor = "dark",
  pattern 
}: {
  title: string;
  icon: React.ElementType;
  description: string;
  href: string;
  bgClass: string;
  hoverClass: string;
  accentColor: string;
  textColor?: "light" | "dark";
  pattern?: string;
}) => {
  const isLightText = textColor === "light";
  
  return (
    <Link
      to={href}
      className={cn(
        "group relative overflow-hidden rounded-3xl p-10 transition-all duration-500",
        "border-2 border-transparent hover:border-foreground/30",
        "hover:scale-[1.02] hover:shadow-2xl",
        "min-h-[400px] flex items-center justify-center",
        bgClass,
        hoverClass
      )}
    >
      {/* Background Pattern */}
      {pattern && (
        <div 
          className="absolute inset-0 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-500"
          dangerouslySetInnerHTML={{ __html: pattern }}
        />
      )}
      
      {/* Accent gradient overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500",
        accentColor
      )} />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 w-full">
        <div className={cn(
          "p-5 rounded-2xl transition-all duration-300",
          isLightText 
            ? "bg-white/10 backdrop-blur-md group-hover:bg-white/15" 
            : "bg-background/90 backdrop-blur-md group-hover:bg-background",
          "group-hover:scale-110 shadow-lg"
        )}>
          <Icon className={cn(
            "h-14 w-14 transition-colors",
            isLightText ? "text-white" : "text-foreground"
          )} />
        </div>
        <h2 className={cn(
          "text-4xl font-bold transition-colors",
          isLightText ? "text-white" : "text-foreground"
        )}>
          {title}
        </h2>
        <p className={cn(
          "text-lg max-w-md leading-relaxed",
          isLightText ? "text-white/80" : "text-foreground/70"
        )}>
          {description}
        </p>
        <div className={cn(
          "mt-6 px-8 py-3 rounded-full font-semibold transition-all duration-300",
          isLightText
            ? "bg-white/15 backdrop-blur-md text-white border-2 border-white/20 group-hover:bg-white/20 group-hover:border-white/30"
            : "bg-background/95 backdrop-blur-md text-foreground border-2 border-foreground/10 group-hover:bg-background group-hover:border-foreground/20",
          "group-hover:shadow-lg"
        )}>
          Explore →
        </div>
      </div>
    </Link>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(200,70,50,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent font-mono text-sm">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              STEM Playground
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground">
              Learn by
              <span className="block text-secondary mt-2">Building & Exploring</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Interactive animations and labs for Programming, Science, Engineering, and Mathematics.
              See concepts come to life through hands-on exploration.
            </p>
          </div>
        </div>
      </div>

      {/* Category Sections */}
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Programming Section */}
        <CategoryCard
          title="Programming"
          icon={Code2}
          description="Visualize code execution, understand algorithms, and see how programming concepts work in real-time."
          href="/programming"
          bgClass="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          hoverClass="hover:from-slate-900 hover:via-slate-800 hover:to-slate-900"
          accentColor="bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
          textColor="light"
          pattern={`
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="code-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <rect width="40" height="40" fill="none"/>
                  <text x="4" y="28" font-family="monospace" font-size="14" fill="currentColor" opacity="0.4">{ }</text>
                  <text x="20" y="18" font-family="monospace" font-size="10" fill="currentColor" opacity="0.3">=</text>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#code-pattern)"/>
            </svg>
          `}
        />

        {/* Science Section */}
        <CategoryCard
          title="Science"
          icon={FlaskConical}
          description="Explore chemical reactions, physics principles, and biological processes through interactive experiments."
          href="/science"
          bgClass="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/40 dark:via-cyan-950/40 dark:to-teal-950/40"
          hoverClass="hover:from-blue-100 hover:via-cyan-100 hover:to-teal-100 dark:hover:from-blue-950/50 dark:hover:via-cyan-950/50 dark:hover:to-teal-950/50"
          accentColor="bg-gradient-to-br from-blue-400/20 to-cyan-400/20"
          pattern={`
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="molecule-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.25"/>
                  <line x1="30" y1="30" x2="50" y2="30" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
                  <line x1="30" y1="30" x2="40" y2="15" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
                  <line x1="30" y1="30" x2="40" y2="45" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#molecule-pattern)"/>
            </svg>
          `}
        />

        {/* Engineering Section */}
        <CategoryCard
          title="Engineering"
          icon={Wrench}
          description="Build structures, understand mechanics, and see engineering principles in action with interactive models."
          href="/engineering"
          bgClass="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-yellow-950/40"
          hoverClass="hover:from-amber-100 hover:via-orange-100 hover:to-yellow-100 dark:hover:from-amber-950/50 dark:hover:via-orange-950/50 dark:hover:to-yellow-950/50"
          accentColor="bg-gradient-to-br from-amber-400/20 to-orange-400/20"
          pattern={`
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" stroke-width="2" opacity="0.15"/>
                  <circle cx="25" cy="25" r="2" fill="currentColor" opacity="0.2"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)"/>
            </svg>
          `}
        />

        {/* Mathematics Section */}
        <CategoryCard
          title="Mathematics"
          icon={Calculator}
          description="Visualize equations, explore geometric shapes, and understand mathematical concepts through interactive graphs and animations."
          href="/mathematics"
          bgClass="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40"
          hoverClass="hover:from-emerald-100 hover:via-teal-100 hover:to-cyan-100 dark:hover:from-emerald-950/50 dark:hover:via-teal-950/50 dark:hover:to-cyan-950/50"
          accentColor="bg-gradient-to-br from-emerald-400/20 to-teal-400/20"
          pattern={`
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="math-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <text x="10" y="35" font-family="serif" font-size="24" fill="currentColor" opacity="0.12">π</text>
                  <text x="45" y="55" font-family="serif" font-size="18" fill="currentColor" opacity="0.12">∑</text>
                  <text x="25" y="20" font-family="serif" font-size="16" fill="currentColor" opacity="0.1">∫</text>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#math-pattern)"/>
            </svg>
          `}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="font-mono">STEM Playground © 2024</p>
          <p className="text-sm mt-2">Interactive learning through visualization</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

