import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Square } from "lucide-react";

interface ControlPanelProps {
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const ControlPanel = ({ isRunning, onRun, onStop, onReset }: ControlPanelProps) => {
  return (
    <div className="flex items-center gap-3">
      {!isRunning ? (
        <Button 
          onClick={onRun}
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Play className="w-5 h-5" />
          Run
        </Button>
      ) : (
        <Button 
          onClick={onStop}
          size="lg"
          variant="destructive"
          className="font-semibold gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Square className="w-5 h-5" />
          Stop
        </Button>
      )}
      
      <Button 
        onClick={onReset}
        size="lg"
        variant="outline"
        className="font-semibold gap-2 border-2 hover:bg-muted transition-all"
      >
        <RotateCcw className="w-5 h-5" />
        Reset
      </Button>
    </div>
  );
};
