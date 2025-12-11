import { cn } from "@/lib/utils";

interface CodeDisplayProps {
  currentLine: number;
  isRunning: boolean;
}

export const CodeDisplay = ({ currentLine, isRunning }: CodeDisplayProps) => {
  const lines = [
    { num: 1, code: "while Fuel:", indent: 0, highlight: "keyword" },
    { num: 2, code: "move_train_one_loop()", indent: 1, highlight: "function" },
  ];

  return (
    <div className="bg-foreground/95 rounded-xl p-4 shadow-lg font-mono text-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-muted-foreground/20">
        <div className="w-3 h-3 rounded-full bg-no-color" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-yes-color" />
        <span className="ml-2 text-muted-foreground/60 text-xs">while_loop.py</span>
      </div>
      
      <div className="space-y-1">
        {lines.map((line) => (
          <div
            key={line.num}
            className={cn(
              "flex items-center gap-3 px-2 py-1.5 rounded transition-all duration-300",
              isRunning && currentLine === line.num && "bg-secondary/30"
            )}
          >
            <span className="text-muted-foreground/50 w-4 text-right text-xs">
              {line.num}
            </span>
            <span 
              className={cn(
                "transition-colors flex-1",
                isRunning && currentLine === line.num 
                  ? "text-secondary" 
                  : "text-muted"
              )}
              style={{ paddingLeft: `${line.indent * 1.5}rem` }}
            >
              {line.code}
            </span>
            {isRunning && currentLine === line.num && (
              <span className="text-secondary animate-pulse">◄</span>
            )}
          </div>
        ))}
      </div>
      
      {/* Explanation text */}
      <div className="mt-4 pt-3 border-t border-muted-foreground/20">
        <p className="text-muted-foreground/70 text-xs">
          {currentLine === 1 && "Entering while loop..."}
          {currentLine === 2 && "Moving train around the track..."}
        </p>
      </div>
    </div>
  );
};
