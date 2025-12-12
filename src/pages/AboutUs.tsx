import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Target, Lightbulb, Gamepad2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            About STEM Playground
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Where imagination meets understanding
          </p>

          {/* Mission Section */}
          <section className="mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl p-8 border border-blue-200/50 dark:border-blue-800/50">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Our Mission
              </h2>
              <p className="text-lg leading-relaxed text-foreground mb-4">
                STEM Playground was created with one simple mission:
              </p>
              <p className="text-lg leading-relaxed text-foreground font-semibold text-blue-700 dark:text-blue-300">
                to turn abstract concepts into interactive, hands-on learning experiences that students can see, feel, and understand.
              </p>
            </div>
          </section>

          {/* Main Content */}
          <section className="mb-16 space-y-6">
            <p className="text-base leading-relaxed text-foreground">
              Many learners struggle when ideas stay theoretical. Whether it's a loop in Python, a function, a physics principle, or a math process—concepts become clearer when students can interact with them. Our platform transforms these concepts into playful, game-like simulations that bridge the gap between imagination and understanding.
            </p>

            <p className="text-base leading-relaxed text-foreground">
              But we go beyond just explaining abstract ideas.
            </p>

            <p className="text-base leading-relaxed text-foreground">
              In many cases, learning requires real-world, hands-on experiences to build confidence and familiarity. STEM Playground helps students explore even those practical, step-by-step processes—like how a robot moves, how a machine works, or how conditions affect outcomes—through engaging animations and mini-games.
            </p>

            <p className="text-base leading-relaxed text-foreground font-semibold">
              This makes learning feel natural, intuitive, and fun.
            </p>
          </section>

          {/* What Makes Us Different */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
              <Sparkles className="h-7 w-7 text-yellow-500" />
              What Makes STEM Playground Different?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Gamepad2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Interactive Learning</h3>
                    <p className="text-muted-foreground">
                      Students don't just read—they do. They run trains, move robots, simulate machines, and watch code come alive.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Concept-to-Action Approach</h3>
                    <p className="text-muted-foreground">
                      Every idea is demonstrated through a real-time visual workflow, helping students understand not just what happens, but why.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Bridging Theory and Practice</h3>
                    <p className="text-muted-foreground">
                      Whether it's abstract logic or everyday processes, our animations turn complexity into simple, digestible learning moments.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Designed for Everyone</h3>
                    <p className="text-muted-foreground">
                      A playful mini-game environment that feels like a game but teaches like a classroom.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow md:col-span-2">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Built to Strengthen Understanding</h3>
                    <p className="text-muted-foreground">
                      Repetition, exploration, and experimentation help learners develop deeper mastery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Vision Section */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl p-8 border border-emerald-200/50 dark:border-emerald-800/50">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                Our Vision
              </h2>
              <p className="text-lg leading-relaxed text-foreground mb-6">
                To create a world where learning STEM is as exciting as playing a game—where every child can explore concepts, build confidence, and discover the joy of problem-solving.
              </p>
              <div className="space-y-4 mt-8">
                <p className="text-base leading-relaxed text-foreground font-semibold">
                  STEM Playground is where imagination meets understanding.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <p className="font-semibold text-foreground">A learning lab</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <p className="font-semibold text-foreground">A mini-game world</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <p className="font-semibold text-foreground">A hands-on classroom</p>
                  </div>
                </div>
                <p className="text-base leading-relaxed text-foreground text-center mt-6 font-semibold">
                  A place where ideas come alive.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-8">
            <Link to="/">
              <Button size="lg" className="gap-2">
                Explore STEM Playground
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

