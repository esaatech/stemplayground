import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { ControlPanel } from "./ControlPanel";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { cn } from "@/lib/utils";
// Import container images from assets
import containerEmpty from "@/assets/containers/container-empty.png";
import containerApple from "@/assets/containers/container-apple.png";
import containerBall from "@/assets/containers/container-ball.png";
import containerCar from "@/assets/containers/container-car.png";
import containerNumber from "@/assets/containers/container-number.png";

// Python variable name validation
const isValidPythonVariableName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Variable name cannot be empty" };
  }
  
  // Check if it starts with a number
  if (/^\d/.test(name)) {
    return { valid: false, error: "Variable name cannot start with a number" };
  }
  
  // Check if it contains only letters, numbers, and underscores
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    return { valid: false, error: "Variable name can only contain letters, numbers, and underscores" };
  }
  
  // Check if it's a Python keyword
  const pythonKeywords = ['and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'];
  if (pythonKeywords.includes(name.toLowerCase())) {
    return { valid: false, error: "This is a Python keyword and cannot be used as a variable name" };
  }
  
  return { valid: true };
};

interface DragState {
  type: ObjectType;
  count: number;
  targetVariable: string | null;
}

const STEP_DURATION = 2000; // 2 seconds per step

type ObjectType = "apple" | "ball" | "car" | "number";
type VariableValue = { type: ObjectType; count: number } | null;

interface CodeDisplayProps {
  currentLine: number;
  isRunning: boolean;
  variables: Record<string, VariableValue>;
  variableNames: Record<string, string>;
  dragState: DragState | null;
}

const VariableCodeDisplay = ({ currentLine, isRunning, variables, variableNames, dragState }: CodeDisplayProps) => {
  const getValueDisplay = (varName: string) => {
    // Show drag preview if dragging to this variable
    if (dragState && dragState.targetVariable === varName) {
      return dragState.type === "number" ? "1" : dragState.type;
    }
    const value = variables[varName];
    if (!value) return "?";
    return value.type === "number" ? "1" : value.type;
  };

  const getComment = (varName: string) => {
    if (dragState && dragState.targetVariable === varName) {
      return `# Dragging ${dragState.type === "number" ? "the number 1" : `a ${dragState.type}`} into ${variableNames[varName] || varName}`;
    }
    const value = variables[varName];
    if (!value) {
      return `# ${variableNames[varName] || varName} is empty - drag an object here to assign a value`;
    }
    return `# ${variableNames[varName] || varName} now contains ${value.type === "number" ? "the number 1" : `a ${value.type}`}`;
  };

  const varKeys = Object.keys(variables);
  const lines = varKeys.map((varName, index) => ({
    num: index + 1,
    code: `${variableNames[varName] || varName} = ${getValueDisplay(varName)}`,
    comment: getComment(varName),
    indent: 0,
  }));

  return (
    <div className="bg-foreground/95 rounded-xl p-4 shadow-lg font-mono text-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-muted-foreground/20">
        <div className="w-3 h-3 rounded-full bg-no-color" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-yes-color" />
        <span className="ml-2 text-muted-foreground/60 text-xs">variables.py</span>
      </div>
      
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
            <div className="px-2 pl-7">
              <span className="text-muted-foreground/60 text-xs italic">
                {line.comment}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Explanation text */}
      <div className="mt-4 pt-3 border-t border-muted-foreground/20">
        <p className="text-foreground/80 text-xs">
          {!isRunning && "Ready to assign - click variable names to edit them"}
        </p>
      </div>
    </div>
  );
};

const ObjectIcon = ({ type, size = "md" }: { type: ObjectType; size?: "sm" | "md" | "lg" }) => {
  const sizeClass = size === "sm" ? "w-6 h-6" : size === "md" ? "w-8 h-8" : "w-12 h-12";
  
  const icons = {
    apple: "🍎",
    ball: "⚽",
    car: "🚗",
    number: "1",
  };

  if (type === "number") {
    return (
      <span className={cn("inline-block font-bold text-foreground", sizeClass)} style={{ fontSize: size === "sm" ? "1.5rem" : size === "md" ? "2rem" : "3rem" }}>
        {icons[type]}
      </span>
    );
  }

  return (
    <span className={cn("inline-block", sizeClass)} style={{ fontSize: size === "sm" ? "1.5rem" : size === "md" ? "2rem" : "3rem" }}>
      {icons[type]}
    </span>
  );
};

interface VariableBoxProps {
  name: string;
  displayName: string;
  value: VariableValue;
  isActive: boolean;
  onDrop: (varName: string, type: ObjectType, count: number) => void;
  onDragOver: (varName: string) => void;
  onDragLeave: () => void;
  onNameClick: (varName: string) => void;
  dragState: DragState | null;
}

const getContainerImage = (type: ObjectType | null): string => {
  if (!type) return containerEmpty;
  switch (type) {
    case "apple": return containerApple;
    case "ball": return containerBall;
    case "car": return containerCar;
    case "number": return containerNumber;
    default: return containerEmpty;
  }
};

const VariableBox = ({ name, displayName, value, isActive, onDrop, onDragOver, onDragLeave, onNameClick, dragState }: VariableBoxProps) => {
  const isDragOver = dragState?.targetVariable === name;
  const isDragging = dragState !== null;
  const displayType = isDragOver && dragState ? dragState.type : (value ? value.type : null);
  const containerImage = getContainerImage(displayType);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragState) {
      onDragOver(name);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragState) {
      onDrop(name, dragState.type, dragState.count);
    }
  };

  const handleDragLeave = () => {
    onDragLeave();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Container Box */}
      <div
        className={cn(
          "relative w-40 h-40 transition-all duration-300",
          "transform-gpu",
          isActive && "ring-4 ring-secondary/50 ring-offset-2 scale-105",
          isDragOver && "scale-110 ring-4 ring-secondary/50",
        )}
        style={{
          transform: isDragOver ? 'perspective(1000px) rotateX(5deg) rotateY(-5deg) scale(1.1)' : 
                      value ? 'perspective(1000px) rotateX(-2deg) rotateY(2deg)' : 
                      'perspective(1000px) rotateX(0deg) rotateY(0deg)',
          transformStyle: 'preserve-3d',
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        <img
          src={containerImage}
          alt={`Container with ${displayType || 'empty'}`}
          className={cn(
            "w-full h-full object-contain transition-opacity duration-300",
            isDragging && !value && !isDragOver && "opacity-50"
          )}
        />
        {!displayType && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-muted-foreground/60 text-xs bg-background/80 px-2 py-1 rounded">
              Drop here
            </span>
          </div>
        )}
      </div>
      
      {/* Variable label */}
      <div className="text-center">
        <button
          onClick={() => onNameClick(name)}
          className={cn(
            "font-mono font-bold text-sm hover:text-secondary transition-colors cursor-pointer",
            value || isDragOver ? "text-secondary" : "text-muted-foreground"
          )}
        >
          {displayName}
        </button>
        {(value || (isDragOver && dragState)) && (
          <span className="block text-xs text-muted-foreground mt-1">
            = {value ? (value.type === "number" ? "1" : value.type) : (dragState?.type === "number" ? "1" : dragState?.type)}
          </span>
        )}
      </div>
    </div>
  );
};

interface DraggableObjectProps {
  type: ObjectType;
  count: number;
  onDragStart: (type: ObjectType, count: number) => void;
  disabled: boolean;
}

const DraggableObject = ({ type, count, onDragStart, disabled }: DraggableObjectProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({ type, count }));
    onDragStart(type, count);
  };

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      className={cn(
        "p-4 rounded-lg border-2 transition-all duration-200 cursor-grab active:cursor-grabbing",
        "hover:scale-110 hover:shadow-md flex flex-col items-center gap-2",
        "border-border hover:border-secondary/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex gap-1">
        {Array.from({ length: count }).map((_, i) => (
          <ObjectIcon key={i} type={type} size="md" />
        ))}
      </div>
      <span className="text-xs text-muted-foreground capitalize">{type}</span>
    </div>
  );
};

interface ObjectPickerProps {
  onDragStart: (type: ObjectType, count: number) => void;
  disabled: boolean;
}

const ObjectPicker = ({ onDragStart, disabled }: ObjectPickerProps) => {
  const objectTypes: ObjectType[] = ["apple", "ball", "car", "number"];

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Drag Objects to Variables</h3>
      <p className="text-sm text-muted-foreground">
        Drag objects into the variable boxes below. As you drag, you'll see what the assignment will be!
      </p>
      
      <div>
        <p className="text-sm text-muted-foreground mb-3">Object Types:</p>
        <div className="grid grid-cols-4 gap-3">
          {objectTypes.map((type) => (
            <DraggableObject
              key={type}
              type={type}
              count={1}
              onDragStart={onDragStart}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const VariableDemo = () => {
  const [variables, setVariables] = useState<Record<string, VariableValue>>({
    x: null,
    y: null,
  });
  const [variableNames, setVariableNames] = useState<Record<string, string>>({
    x: "x",
    y: "y",
  });
  const [isRunning, setIsRunning] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [editingVariable, setEditingVariable] = useState<string | null>(null);
  const [newVariableName, setNewVariableName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const isRunningRef = useRef(isRunning);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    const handleDragEnd = () => {
      setDragState(null);
    };

    window.addEventListener('dragend', handleDragEnd);
    return () => window.removeEventListener('dragend', handleDragEnd);
  }, []);

  const assignVariable = (varName: string, value: VariableValue) => {
    setVariables(prev => ({
      ...prev,
      [varName]: value,
    }));
  };

  const handleDragStart = (type: ObjectType, count: number) => {
    if (isRunning) return;
    setDragState({ type, count, targetVariable: null });
  };

  const handleDragOver = (varName: string) => {
    if (dragState && !isRunning) {
      setDragState(prev => prev ? { ...prev, targetVariable: varName } : null);
    }
  };

  const handleDragLeave = () => {
    if (dragState) {
      setDragState(prev => prev ? { ...prev, targetVariable: null } : null);
    }
  };

  const handleDrop = (varName: string, type: ObjectType, count: number) => {
    if (isRunning) return;
    assignVariable(varName, { type, count });
    setDragState(null);
  };

  const animateStep = useCallback((step: number) => {
    if (!isRunningRef.current) return;

    if (step === 1) {
      // Line 1: x = value
      setCurrentLine(1);
      if (variables.x) {
        setTimeout(() => {
          if (!isRunningRef.current) return;
          animateStep(2);
        }, STEP_DURATION);
      } else {
        setIsRunning(false);
      }
    } else if (step === 2) {
      // Line 2: y = value
      setCurrentLine(2);
      setTimeout(() => {
        setIsRunning(false);
        setCurrentLine(1);
      }, STEP_DURATION);
    }
  }, [variables]);

  const handleRun = () => {
    if (isRunning || !variables.x || !variables.y) return;
    
    setIsRunning(true);
    setDragState(null);
    setCurrentLine(1);
    
    setTimeout(() => {
      animateStep(1);
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
    setVariables({ x: null, y: null });
    setCurrentLine(1);
    setDragState(null);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  };

  const handleNameClick = (varName: string) => {
    if (isRunning) return;
    setEditingVariable(varName);
    setNewVariableName(variableNames[varName] || varName);
    setNameError(null);
  };

  const handleNameChange = (value: string) => {
    setNewVariableName(value);
    const validation = isValidPythonVariableName(value);
    if (!validation.valid) {
      setNameError(validation.error || "Invalid variable name");
    } else {
      setNameError(null);
    }
  };

  const handleNameSave = () => {
    if (!editingVariable) return;
    
    const validation = isValidPythonVariableName(newVariableName);
    if (!validation.valid) {
      setNameError(validation.error || "Invalid variable name");
      return;
    }

    setVariableNames(prev => ({
      ...prev,
      [editingVariable]: newVariableName,
    }));
    setEditingVariable(null);
    setNewVariableName("");
    setNameError(null);
  };

  const handleNameCancel = () => {
    setEditingVariable(null);
    setNewVariableName("");
    setNameError(null);
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
                  <span className="sr-only">Learn about variables</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <span>📚</span> Understanding Variables
                  </DialogTitle>
                  <DialogDescription className="text-base pt-2">
                    Learn how variables work as containers that hold values
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">What is a Variable?</h3>
                    <p className="text-muted-foreground">
                      A <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">variable</code> is like a labeled box that can hold different things. You give it a name (like <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">x</code> or <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">y</code>) and put a value inside it.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">Assigning Values</h3>
                    <div className="bg-foreground/95 rounded-lg p-4 font-mono text-sm border border-border">
                      <div className="space-y-1">
                        <div><span className="text-muted-foreground/50">1</span> <span className="text-white">x = 3</span></div>
                        <div><span className="text-muted-foreground/50">2</span> <span className="text-white">y = 2</span></div>
                      </div>
                    </div>
                    <p className="text-white text-sm">
                      The <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">=</code> sign means "put this value into this variable". So <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">x = 3</code> means "put 3 into the box named x".
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">Using Variables</h3>
                    <p className="text-muted-foreground text-sm">
                      Once you put a value in a variable, you can use it in calculations. When you write <code className="font-mono text-secondary bg-muted px-1.5 py-0.5 rounded">x + y</code>, Python looks inside the boxes, gets the values (3 and 2), and adds them together to get 5.
                    </p>
                  </div>

                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <span>💡</span> Key Point
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Variables can change! You can put a new value into a variable anytime, and it will replace the old value. It's like emptying a box and putting something new inside.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            📦 Variables
          </h1>
          <p className="text-muted-foreground text-lg">
            Learn how variables work as containers for values!
          </p>
        </header>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left side - Interactive area */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <ObjectPicker
              onDragStart={handleDragStart}
              disabled={isRunning}
            />

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                Variable Boxes
              </h3>
              <div className="flex flex-wrap gap-6 justify-center">
                <VariableBox
                  name="x"
                  displayName={variableNames.x}
                  value={variables.x}
                  isActive={currentLine === 1}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onNameClick={handleNameClick}
                  dragState={dragState}
                />
                <VariableBox
                  name="y"
                  displayName={variableNames.y}
                  value={variables.y}
                  isActive={currentLine === 2}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onNameClick={handleNameClick}
                  dragState={dragState}
                />
              </div>

              {dragState && dragState.targetVariable && (
                <div className="mt-4 text-center animate-fade-in">
                  <p className="text-sm font-semibold text-secondary">
                    {dragState.targetVariable} = {dragState.type}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Drop to assign!
                  </p>
                </div>
              )}
              {!dragState && !isRunning && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Drag objects from above into the variable boxes
                </p>
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
            <VariableCodeDisplay
              currentLine={currentLine}
              isRunning={isRunning}
              variables={variables}
              variableNames={variableNames}
              dragState={dragState}
            />
          </div>
          
          {/* Variable Name Edit Dialog */}
          <Dialog open={editingVariable !== null} onOpenChange={(open) => !open && handleNameCancel()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Variable Name</DialogTitle>
                <DialogDescription>
                  Enter a valid Python variable name. It can only contain letters, numbers, and underscores, and cannot start with a number.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Input
                    value={newVariableName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter variable name"
                    className={cn(nameError && "border-destructive")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !nameError) {
                        handleNameSave();
                      }
                    }}
                    autoFocus
                  />
                  {nameError && (
                    <p className="text-sm text-destructive mt-2">{nameError}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleNameCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleNameSave} disabled={!!nameError || !newVariableName.trim()}>
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Instructions */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <span>📖</span> How it works
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent">1.</span>
              <span>Drag objects (🍎 apples, ⚽ balls, 🚗 cars, or ⭐ stars) from the picker above</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">2.</span>
              <span>Drag and drop them into the <strong>x</strong> or <strong>y</strong> variable boxes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">3.</span>
              <span>As you drag, watch the code update to show what will happen (e.g., <code className="font-mono text-no-color">x = apple</code>)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">4.</span>
              <span>Assign values to both <strong>x</strong> and <strong>y</strong> variables by dropping objects</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">5.</span>
              <span>Click <strong>Run</strong> to see the code execute step by step</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

