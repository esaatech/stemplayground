import { useState, useEffect, useCallback, useRef } from "react";
import { Track } from "./Track";
import { ConditionBubble } from "./ConditionBubble";
import { FuelToggle } from "./FuelToggle";
import { ControlPanel } from "./ControlPanel";
import { CodeDisplay } from "./CodeDisplay";
import { toast } from "sonner";

const LOOP_DURATION = 3000; // 3 seconds per loop

export const WhileLoopDemo = () => {
  const [fuel, setFuel] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [loopCount, setLoopCount] = useState(0);
  
  const fuelRef = useRef(fuel);
  const isRunningRef = useRef(isRunning);
  
  // Keep refs in sync
  useEffect(() => {
    fuelRef.current = fuel;
  }, [fuel]);
  
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const runLoop = useCallback(() => {
    if (!fuelRef.current || !isRunningRef.current) {
      setIsRunning(false);
      setCurrentLine(4);
      toast.info("Train stopped! 🛑", { description: "fuel == False" });
      return;
    }

    // Check condition (line 1)
    setIsChecking(true);
    setCurrentLine(1);
    
    setTimeout(() => {
      setIsChecking(false);
      
      if (!fuelRef.current || !isRunningRef.current) {
        setIsRunning(false);
        setCurrentLine(4);
        toast.info("Train stopped! 🛑", { description: "fuel == False" });
        return;
      }
      
      // Move train (line 2)
      setCurrentLine(2);
      
      setTimeout(() => {
        // Check fuel again (line 3)
        setCurrentLine(3);
        setLoopCount(prev => prev + 1);
        
        setTimeout(() => {
          // Loop back or stop
          runLoop();
        }, 500);
      }, LOOP_DURATION - 1000);
    }, 500);
  }, []);

  const handleRun = () => {
    if (!fuel) {
      toast.warning("Cannot start! ⚠️", { 
        description: "Fuel is False. Toggle fuel to True first!" 
      });
      return;
    }
    
    setIsRunning(true);
    setCurrentLine(1);
    toast.success("Train starting! 🚂", { description: "Entering while loop..." });
    
    // Small delay to let state update
    setTimeout(() => {
      runLoop();
    }, 100);
  };

  const handleStop = () => {
    setIsRunning(false);
    setCurrentLine(4);
    toast.info("Train stopped manually! 🛑");
  };

  const handleReset = () => {
    setIsRunning(false);
    setFuel(true);
    setCurrentLine(1);
    setLoopCount(0);
    setIsChecking(false);
    toast.success("Reset complete! 🔄", { description: "Ready to run again." });
  };

  const handleFuelToggle = (value: boolean) => {
    setFuel(value);
    if (!value && isRunning) {
      toast.info("Fuel depleted! ⛽", { 
        description: "Train will stop after current loop." 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            🚂 While Loop Train
          </h1>
          <p className="text-muted-foreground text-lg">
            Watch how a <code className="text-secondary font-mono bg-muted px-2 py-1 rounded">while</code> loop works!
          </p>
        </header>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left side - Track and controls */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <Track isRunning={isRunning} />
            
            <div className="flex justify-center">
              <ControlPanel
                isRunning={isRunning}
                onRun={handleRun}
                onStop={handleStop}
                onReset={handleReset}
              />
            </div>
            
            {loopCount > 0 && (
              <p className="text-center text-muted-foreground">
                Loops completed: <span className="font-bold text-secondary">{loopCount}</span>
              </p>
            )}
          </div>

          {/* Right side - Logic display */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <ConditionBubble fuel={fuel} isChecking={isChecking} />
            
            <FuelToggle fuel={fuel} onToggle={handleFuelToggle} />
            
            <CodeDisplay currentLine={currentLine} isRunning={isRunning} />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <span>📖</span> How it works
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent">1.</span>
              <span>Click <strong>Run</strong> to start the while loop</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">2.</span>
              <span>The train checks if <code className="font-mono text-secondary">fuel == True</code> before each loop</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">3.</span>
              <span>Toggle <strong>Fuel</strong> to <code className="font-mono text-no-color">False</code> to stop the train</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">4.</span>
              <span>Click <strong>Reset</strong> to start over</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
