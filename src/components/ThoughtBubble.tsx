import { cn } from "@/lib/utils";

interface ThoughtBubbleProps {
  isVisible: boolean;
  checkResult: boolean | null;
  showNoFuelMessage: boolean;
}

export const ThoughtBubble = ({ isVisible, checkResult, showNoFuelMessage }: ThoughtBubbleProps) => {
  if (!isVisible) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Question bubble - always show when checking */}
      {!showNoFuelMessage && (
        <div className={cn(
          "relative bubble-gradient border-2 border-bubble-border rounded-2xl px-4 py-3 shadow-lg",
          "animate-fade-in"
        )}>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground whitespace-nowrap">
              🤔 Do I have fuel?
            </p>
          </div>
          
          {/* Thought bubble dots */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <div className="w-2 h-2 rounded-full bg-bubble-border" />
          </div>
        </div>
      )}
      
      {/* Answer bubble */}
      {checkResult !== null && !showNoFuelMessage && (
        <div className={cn(
          "relative rounded-xl px-4 py-2 shadow-lg animate-fade-in",
          checkResult 
            ? "bg-yes-color text-accent-foreground" 
            : "bg-no-color text-destructive-foreground"
        )}>
          <div className="flex items-center gap-2 font-bold text-lg">
            <span>{checkResult ? "✓" : "✗"}</span>
            <span>{checkResult ? "YES!" : "NO!"}</span>
          </div>
        </div>
      )}
      
      {/* No fuel explanation message */}
      {showNoFuelMessage && (
        <div className="animate-fade-in flex flex-col items-center gap-2">
          <div className="bg-no-color text-destructive-foreground rounded-xl px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span>✗</span>
              <span>NO!</span>
            </div>
          </div>
          
          <div className="bg-card border-2 border-no-color/50 rounded-xl px-4 py-3 shadow-lg max-w-xs">
            <p className="text-sm text-center text-foreground">
              <span className="font-semibold">🚫 I cannot loop!</span>
              <br />
              <span className="text-muted-foreground">
                The condition <code className="font-mono text-no-color">Fuel = False</code>, so the while loop never starts.
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
