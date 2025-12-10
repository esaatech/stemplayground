import { cn } from "@/lib/utils";

interface TrainProps {
  isRunning: boolean;
}

export const Train = ({ isRunning }: TrainProps) => {
  return (
    <div className={cn("relative", isRunning && "train-running")}>
      {/* Smoke puffs */}
      {isRunning && (
        <>
          <div 
            className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-muted-foreground/30 train-smoke"
            style={{ animationDelay: "0s" }}
          />
          <div 
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-muted-foreground/20 train-smoke"
            style={{ animationDelay: "0.3s" }}
          />
        </>
      )}
      
      {/* Train SVG */}
      <svg 
        width="50" 
        height="35" 
        viewBox="0 0 50 35" 
        className="drop-shadow-lg"
      >
        {/* Main body */}
        <rect 
          x="8" 
          y="8" 
          width="32" 
          height="18" 
          rx="3" 
          className="fill-primary"
        />
        
        {/* Cabin */}
        <rect 
          x="25" 
          y="3" 
          width="15" 
          height="12" 
          rx="2" 
          className="fill-primary"
        />
        
        {/* Window */}
        <rect 
          x="28" 
          y="6" 
          width="9" 
          height="6" 
          rx="1" 
          className="fill-secondary"
        />
        
        {/* Chimney */}
        <rect 
          x="12" 
          y="2" 
          width="6" 
          height="8" 
          rx="1" 
          className="fill-foreground/80"
        />
        
        {/* Chimney top */}
        <rect 
          x="10" 
          y="0" 
          width="10" 
          height="3" 
          rx="1" 
          className="fill-foreground/60"
        />
        
        {/* Cow catcher */}
        <polygon 
          points="2,26 8,18 8,26" 
          className="fill-foreground/70"
        />
        
        {/* Wheels */}
        <circle cx="15" cy="28" r="5" className="fill-foreground/90" />
        <circle cx="15" cy="28" r="2" className="fill-muted" />
        
        <circle cx="30" cy="28" r="5" className="fill-foreground/90" />
        <circle cx="30" cy="28" r="2" className="fill-muted" />
        
        {/* Connecting rod */}
        <rect 
          x="14" 
          y="27" 
          width="17" 
          height="2" 
          rx="1" 
          className="fill-foreground/60"
        />
        
        {/* Details */}
        <circle cx="22" cy="17" r="3" className="fill-secondary/80" />
        <rect x="35" y="20" width="4" height="6" rx="1" className="fill-foreground/50" />
      </svg>
    </div>
  );
};
