import { cn } from "@/lib/utils";

interface ConditionBubbleProps {
  fuel: boolean;
  isChecking: boolean;
}

export const ConditionBubble = ({ fuel, isChecking }: ConditionBubbleProps) => {
  return (
    <div className={cn(
      "relative bubble-gradient border-2 border-bubble-border rounded-2xl p-5 shadow-lg transition-all duration-300",
      isChecking && "glow-pulse"
    )}>
      {/* Speech bubble pointer */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45 bg-card border-r-2 border-b-2 border-bubble-border" />
      
      <div className="text-center space-y-3">
        <p className="text-lg font-semibold text-foreground">
          🤔 Do I have fuel?
        </p>
        
        <div className="font-mono text-sm bg-muted px-3 py-2 rounded-lg">
          <span className="text-secondary">fuel</span>
          <span className="text-muted-foreground"> == </span>
          <span className="text-primary">True</span>
          <span className="text-muted-foreground"> ?</span>
        </div>
        
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg transition-all duration-300",
          fuel 
            ? "bg-yes-color text-accent-foreground" 
            : "bg-no-color text-destructive-foreground"
        )}>
          <span className="text-xl">{fuel ? "✓" : "✗"}</span>
          <span>{fuel ? "YES" : "NO"}</span>
        </div>
      </div>
    </div>
  );
};
