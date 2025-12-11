import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { Track } from "./Track";
import { FuelToggle } from "./FuelToggle";
import { ControlPanel } from "./ControlPanel";
import { CodeDisplay } from "./CodeDisplay";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

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
        
        // Small delay then check again
        setTimeout(async () => {
          const hasFuel = await performCheck();
          
          if (hasFuel && isRunningRef.current) {
            setCurrentLine(1); // Go back to check while condition
            setTimeout(() => {
              setCurrentLine(2);
              animateLoop();
            }, 500);
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
        {/* Back Navigation */}
        <Link 
          to="/programming/python" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <span>←</span> Back to Python
        </Link>

        {/* Header */}
        <header className="text-center space-y-2 animate-fade-in relative">
          <div className="absolute top-0 right-0 md:right-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Info className="h-5 w-5" />
                  <span className="sr-only">Learn about while loops</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <span>📚</span> Understanding While Loops
                  </DialogTitle>
                  <DialogDescription className="text-base pt-2">
                    Learn how the <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">while</code> loop works step by step
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">What is a While Loop?</h3>
                    <p className="text-muted-foreground">
                      A <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">while</code> loop is a control structure that repeats a block of code <strong>as long as a condition is True</strong>. It automatically checks the condition before each iteration.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">The Code Structure</h3>
                    <div className="bg-foreground/95 rounded-lg p-4 font-mono text-sm border border-border">
                      <div className="space-y-1">
                        <div><span className="text-muted-foreground/50">1</span> <span className="text-secondary">while</span> <span className="text-white">Fuel:</span></div>
                        <div className="pl-6"><span className="text-muted-foreground/50">2</span> <span className="text-white">move_train_one_loop()</span></div>
                      </div>
                    </div>
                    <p className="text-white text-sm">
                      The condition <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">Fuel</code> is checked automatically by the while loop. If <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">Fuel = True</code>, the loop continues. If <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">Fuel = False</code>, the loop stops.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">How It Works</h3>
                    <ol className="space-y-3 text-muted-foreground">
                      <li className="flex gap-3">
                        <span className="text-accent font-bold flex-shrink-0">1.</span>
                        <div>
                          <strong className="text-foreground">Check Condition:</strong> The while loop first checks if <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">Fuel</code> is <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">True</code> or <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">False</code>.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-accent font-bold flex-shrink-0">2.</span>
                        <div>
                          <strong className="text-foreground">If True:</strong> The code inside the loop runs (<code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">move_train_one_loop()</code>). After completing, the loop automatically goes back to step 1 to check the condition again.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-accent font-bold flex-shrink-0">3.</span>
                        <div>
                          <strong className="text-foreground">If False:</strong> The loop stops immediately. The code inside the loop never runs, and execution continues after the while block.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-accent font-bold flex-shrink-0">4.</span>
                        <div>
                          <strong className="text-foreground">Repeat:</strong> This process continues until the condition becomes <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">False</code>.
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <span>💡</span> Key Point
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      The condition is checked <strong>before every iteration</strong>, not just once. This means even if <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">Fuel</code> becomes <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">False</code> during the loop, the next check will catch it and stop the loop.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">Try It Out!</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li className="flex gap-2">
                        <span className="text-accent">•</span>
                        <span>Set <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">Fuel = True</code> and click Run to see the train loop continuously</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-accent">•</span>
                        <span>Set <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">Fuel = False</code> and click Run to see the loop never start</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-accent">•</span>
                        <span>Watch how the code highlights each line as the loop executes</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
