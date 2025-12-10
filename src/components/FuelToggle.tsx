import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FuelToggleProps {
  fuel: boolean;
  onToggle: (value: boolean) => void;
}

export const FuelToggle = ({ fuel, onToggle }: FuelToggleProps) => {
  return (
    <div className="flex flex-col items-center gap-3 p-5 bg-card rounded-xl border border-border shadow-md">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⛽</span>
        <span className="text-lg font-semibold text-foreground">Fuel Tank</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={cn(
          "font-mono text-sm transition-colors",
          !fuel ? "text-no-color font-bold" : "text-muted-foreground"
        )}>
          False
        </span>
        
        <Switch
          checked={fuel}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-no-color"
        />
        
        <span className={cn(
          "font-mono text-sm transition-colors",
          fuel ? "text-yes-color font-bold" : "text-muted-foreground"
        )}>
          True
        </span>
      </div>
      
      <div className={cn(
        "w-full h-3 rounded-full transition-all duration-500 overflow-hidden",
        "bg-muted"
      )}>
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            fuel ? "bg-accent w-full" : "bg-no-color w-1/4"
          )}
        />
      </div>
    </div>
  );
};
