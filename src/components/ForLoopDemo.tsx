import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { ControlPanel } from "./ControlPanel";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { cn } from "@/lib/utils";

const ITERATION_DURATION = 1500; // 1.5 seconds per iteration

interface CodeDisplayProps {
  currentLine: number;
  isRunning: boolean;
  currentIteration: number | null;
  rangeValue: number;
}

const ForLoopCodeDisplay = ({ currentLine, isRunning, currentIteration, rangeValue }: CodeDisplayProps) => {
  const lines = [
    { num: 1, code: `for i in range(${rangeValue}):`, indent: 0, highlight: "keyword" },
    { num: 2, code: "    print(i)", indent: 1, highlight: "function" },
  ];

  return (
    <div className="bg-foreground/95 rounded-xl p-4 shadow-lg font-mono text-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-muted-foreground/20">
        <div className="w-3 h-3 rounded-full bg-no-color" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-yes-color" />
        <span className="ml-2 text-muted-foreground/60 text-xs">for_loop.py</span>
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
        <p className="text-foreground/80 text-xs">
          {currentLine === 1 && currentIteration !== null && `Iteration ${currentIteration + 1} of ${rangeValue}`}
          {currentLine === 1 && currentIteration === null && "Starting for loop..."}
          {currentLine === 2 && currentIteration !== null && `Printing: ${currentIteration}`}
          {!isRunning && currentIteration === null && "Ready to run"}
        </p>
      </div>
    </div>
  );
};

interface BoxProps {
  index: number;
  isFilled: boolean;
  isActive: boolean;
  value: number | null;
}

const Box = ({ index, isFilled, isActive, value }: BoxProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "w-20 h-20 rounded-xl border-2 transition-all duration-500 flex items-center justify-center",
          isFilled
            ? "bg-secondary border-secondary shadow-lg scale-105"
            : "bg-card border-border",
          isActive && "ring-4 ring-secondary/50 ring-offset-2"
        )}
      >
        {isFilled && (
          <span className="text-2xl font-bold text-secondary-foreground">
            {value}
          </span>
        )}
      </div>
      <span className={cn(
        "text-xs font-mono",
        isFilled ? "text-secondary font-bold" : "text-muted-foreground"
      )}>
        i = {value !== null ? value : "?"}
      </span>
    </div>
  );
};

export const ForLoopDemo = () => {
  const [rangeValue, setRangeValue] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIteration, setCurrentIteration] = useState<number | null>(null);
  const [currentLine, setCurrentLine] = useState(1);
  const [filledBoxes, setFilledBoxes] = useState<number[]>([]);
  
  const isRunningRef = useRef(isRunning);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const animateIteration = useCallback((iteration: number) => {
    if (!isRunningRef.current) return;

    // Show line 1 (for loop line)
    setCurrentLine(1);
    setCurrentIteration(iteration);
    
    setTimeout(() => {
      if (!isRunningRef.current) return;
      
      // Show line 2 (print statement)
      setCurrentLine(2);
      
      // Fill the box
      setFilledBoxes(prev => [...prev, iteration]);
      
      setTimeout(() => {
        if (!isRunningRef.current) return;
        
        // Move to next iteration
        if (iteration < rangeValue - 1) {
          setCurrentLine(1);
          animationTimeoutRef.current = setTimeout(() => {
            animateIteration(iteration + 1);
          }, 300);
        } else {
          // Loop complete
          setIsRunning(false);
          setCurrentLine(1);
        }
      }, ITERATION_DURATION / 2);
    }, ITERATION_DURATION / 2);
  }, [rangeValue]);

  const handleRun = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setFilledBoxes([]);
    setCurrentIteration(null);
    setCurrentLine(1);
    
    // Start with iteration 0
    setTimeout(() => {
      animateIteration(0);
    }, 500);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setFilledBoxes([]);
    setCurrentIteration(null);
    setCurrentLine(1);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
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
                  <span className="sr-only">Learn about for loops</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <span>📚</span> Understanding For Loops
                  </DialogTitle>
                  <DialogDescription className="text-base pt-2">
                    Learn how the <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">for</code> loop works with <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">range()</code>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">What is a For Loop?</h3>
                    <p className="text-muted-foreground">
                      A <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">for</code> loop repeats a block of code a <strong>specific number of times</strong>. Unlike a while loop that continues until a condition is false, a for loop runs a predetermined number of iterations.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">The Code Structure</h3>
                    <div className="bg-foreground/95 rounded-lg p-4 font-mono text-sm border border-border">
                      <div className="space-y-1">
                        <div><span className="text-muted-foreground/50">1</span> <span className="text-secondary">for</span> <span className="text-white">i</span> <span className="text-secondary">in</span> <span className="text-white">range(5):</span></div>
                        <div className="pl-6"><span className="text-muted-foreground/50">2</span> <span className="text-white">print(i)</span></div>
                      </div>
                    </div>
                    <p className="text-white text-sm">
                      The <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">range(5)</code> function creates a sequence from 0 to 4 (5 numbers total). The variable <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">i</code> takes each value in sequence.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">How It Works</h3>
                    <ol className="space-y-3 text-muted-foreground">
                      <li className="flex gap-3">
                        <span className="text-accent font-bold flex-shrink-0">1.</span>
                        <div>
                          <strong className="text-foreground">Initialization:</strong> The loop starts with <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">i = 0</code> (the first value in range(5)).
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-accent font-bold flex-shrink-0">2.</span>
                        <div>
                          <strong className="text-foreground">Execute Code:</strong> The code inside the loop runs with the current value of <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">i</code>.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-accent font-bold flex-shrink-0">3.</span>
                        <div>
                          <strong className="text-foreground">Increment:</strong> <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">i</code> automatically becomes the next value (1, then 2, then 3, then 4).
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-accent font-bold flex-shrink-0">4.</span>
                        <div>
                          <strong className="text-foreground">Repeat:</strong> Steps 2-3 repeat until all values in the range have been used.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-accent font-bold flex-shrink-0">5.</span>
                        <div>
                          <strong className="text-foreground">Complete:</strong> When all iterations are done, the loop ends and execution continues after the loop.
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <span>💡</span> Key Point
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">range(5)</code> generates the sequence [0, 1, 2, 3, 4] - notice it starts at 0 and goes up to (but not including) 5. This is why you see 5 boxes but the values are 0-4.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            🔢 For Loop with Range
          </h1>
          <p className="text-muted-foreground text-lg">
            Watch how a <code className="text-secondary font-mono bg-muted px-2 py-1 rounded">for</code> loop iterates through a range!
          </p>
        </header>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left side - Boxes visualization */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Range Value: <span className="text-secondary font-mono">{rangeValue}</span>
                </label>
                <Slider
                  value={[rangeValue]}
                  onValueChange={(value) => {
                    if (!isRunning) {
                      setRangeValue(value[0]);
                      handleReset();
                    }
                  }}
                  min={1}
                  max={10}
                  step={1}
                  disabled={isRunning}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center items-start">
                {Array.from({ length: rangeValue }).map((_, index) => (
                  <Box
                    key={index}
                    index={index}
                    isFilled={filledBoxes.includes(index)}
                    isActive={currentIteration === index}
                    value={filledBoxes.includes(index) ? index : null}
                  />
                ))}
              </div>
              
              {filledBoxes.length === rangeValue && !isRunning && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Loop complete! All {rangeValue} iterations finished.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <ControlPanel
                isRunning={isRunning}
                onRun={handleRun}
                onStop={handleStop}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* Right side - Code display */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <ForLoopCodeDisplay
              currentLine={currentLine}
              isRunning={isRunning}
              currentIteration={currentIteration}
              rangeValue={rangeValue}
            />
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
              <span>Adjust the <strong>Range Value</strong> slider to set how many times the loop will run</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">2.</span>
              <span>Click <strong>Run</strong> to start the for loop</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">3.</span>
              <span>Watch as each box fills up with the iteration number (0, 1, 2, ...)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">4.</span>
              <span>The loop runs exactly <code className="font-mono text-no-color">range</code> number of times, then stops automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">5.</span>
              <span>Notice that <code className="font-mono text-no-color">range(5)</code> gives values 0-4, not 1-5!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

