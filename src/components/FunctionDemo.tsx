import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Info, Play, RotateCcw, Square } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { cn } from "@/lib/utils";

const CANVAS_SIZE = 400;
const GRID_SIZE = 40;
const ROBOT_SIZE = 30;
const MOVE_SPEED = 2; // pixels per frame

type Direction = "up" | "down" | "left" | "right";
type Action = "forward" | "turnLeft";

// Define the path as waypoints with allowed directions at each point
interface PathPoint {
  x: number;
  y: number;
  allowedDirections: Direction[]; // Directions the robot can face/move from this point
}

const PATH: PathPoint[] = [
  { x: GRID_SIZE * 2, y: GRID_SIZE * 8, allowedDirections: ["right"] }, // Start - can only go right
  { x: GRID_SIZE * 6, y: GRID_SIZE * 8, allowedDirections: ["up"] }, // Junction 1 - must turn up
  { x: GRID_SIZE * 6, y: GRID_SIZE * 6, allowedDirections: ["right"] }, // Junction 2 - must turn right
  { x: GRID_SIZE * 8, y: GRID_SIZE * 6, allowedDirections: [] }, // End - no moves allowed
];

// Helper function to get direction from one point to another
const getDirectionToNextPoint = (current: PathPoint, next: PathPoint): Direction => {
  if (next.x > current.x) return "right";
  if (next.x < current.x) return "left";
  if (next.y > current.y) return "down";
  if (next.y < current.y) return "up";
  return "right";
};

interface RobotState {
  x: number;
  y: number;
  direction: Direction;
}

interface CodeDisplayProps {
  currentLine: number;
  isRunning: boolean;
  actions: Action[];
  functionName: string;
  showFunctionDefinition: boolean;
  hasReachedEnd: boolean;
}

const FunctionCodeDisplay = ({ currentLine, isRunning, actions, functionName, showFunctionDefinition, hasReachedEnd }: CodeDisplayProps) => {
  const getActionCode = (action: Action) => {
    switch (action) {
      case "forward": return "move_forward()";
      case "turnLeft": return "turn_left()";
    }
  };

  // In building mode, show individual function calls
  // In function execution mode, show the full function definition
  const lines = showFunctionDefinition
    ? [
        { num: 1, code: `def ${functionName}():`, indent: 0 },
        ...actions.map((action, idx) => ({
          num: idx + 2,
          code: `    ${getActionCode(action)}`,
          indent: 1,
          action,
        })),
      ]
    : actions.map((action, idx) => ({
        num: idx + 1,
        code: `${getActionCode(action)}`,
        indent: 0,
        action,
      }));

  return (
    <div className="bg-foreground/95 rounded-xl p-4 shadow-lg font-mono text-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-muted-foreground/20">
        <div className="w-3 h-3 rounded-full bg-no-color" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-yes-color" />
        <span className="ml-2 text-muted-foreground/60 text-xs">functions.py</span>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0">
        {lines.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground/60 text-sm italic">
              Code will appear here as you move the robot...
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {lines.map((line) => (
              <div key={line.num} className="space-y-1">
                <div
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
                {line.action && (
                  <div className="px-2" style={{ paddingLeft: `${(line.indent + 1) * 1.5}rem` }}>
                    <span className="text-muted-foreground/60 text-xs italic">
                      {line.action === "forward" && "# Robot moves forward along the path"}
                      {line.action === "turnLeft" && "# Robot turns left to change direction"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Explanation text */}
      <div className="mt-4 pt-3 border-t border-muted-foreground/20 flex-shrink-0">
        <p className="text-foreground/80 text-xs">
          {showFunctionDefinition && isRunning && currentLine === 1 && "Defining the function..."}
          {showFunctionDefinition && isRunning && currentLine > 1 && `Executing: ${getActionCode(lines[currentLine - 1]?.action || "forward")}`}
          {showFunctionDefinition && !isRunning && "Click the function button to see it execute all steps!"}
          {!showFunctionDefinition && actions.length === 0 && "Click buttons to move the robot step by step"}
          {!showFunctionDefinition && actions.length > 0 && !hasReachedEnd && `Step ${actions.length}: Keep going!`}
          {!showFunctionDefinition && hasReachedEnd && `Great! You took ${actions.length} steps. Now let's see how functions can do this in one call!`}
        </p>
      </div>
    </div>
  );
};

export const FunctionDemo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [robot, setRobot] = useState<RobotState>({
    x: PATH[0].x,
    y: PATH[0].y,
    direction: "right",
  });
  
  const [targetRobot, setTargetRobot] = useState<RobotState>({
    x: PATH[0].x,
    y: PATH[0].y,
    direction: "right",
  });
  
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  
  const [actions, setActions] = useState<Action[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [functionName, setFunctionName] = useState("move_robot_to_end");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFunctionDefinition, setShowFunctionDefinition] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "rgba(128, 128, 128, 0.2)";
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }
  };

  const drawPath = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 6;
    ctx.setLineDash([]);
    
    // Draw path connecting waypoints
    ctx.beginPath();
    ctx.moveTo(PATH[0].x, PATH[0].y);
    for (let i = 1; i < PATH.length; i++) {
      ctx.lineTo(PATH[i].x, PATH[i].y);
    }
    ctx.stroke();
    
    // Draw start marker (green)
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(PATH[0].x, PATH[0].y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw end marker (red)
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(PATH[PATH.length - 1].x, PATH[PATH.length - 1].y, 10, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawRobot = (ctx: CanvasRenderingContext2D, robotState: RobotState) => {
    const { x, y, direction } = robotState;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Calculate rotation based on direction
    let rotation = 0;
    switch (direction) {
      case "right": rotation = 0; break;
      case "down": rotation = Math.PI / 2; break;
      case "left": rotation = Math.PI; break;
      case "up": rotation = -Math.PI / 2; break;
    }
    ctx.rotate(rotation);
    
    // Draw robot body (triangle pointing right by default)
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(ROBOT_SIZE / 2, 0);
    ctx.lineTo(-ROBOT_SIZE / 2, -ROBOT_SIZE / 2);
    ctx.lineTo(-ROBOT_SIZE / 2, ROBOT_SIZE / 2);
    ctx.closePath();
    ctx.fill();
    
    // Draw robot face
    ctx.fillStyle = "#1f2937";
    ctx.beginPath();
    ctx.arc(ROBOT_SIZE / 4, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  const animate = useCallback(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw path
    drawPath(ctx);
    
    // Draw robot
    drawRobot(ctx, robot);
    
    // Smooth movement animation
    if (isAnimating) {
      const dx = targetRobot.x - robot.x;
      const dy = targetRobot.y - robot.y;
      
      if (Math.abs(dx) < MOVE_SPEED && Math.abs(dy) < MOVE_SPEED) {
        // Reached target
        setRobot(targetRobot);
        setIsAnimating(false);
      } else {
        // Move towards target
        setRobot(prev => ({
          ...prev,
          x: prev.x + Math.sign(dx) * Math.min(MOVE_SPEED, Math.abs(dx)),
          y: prev.y + Math.sign(dy) * Math.min(MOVE_SPEED, Math.abs(dy)),
          direction: targetRobot.direction, // Update direction immediately for turns
        }));
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [robot, targetRobot, isAnimating]);

  useEffect(() => {
    animate();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  const getCurrentPathPoint = (): PathPoint | null => {
    // Find the path point closest to current robot position
    const threshold = GRID_SIZE / 2;
    for (let i = 0; i < PATH.length; i++) {
      const point = PATH[i];
      const dx = Math.abs(robot.x - point.x);
      const dy = Math.abs(robot.y - point.y);
      if (dx < threshold && dy < threshold) {
        return point;
      }
    }
    return null;
  };

  const getNextPathPoint = (): PathPoint | null => {
    const currentPoint = getCurrentPathPoint();
    if (!currentPoint) return null;
    
    const currentIndex = PATH.indexOf(currentPoint);
    if (currentIndex < PATH.length - 1) {
      return PATH[currentIndex + 1];
    }
    return null;
  };

  const canMoveForward = (): boolean => {
    if (isRunning || isAnimating) return false;
    const currentPoint = getCurrentPathPoint();
    if (!currentPoint) return false;
    
    const currentIndex = PATH.indexOf(currentPoint);
    if (currentIndex >= PATH.length - 1) return false; // At end, can't move forward
    
    const nextPoint = PATH[currentIndex + 1];
    const requiredDirection = getDirectionToNextPoint(currentPoint, nextPoint);
    
    // Can only move forward if facing the correct direction
    return robot.direction === requiredDirection;
  };

  const canTurnLeft = (): boolean => {
    if (isRunning || isAnimating) return false;
    const currentPoint = getCurrentPathPoint();
    if (!currentPoint) return false;
    
    const currentIndex = PATH.indexOf(currentPoint);
    if (currentIndex >= PATH.length - 1) return false; // At end, can't turn
    
    // Can turn if there's a next point and we need to change direction
    if (currentIndex < PATH.length - 1) {
      const nextPoint = PATH[currentIndex + 1];
      const requiredDirection = getDirectionToNextPoint(currentPoint, nextPoint);
      // Can turn if we're not already facing the required direction
      return robot.direction !== requiredDirection;
    }
    
    return false;
  };

  const moveForward = () => {
    if (!canMoveForward() || showFunctionDefinition) return;
    
    const currentPoint = getCurrentPathPoint();
    if (!currentPoint) return;
    
    const currentIndex = PATH.indexOf(currentPoint);
    if (currentIndex >= PATH.length - 1) return;
    
    const nextPoint = PATH[currentIndex + 1];
    const newPathIndex = currentIndex + 1;
    setTargetRobot({ ...robot, x: nextPoint.x, y: nextPoint.y });
    setIsAnimating(true);
    setCurrentPathIndex(newPathIndex);
    setActions(prev => [...prev, "forward"]);
    
    // Check if we reached the end
    if (newPathIndex >= PATH.length - 1) {
      setTimeout(() => {
        setHasReachedEnd(true);
      }, 1000);
    }
  };

  const turnLeft = () => {
    if (!canTurnLeft() || showFunctionDefinition) return;
    
    const currentPoint = getCurrentPathPoint();
    if (!currentPoint) return;
    
    const currentIndex = PATH.indexOf(currentPoint);
    if (currentIndex >= PATH.length - 1) return;
    
    // Get the required direction to reach the next point
    const nextPoint = PATH[currentIndex + 1];
    const requiredDirection = getDirectionToNextPoint(currentPoint, nextPoint);
    
    // Turn to face the required direction
    setTargetRobot({ ...robot, direction: requiredDirection });
    setIsAnimating(true);
    setActions(prev => [...prev, "turnLeft"]);
    
    // For turns, animation completes immediately
    setTimeout(() => {
      setRobot(prev => ({ ...prev, direction: requiredDirection }));
      setIsAnimating(false);
    }, 300);
  };

  const executeAction = useCallback((action: Action, currentRobot: RobotState, currentIndex: number): Promise<{ robot: RobotState; pathIndex: number }> => {
    return new Promise((resolve) => {
      let newRobot: RobotState;
      let newPathIndex = currentIndex;
      
      if (action === "forward") {
        if (currentIndex < PATH.length - 1) {
          const nextPoint = PATH[currentIndex + 1];
          newRobot = { ...currentRobot, x: nextPoint.x, y: nextPoint.y };
          newPathIndex = currentIndex + 1;
        } else {
          newRobot = currentRobot;
        }
      } else if (action === "turnLeft") {
        const currentPoint = PATH[currentIndex];
        if (currentIndex < PATH.length - 1) {
          const nextPoint = PATH[currentIndex + 1];
          const requiredDirection = getDirectionToNextPoint(currentPoint, nextPoint);
          newRobot = { ...currentRobot, direction: requiredDirection };
        } else {
          newRobot = currentRobot;
        }
      } else {
        newRobot = currentRobot;
      }
      
      setTargetRobot(newRobot);
      setIsAnimating(true);
      
      // Wait for animation to complete
      setTimeout(() => {
        resolve({ robot: newRobot, pathIndex: newPathIndex });
      }, 1000);
    });
  }, []);

  const runFunction = async () => {
    if (isRunning || actions.length === 0) return;
    
    // Switch to function execution mode
    setShowFunctionDefinition(true);
    setIsRunning(true);
    setCurrentLine(1);
    setHasReachedEnd(false);
    
    // Reset robot to start
    const startRobot: RobotState = { x: PATH[0].x, y: PATH[0].y, direction: "right" };
    setRobot(startRobot);
    setTargetRobot(startRobot);
    setCurrentPathIndex(0);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Execute each action in sequence
    let currentRobot = startRobot;
    let currentIndex = 0;
    for (let i = 0; i < actions.length; i++) {
      setCurrentLine(i + 2);
      const result = await executeAction(actions[i], currentRobot, currentIndex);
      currentRobot = result.robot;
      currentIndex = result.pathIndex;
      setRobot(currentRobot);
      setCurrentPathIndex(currentIndex);
    }
    
    setIsRunning(false);
    setCurrentLine(1);
    setIsAnimating(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    const startRobot: RobotState = { x: PATH[0].x, y: PATH[0].y, direction: "right" };
    setRobot(startRobot);
    setTargetRobot(startRobot);
    setCurrentPathIndex(0);
    setActions([]);
    setCurrentLine(1);
    setIsAnimating(false);
    setShowFunctionDefinition(false);
    setHasReachedEnd(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
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
                  <span className="sr-only">Learn about functions</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <span>📚</span> Understanding Functions
                  </DialogTitle>
                  <DialogDescription className="text-base pt-2">
                    Learn how functions group multiple instructions together
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">What is a Function?</h3>
                    <p className="text-muted-foreground">
                      A <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">function</code> is a reusable block of code that groups multiple instructions together. Instead of writing the same sequence of commands repeatedly, you define it once and call it whenever needed.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">The Code Structure</h3>
                    <div className="bg-foreground/95 rounded-lg p-4 font-mono text-sm border border-border">
                      <div className="space-y-1">
                        <div><span className="text-muted-foreground/50">1</span> <span className="text-secondary">def</span> <span className="text-white">move_robot</span><span className="text-white">():</span></div>
                        <div className="pl-6"><span className="text-muted-foreground/50">2</span> <span className="text-white">    move_forward()</span></div>
                        <div className="pl-6"><span className="text-muted-foreground/50">3</span> <span className="text-white">    turn_left()</span></div>
                        <div className="pl-6"><span className="text-muted-foreground/50">4</span> <span className="text-white">    move_forward()</span></div>
                      </div>
                    </div>
                    <p className="text-white text-sm">
                      The <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">def</code> keyword defines a function. The code inside runs when you call the function. Instead of clicking buttons multiple times, you can call <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">move_robot()</code> to execute all the steps at once!
                    </p>
                  </div>

                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <span>💡</span> Key Point
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Functions make code reusable and organized. Once you define a sequence of moves, you can use it over and over again without rewriting the same instructions!
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            🤖 Functions
          </h1>
          <p className="text-muted-foreground text-lg">
            Learn how functions group multiple instructions together!
          </p>
        </header>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Left side - Canvas and controls */}
          <div className="flex flex-col animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="bg-card border border-border rounded-xl p-6 flex-shrink-0">
              <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                Robot Path
              </h3>
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  className="border border-border rounded-lg bg-background"
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-foreground text-center">
                Control Buttons
              </h3>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={moveForward}
                  disabled={!canMoveForward() || showFunctionDefinition}
                  variant="outline"
                  className="h-12"
                >
                  Move Forward
                </Button>
                <Button
                  onClick={turnLeft}
                  disabled={!canTurnLeft() || showFunctionDefinition}
                  variant="outline"
                  className="h-12"
                >
                  Turn Left
                </Button>
              </div>
              {hasReachedEnd && !showFunctionDefinition && (
                <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-sm text-foreground text-center font-semibold mb-2">
                    🎉 You reached the end!
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    How many steps did it take? <strong className="text-foreground">{actions.length}</strong>
                  </p>
                </div>
              )}
              
              <div className="pt-4 border-t border-border">
                {hasReachedEnd && !showFunctionDefinition && (
                  <Button
                    onClick={runFunction}
                    disabled={isRunning || actions.length === 0 || isAnimating}
                    className="w-full h-12 mb-2"
                    size="lg"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {functionName}()
                  </Button>
                )}
                {showFunctionDefinition && (
                  <div className="mb-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-sm text-foreground text-center">
                      <strong>Notice:</strong> Instead of {actions.length} separate button clicks, we can call <code className="font-mono text-accent">{functionName}()</code> once!
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleReset}
                  disabled={isRunning}
                  variant="outline"
                  className="w-full h-12"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {actions.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Function sequence ({actions.length} steps):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {actions.map((action, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded font-mono"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Code display */}
          <div className="flex flex-col animate-fade-in h-full" style={{ animationDelay: "0.2s" }}>
            <FunctionCodeDisplay
              currentLine={currentLine}
              isRunning={isRunning}
              actions={actions}
              functionName={functionName}
              showFunctionDefinition={showFunctionDefinition}
              hasReachedEnd={hasReachedEnd}
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
              <span>Click the control buttons to move the robot step by step</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">2.</span>
              <span>Each action is added to your function sequence</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">3.</span>
              <span>Watch the code update as you add actions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">4.</span>
              <span>Click <strong>Run Function</strong> to execute all actions automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">5.</span>
              <span>See how functions group multiple instructions into one reusable command!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

