import { cn } from "@/lib/utils";

interface ThoughtBubbleProps {
  isVisible: boolean;
  checkResult: boolean | null;
}

export const ThoughtBubble = ({ isVisible, checkResult }: ThoughtBubbleProps) => {
  if (!isVisible) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Question bubble */}
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
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-bubble-border" />
        </div>
      </div>
      
      {/* Answer bubble */}
      {checkResult !== null && (
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
          
          {/* Connector dots */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="w-2 h-2 rounded-full bg-current opacity-50" />
          </div>
        </div>
      )}
    </div>
  );
};
