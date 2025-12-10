import { useState, useEffect, useRef, useCallback } from "react";
import { Track } from "./Track";
import { FuelToggle } from "./FuelToggle";
import { ControlPanel } from "./ControlPanel";
import { CodeDisplay } from "./CodeDisplay";

const LOOP_DURATION = 3000; // 3 seconds per loop

export const WhileLoopDemo = () => {
  const [fuel, setFuel] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<boolean | null>(null);
  const [showNoFuelMessage, setShowNoFuelMessage] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [loopCount, setLoopCount] = useState(0);
  const [rotation, setRotation] = useState(0);
  
  const fuelRef = useRef(fuel);
  const isRunningRef = useRef(isRunning);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startRotationRef = useRef<number>(0);
  
  useEffect(() => {
    fuelRef.current = fuel;
  }, [fuel]);
  
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const performCheck = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      setIsChecking(true);
      setCurrentLine(1);
      setCheckResult(null);
      setShowNoFuelMessage(false);
      
      // Show question first
      setTimeout(() => {
        // Then show answer
        const hasFuel = fuelRef.current;
        setCheckResult(hasFuel);
        
        setTimeout(() => {
          setIsChecking(false);
          
          if (!hasFuel) {
            // Show the "can't loop" message
            setShowNoFuelMessage(true);
            setCurrentLine(4);
          }
          
          resolve(hasFuel);
        }, 1000);
      }, 800);
    });
  }, []);

  const animateLoop = useCallback(() => {
    const startTime = performance.now();
    startTimeRef.current = startTime;
    startRotationRef.current = rotation;
    
    const animate = (currentTime: number) => {
      if (!isRunningRef.current) {
        return;
      }
      
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / LOOP_DURATION, 1);
      
      // Easing function for smoother animation
      const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const easedProgress = easeInOut(progress);
      
      const newRotation = startRotationRef.current + (360 * easedProgress);
      setRotation(newRotation);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Loop complete
        setRotation(startRotationRef.current + 360);
        setLoopCount(prev => prev + 1);
        setCurrentLine(3);
        
        // Small delay then check again
        setTimeout(async () => {
          const hasFuel = await performCheck();
          
          if (hasFuel && isRunningRef.current) {
            setCurrentLine(2);
            animateLoop();
          } else {
            setIsRunning(false);
          }
        }, 300);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [rotation, performCheck]);

  const handleRun = async () => {
    // Always perform the check first - this is the while loop condition!
    setIsRunning(true);
    setShowNoFuelMessage(false);
    setCheckResult(null);
    
    const hasFuel = await performCheck();
    
    if (hasFuel) {
      setCurrentLine(2);
      animateLoop();
    } else {
      // Don't actually "run" - the check showed NO
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsChecking(false);
    setCheckResult(null);
    setShowNoFuelMessage(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCurrentLine(4);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsChecking(false);
    setCheckResult(null);
    setShowNoFuelMessage(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setFuel(true);
    setCurrentLine(1);
    setLoopCount(0);
    setRotation(0);
  };

  const handleFuelToggle = (value: boolean) => {
    setFuel(value);
    // Clear the no fuel message when toggling
    if (value) {
      setShowNoFuelMessage(false);
      setCheckResult(null);
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
            <Track 
              rotation={rotation} 
              isChecking={isChecking}
              checkResult={checkResult}
              showNoFuelMessage={showNoFuelMessage}
            />
            
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
            <FuelToggle fuel={fuel} onToggle={handleFuelToggle} />
            
            <CodeDisplay currentLine={currentLine} isRunning={isRunning || isChecking} />
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
              <span>The train <strong>always checks first</strong>: "Do I have fuel?"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">3.</span>
              <span>If YES → train moves one loop, then checks again</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">4.</span>
              <span>If NO → train cannot loop and stops immediately</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">5.</span>
              <span>Toggle <strong>Fuel</strong> to <code className="font-mono text-no-color">False</code> and click Run to see what happens!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
