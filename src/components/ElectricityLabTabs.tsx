import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabClass =
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function ElectricityLabTabs() {
  return (
    <nav aria-label="Electricity labs" className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
      <NavLink
        to="/engineering/electricity/lab"
        className={({ isActive }) =>
          cn(
            tabClass,
            isActive
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60",
          )
        }
        end
      >
        Flow simulator
      </NavLink>
      <NavLink
        to="/engineering/electricity/continuity"
        className={({ isActive }) =>
          cn(
            tabClass,
            isActive
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60",
          )
        }
      >
        Continuity test
      </NavLink>
    </nav>
  );
}
