import { Link } from "react-router-dom";
import { Wrench, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TopicCard = ({
  name,
  description,
  href,
  icon: Icon,
}: {
  name: string;
  description: string;
  href: string;
  icon: React.ElementType;
}) => {
  return (
    <Link to={href}>
      <Card className="group hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-amber-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/15 group-hover:bg-amber-500/25 transition-colors">
              <Icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-2xl">{name}</CardTitle>
          </div>
          <CardDescription className="text-base mt-2">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" className="w-full group-hover:text-amber-700 dark:group-hover:text-amber-300">
            Explore <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

const EngineeringPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-amber-950/90 via-orange-950/85 to-amber-950/90 border-b border-amber-900/50">
        <div className="container mx-auto px-4 py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-amber-100/90 hover:text-white mb-6 transition-colors"
          >
            <span>←</span> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/30">
              <Wrench className="h-8 w-8 text-amber-300" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Engineering</h1>
              <p className="text-amber-100/85 text-lg mt-2">
                Build intuition for how things work with hands-on interactive labs
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TopicCard
            name="Electricity"
            description="See electrons, energy push, and how conductors and insulators change the flow."
            href="/engineering/electricity"
            icon={Zap}
          />
        </div>
      </div>
    </div>
  );
};

export default EngineeringPage;
