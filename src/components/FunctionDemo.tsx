import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Info, Play, RotateCcw, Square, MoreVertical, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { cn } from "@/lib/utils";

const CANVAS_SIZE = 320;
const GRID_SIZE = 40;
const ROBOT_SIZE = 30;
const MOVE_SPEED = 1.5; // pixels per frame (slower for better visibility)

type Direction = "up" | "down" | "left" | "right";
type Action = "forward" | "turnLeft";

// Define the path as waypoints with allowed directions at each point
interface PathPoint {
  x: number;
  y: number;
  allowedDirections: Direction[]; // Directions the robot can face/move from this point
}

const PATH: PathPoint[] = [
  { x: GRID_SIZE * 1, y: GRID_SIZE * 2, allowedDirections: ["right"] }, // Start - can only go right
  { x: GRID_SIZE * 5, y: GRID_SIZE * 2, allowedDirections: ["up"] }, // Junction 1 - must turn up
  { x: GRID_SIZE * 5, y: GRID_SIZE * 4, allowedDirections: ["right"] }, // Junction 2 - must turn right
  { x: GRID_SIZE * 7, y: GRID_SIZE * 4, allowedDirections: [] }, // End - no moves allowed
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

// Python function name validation (same as variable name validation)
const isValidPythonFunctionName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Function name cannot be empty" };
  }
  
  if (/^\d/.test(name)) {
    return { valid: false, error: "Function name cannot start with a number" };
  }
  
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    return { valid: false, error: "Function name can only contain letters, numbers, and underscores" };
  }
  
  const pythonKeywords = ['and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'];
  if (pythonKeywords.includes(name.toLowerCase())) {
    return { valid: false, error: "This is a Python keyword and cannot be used as a function name" };
  }
  
  return { valid: true };
};

type TutorialStep = 
  | "enterFirstName" 
  | "enterSecondName" 
  | "enterLastName" 
  | "showPrints" 
  | "clickPrints" 
  | "promptFunction" 
  | "enterDef" 
  | "enterFunctionName" 
  | "enterOpenParen" 
  | "enterCloseParen" 
  | "enterColon" 
  | "indented"
  | "complete";

const Example2Component = () => {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentStep, setCurrentStep] = useState<TutorialStep>("enterFirstName");
  const [functionCode, setFunctionCode] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<{ title: string; message: string } | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [printedNames, setPrintedNames] = useState<{ first: boolean; second: boolean; last: boolean }>({
    first: false,
    second: false,
    last: false,
  });
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [functionOutputLines, setFunctionOutputLines] = useState<string[]>([]);
  const [hasShownPrintIntro, setHasShownPrintIntro] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastInstruction, setLastInstruction] = useState<{ title: string; message: string }>({
    title: "Welcome!",
    message: "Let's learn to create functions step by step! In this interactive tutorial, you'll:\n\n1. Create variables to store your names\n2. Use print statements to display them\n3. Create a function that groups everything together\n\nFunctions are powerful because they let you run multiple instructions with just one command. This makes your code reusable and easier to manage.\n\nStart by entering your first name in the code editor below!"
  });

  // Show welcome dialog when component mounts
  useEffect(() => {
    const welcomeMessage = {
      title: "Welcome!",
      message: "Let's learn to create functions step by step! In this interactive tutorial, you'll:\n\n1. Create variables to store your names\n2. Use print statements to display them\n3. Create a function that groups everything together\n\nFunctions are powerful because they let you run multiple instructions with just one command. This makes your code reusable and easier to manage.\n\nStart by entering your first name in the code editor below!"
    };
    setDialogContent(welcomeMessage);
    setShowDialog(true);
  }, []);

  const handleReset = () => {
    setFirstName("");
    setSecondName("");
    setLastName("");
    setCurrentStep("enterFirstName");
    setFunctionCode("");
    setFunctionName("");
    setNameError(null);
    setPrintedNames({ first: false, second: false, last: false });
    setOutputLines([]);
    setFunctionOutputLines([]);
    setHasShownPrintIntro(false);
    setShowCelebration(false);
    const welcomeMessage = {
      title: "Welcome!",
      message: "Let's learn to create functions step by step! In this interactive tutorial, you'll:\n\n1. Create variables to store your names\n2. Use print statements to display them\n3. Create a function that groups everything together\n\nFunctions are powerful because they let you run multiple instructions with just one command. This makes your code reusable and easier to manage.\n\nStart by entering your first name in the code editor below!"
    };
    setLastInstruction(welcomeMessage);
    setDialogContent(welcomeMessage);
    setShowDialog(true);
  };

  const handleRunFunction = () => {
    if (functionName && firstName && secondName && lastName) {
      // Clear previous output
      setFunctionOutputLines([]);
      // Simulate function execution - print all three names
      setTimeout(() => {
        setFunctionOutputLines([firstName, secondName, lastName]);
        // Show celebration message
        setShowCelebration(true);
      }, 300);
    }
  };

  const handleFirstNameSubmit = (value: string) => {
    if (value.trim()) {
      setFirstName(value.trim());
      setCurrentStep("enterSecondName");
      // Show explanation dialog
      setTimeout(() => {
        setDialogContent({
          title: "What is a Variable?",
          message: `You just created a variable! Variables store information.\n\n\`name = "${value.trim()}"\` means the variable \`name\` now contains "${value.trim()}". Think of it like a labeled box where you store something!`
        });
        setShowDialog(true);
      }, 300);
    }
  };

  const handleSecondNameSubmit = (value: string) => {
    if (value.trim()) {
      setSecondName(value.trim());
      setCurrentStep("enterLastName");
      // Show explanation dialog
      const instruction = {
        title: "Another Variable!",
        message: `Great! You created another variable: \`second_name = "${value.trim()}"\`\n\nNow you have two variables storing different pieces of information. Each variable has its own name and value.`
      };
      setLastInstruction(instruction);
      setTimeout(() => {
        setDialogContent(instruction);
        setShowDialog(true);
      }, 300);
    }
  };

  const handleLastNameSubmit = (value: string) => {
    if (value.trim()) {
      setLastName(value.trim());
      setCurrentStep("showPrints");
      // Show explanation dialog and then show prints dialog
      const instruction = {
        title: "Three Variables Created!",
        message: `Perfect! You now have three variables:\n• \`name\` = "${firstName}"\n• \`second_name\` = "${secondName}"\n• \`last_name\` = "${value.trim()}"\n\nVariables help us store and organize data. Now let's see how to display what's inside them!`
      };
      setLastInstruction(instruction);
      setTimeout(() => {
        setDialogContent(instruction);
        setShowDialog(true);
      }, 300);
    }
  };

  const handlePrintClick = (type: "first" | "second" | "last") => {
    if (type === "first" && !printedNames.first) {
      setPrintedNames(prev => ({ ...prev, first: true }));
      setOutputLines(prev => [...prev, firstName]);
      // Show explanation after first print
      const instruction = {
        title: "Great! First Print",
        message: `Excellent! \`print(name)\` displayed "${firstName}" - the value stored in the \`name\` variable.\n\nThis is how we see what's inside variables. The output appears on the right side!`
      };
      setLastInstruction(instruction);
      setTimeout(() => {
        setDialogContent(instruction);
        setShowDialog(true);
      }, 300);
    } else if (type === "second" && !printedNames.second) {
      setPrintedNames(prev => ({ ...prev, second: true }));
      setOutputLines(prev => [...prev, secondName]);
      // Show explanation after second print
      const instruction = {
        title: "Second Print Complete!",
        message: `Perfect! \`print(second_name)\` displayed "${secondName}".\n\nEach \`print()\` statement shows the value of a different variable. You're learning how to display data!`
      };
      setLastInstruction(instruction);
      setTimeout(() => {
        setDialogContent(instruction);
        setShowDialog(true);
      }, 300);
    } else if (type === "last" && !printedNames.last) {
      setPrintedNames(prev => ({ ...prev, last: true }));
      setOutputLines(prev => [...prev, lastName]);
      // Show explanation after last print
      const instruction = {
        title: "All Names Printed!",
        message: `Wonderful! \`print(last_name)\` displayed "${lastName}".\n\nYou've successfully printed all three names, but you had to click three separate buttons. What if we could do this with just one command?`
      };
      setLastInstruction(instruction);
      setTimeout(() => {
        setDialogContent(instruction);
        setShowDialog(true);
      }, 300);
    }

    // Check if all prints are done
    const newState = {
      ...printedNames,
      [type]: true,
    };
    if (newState.first && newState.second && newState.last) {
      // Wait a bit longer to show the final dialog after the last print explanation
      setTimeout(() => {
        setCurrentStep("promptFunction");
        const instruction = {
          title: "Create a Function",
          message: "You printed each name separately by clicking three different buttons. What if we could print all three names with just one command?\n\nThat's what functions do! Functions group multiple instructions together so you can reuse them. Let's create a function to print all your names at once!"
        };
        setLastInstruction(instruction);
        setDialogContent(instruction);
        setShowDialog(true);
      }, 1500);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    if (currentStep === "promptFunction") {
      setCurrentStep("enterDef");
      const instruction = {
        title: "Step 1: Start with 'def'",
        message: "Type 'def' followed by a space. This keyword tells Python you're creating a function."
      };
      setLastInstruction(instruction);
      setTimeout(() => {
        setDialogContent(instruction);
        setShowDialog(true);
      }, 300);
    } else if (currentStep === "showPrints" && !hasShownPrintIntro) {
      // After closing the last name dialog, show the print statements explanation (only once)
      setHasShownPrintIntro(true);
      const instruction = {
        title: "Print Statements",
        message: "Now let's print each name one by one. Click on each `print()` statement to see the output.\n\n`print()` is a function that displays the value stored in a variable. It's like asking Python to show you what's inside the box!"
      };
      setLastInstruction(instruction);
      setTimeout(() => {
        setDialogContent(instruction);
        setShowDialog(true);
      }, 300);
    }
  };

  const handleCodeChange = (value: string) => {
    setFunctionCode(value);
    setNameError(null);
    
    if (currentStep === "enterDef") {
      // Only trigger Step 2 after user types space after "def"
      if (value.endsWith(" ") && value.trim() === "def") {
        setCurrentStep("enterFunctionName");
        setShowDialog(false);
        const instruction = {
          title: "Step 2: Give Your Function a Name",
          message: "Function names must:\n• Start with a letter or underscore\n• Contain only letters, numbers, and underscores\n• Not be a Python keyword\n\nAfter typing your function name, add an opening parenthesis '(' and a closing parenthesis ')'"
        };
        setLastInstruction(instruction);
        setTimeout(() => {
          setDialogContent(instruction);
          setShowDialog(true);
        }, 300);
      }
    } else if (currentStep === "enterFunctionName") {
      const match = value.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
      if (match) {
        const name = match[1];
        const validation = isValidPythonFunctionName(name);
        if (validation.valid) {
          setFunctionName(name);
          setCurrentStep("enterOpenParen");
          // Don't show dialog, user continues typing
        } else {
          setNameError(validation.error || "Invalid function name");
        }
      } else if (value.trim().length > 4 && !value.match(/^def\s+[a-zA-Z_]/)) {
        setNameError("Function name must start with a letter or underscore");
      }
    } else if (currentStep === "enterOpenParen") {
      // Continue to extract and update function name as user types
      const match = value.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
      if (match) {
        const name = match[1];
        const validation = isValidPythonFunctionName(name);
        if (validation.valid) {
          setFunctionName(name);
        }
      }
      
      // Check if opening parenthesis has been added
      if (value.includes("(")) {
        setCurrentStep("enterCloseParen");
        // Don't show dialog yet, wait for closing parenthesis
      }
    } else if (currentStep === "enterCloseParen") {
      // Step 3 dialog should only show after entering closing parenthesis
      if (value.includes(")") && value.includes("(")) {
        setCurrentStep("enterColon");
        setShowDialog(false);
        const instruction = {
          title: "Step 3: Add Colon",
          message: "Finally, add a colon ':' after the closing parenthesis to complete `():`, then press Enter"
        };
        setLastInstruction(instruction);
        setTimeout(() => {
          setDialogContent(instruction);
          setShowDialog(true);
        }, 300);
      }
    } else if (currentStep === "enterColon") {
      if (value.includes(":")) {
        // Don't change step yet, wait for Enter key
      }
    }
  };

  const handleEnterAfterColon = () => {
    if (currentStep === "enterColon" && functionCode.includes(":")) {
      // Add newline and indentation, then add print statements
      const indentedCode = functionCode + "\n    print(name)\n    print(second_name)\n    print(last_name)";
      setFunctionCode(indentedCode);
      setCurrentStep("indented");
      setShowDialog(false);
      const instruction = {
        title: "Indentation in Python",
        message: "In Python, code inside a function must be indented (moved to the right). This tells Python that these lines belong to the function. We use 4 spaces for indentation.\n\nNow press the button with your function name to run it!"
      };
      setLastInstruction(instruction);
      setTimeout(() => {
        setDialogContent(instruction);
        setShowDialog(true);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link 
          to="/programming/python" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <span>←</span> Back to Python
        </Link>

        <header className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            📝 Creating Functions: Full Name
          </h1>
          <p className="text-muted-foreground text-lg">
            Learn to create functions step by step!
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Left side - Code Editor */}
          <div className="space-y-6">
            {/* Code Editor for name assignments */}
            {(currentStep === "enterFirstName" || currentStep === "enterSecondName" || currentStep === "enterLastName") && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Code Editor</h3>
                  <button
                    onClick={() => {
                      setDialogContent(lastInstruction);
                      setShowDialog(true);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Show last instruction"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Enter your value, then press Enter</p>
                <div className="bg-foreground/95 rounded-lg p-4 font-mono text-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/50">1</span>
                    <span className="text-white">name = </span>
                    {currentStep === "enterFirstName" ? (
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleFirstNameSubmit(e.currentTarget.value)}
                        placeholder="Type your name"
                        className="flex-1 bg-transparent border-b border-muted-foreground/30 rounded-none px-2 py-1 h-auto text-white font-mono placeholder:text-muted-foreground/50"
                        autoFocus
                      />
                    ) : (
                      <span className="text-green-400">"{firstName}"</span>
                    )}
                  </div>
                  {currentStep !== "enterFirstName" && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground/50">2</span>
                      <span className="text-white">second_name = </span>
                      {currentStep === "enterSecondName" ? (
                        <Input
                          value={secondName}
                          onChange={(e) => setSecondName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSecondNameSubmit(e.currentTarget.value)}
                          placeholder="Type your second name"
                          className="flex-1 bg-transparent border-b border-muted-foreground/30 rounded-none px-2 py-1 h-auto text-white font-mono placeholder:text-muted-foreground/50"
                          autoFocus
                        />
                      ) : (
                        <span className="text-green-400">"{secondName}"</span>
                      )}
                    </div>
                  )}
                  {currentStep === "enterLastName" && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground/50">3</span>
                      <span className="text-white">last_name = </span>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLastNameSubmit(e.currentTarget.value)}
                        placeholder="Type your last name"
                        className="flex-1 bg-transparent border-b border-muted-foreground/30 rounded-none px-2 py-1 h-auto text-white font-mono placeholder:text-muted-foreground/50"
                        autoFocus
                      />
                    </div>
                  )}
                  {currentStep !== "enterFirstName" && currentStep !== "enterSecondName" && currentStep !== "enterLastName" && lastName && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground/50">3</span>
                      <span className="text-white">last_name = </span>
                      <span className="text-green-400">"{lastName}"</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Print Statements - Interactive */}
            {(currentStep === "showPrints" || currentStep === "clickPrints" || currentStep === "promptFunction") && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Print Statements</h3>
                <div className="bg-foreground/95 rounded-lg p-4 font-mono text-sm space-y-3">
                  <div className="text-muted-foreground mb-2">Code:</div>
                  <div 
                    className={cn(
                      "flex items-center gap-2 cursor-pointer hover:bg-secondary/20 p-2 rounded transition-colors",
                      printedNames.first && "opacity-60"
                    )}
                    onClick={() => !printedNames.first && handlePrintClick("first")}
                  >
                    <span className="text-muted-foreground/50">4</span>
                    <span className="text-white">print(name)</span>
                    {!printedNames.first && <span className="text-xs text-muted-foreground ml-auto">Click to print</span>}
                  </div>
                  <div 
                    className={cn(
                      "flex items-center gap-2 cursor-pointer hover:bg-secondary/20 p-2 rounded transition-colors",
                      printedNames.second && "opacity-60"
                    )}
                    onClick={() => !printedNames.second && handlePrintClick("second")}
                  >
                    <span className="text-muted-foreground/50">5</span>
                    <span className="text-white">print(second_name)</span>
                    {!printedNames.second && <span className="text-xs text-muted-foreground ml-auto">Click to print</span>}
                  </div>
                  <div 
                    className={cn(
                      "flex items-center gap-2 cursor-pointer hover:bg-secondary/20 p-2 rounded transition-colors",
                      printedNames.last && "opacity-60"
                    )}
                    onClick={() => !printedNames.last && handlePrintClick("last")}
                  >
                    <span className="text-muted-foreground/50">6</span>
                    <span className="text-white">print(last_name)</span>
                    {!printedNames.last && <span className="text-xs text-muted-foreground ml-auto">Click to print</span>}
                  </div>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full mt-4"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            )}

            {/* Function Editor */}
            {(currentStep === "enterDef" || currentStep === "enterFunctionName" || 
              currentStep === "enterOpenParen" || currentStep === "enterCloseParen" || 
              currentStep === "enterColon" || currentStep === "indented" || currentStep === "complete") && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Code Editor</h3>
                  <button
                    onClick={() => {
                      setDialogContent(lastInstruction);
                      setShowDialog(true);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Show last instruction"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
                </div>
                <div className="bg-foreground/95 rounded-lg p-4 font-mono text-sm">
                  <textarea
                    value={functionCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (currentStep === "enterColon" && e.key === "Enter" && functionCode.includes(":")) {
                        e.preventDefault();
                        handleEnterAfterColon();
                      }
                    }}
                    placeholder="Type your function here..."
                    className="w-full bg-transparent text-white resize-none outline-none min-h-[200px] placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                  {nameError && (
                    <div className="text-destructive text-xs mt-2">{nameError}</div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  {(currentStep === "indented" || currentStep === "complete") && functionName && (
                    <Button
                      onClick={handleRunFunction}
                      className="flex-1"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {functionName}()
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Output */}
          <div className="space-y-6">
            {/* Output Display for Print Statements */}
            {(currentStep === "showPrints" || currentStep === "clickPrints" || currentStep === "promptFunction") && outputLines.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Output</h3>
                <div className="bg-foreground/95 rounded-lg p-4 font-mono text-sm space-y-2">
                  {outputLines.map((line, idx) => (
                    <div key={idx} className="text-green-400">{line}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Output Display for Function Execution */}
            {(currentStep === "indented" || currentStep === "complete") && functionOutputLines.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Output</h3>
                <div className="bg-foreground/95 rounded-lg p-4 font-mono text-sm space-y-2">
                  {functionOutputLines.map((line, idx) => (
                    <div key={idx} className="text-green-400">{line}</div>
                  ))}
                </div>
                {showCelebration && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg text-center">
                    <div className="text-4xl mb-2">🎉</div>
                    <h4 className="text-lg font-bold text-foreground mb-1">Hurray! You've Created Your First Function!</h4>
                    <p className="text-sm text-muted-foreground">
                      You've successfully created a function that groups multiple instructions together. This is a powerful programming concept!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instruction Dialog */}
        {dialogContent && (
          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
                <AlertDialogDescription className="whitespace-pre-line text-lg">
                  {dialogContent.message}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={handleDialogClose}>OK</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
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
  const [walkCycle, setWalkCycle] = useState(0); // Animation cycle for walking (0 to 2π)
  const [showFunctionDefinition, setShowFunctionDefinition] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [currentExample, setCurrentExample] = useState<"example1" | "example2">("example1");
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [lastInstruction, setLastInstruction] = useState<{ title: string; message: string } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasShownFirstMove, setHasShownFirstMove] = useState(false);
  const [hasShownFirstTurn, setHasShownFirstTurn] = useState(false);
  const [showInstructionDialog, setShowInstructionDialog] = useState(false);
  const [instructionContent, setInstructionContent] = useState<{ title: string; message: string } | null>(null);

  // Show welcome dialog when component mounts (only for example1)
  useEffect(() => {
    if (currentExample === "example1") {
      const welcomeMessage = {
        title: "Welcome!",
        message: "Let's learn how functions work! In this interactive tutorial, you'll:\n\n1. Move the robot step by step using control buttons\n2. Watch the code build as you take each action\n3. Use a function to repeat all moves with one click\n\nFunctions are powerful because they let you run multiple instructions together. Start by clicking 'Move Forward' to begin!"
      };
      setLastInstruction(welcomeMessage);
      setInstructionContent(welcomeMessage);
      setShowInstructionDialog(true);
    }
  }, [currentExample]);

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

  const drawRobot = (ctx: CanvasRenderingContext2D, robotState: RobotState, isWalking: boolean) => {
    const { x, y, direction } = robotState;
    
    ctx.save();
    // Position robot exactly on the path line - path coordinates are at grid cell centers
    // The robot's center should align with the path coordinate
    ctx.translate(x, y);
    
    // Calculate rotation based on direction - robot faces the direction it's moving
    let rotation = 0;
    switch (direction) {
      case "right": rotation = 0; break; // Facing right
      case "down": rotation = Math.PI / 2; break; // Facing down
      case "left": rotation = Math.PI; break; // Facing left
      case "up": rotation = -Math.PI / 2; break; // Facing up
    }
    ctx.rotate(rotation);
    
    // Body bob when walking (slower, more visible) - only vertical, not affecting horizontal alignment
    const bodyBob = isWalking ? Math.sin(walkCycle * 2) * 1 : 0;
    ctx.translate(0, bodyBob);
    
    // Draw robot body (rounded rectangle) - centered on path
    ctx.fillStyle = "#f59e0b";
    const bodyWidth = ROBOT_SIZE * 0.5;
    const bodyHeight = ROBOT_SIZE * 0.5;
    const bodyX = -bodyWidth / 2;
    const bodyY = -bodyHeight / 2;
    const radius = 4;
    
    ctx.beginPath();
    ctx.moveTo(bodyX + radius, bodyY);
    ctx.lineTo(bodyX + bodyWidth - radius, bodyY);
    ctx.quadraticCurveTo(bodyX + bodyWidth, bodyY, bodyX + bodyWidth, bodyY + radius);
    ctx.lineTo(bodyX + bodyWidth, bodyY + bodyHeight - radius);
    ctx.quadraticCurveTo(bodyX + bodyWidth, bodyY + bodyHeight, bodyX + bodyWidth - radius, bodyY + bodyHeight);
    ctx.lineTo(bodyX + radius, bodyY + bodyHeight);
    ctx.quadraticCurveTo(bodyX, bodyY + bodyHeight, bodyX, bodyY + bodyHeight - radius);
    ctx.lineTo(bodyX, bodyY + radius);
    ctx.quadraticCurveTo(bodyX, bodyY, bodyX + radius, bodyY);
    ctx.closePath();
    ctx.fill();
    
    // Draw robot face (eyes) - positioned at the front of the robot
    ctx.fillStyle = "#1f2937";
    const eyeY = -bodyHeight / 4;
    ctx.beginPath();
    ctx.arc(-bodyWidth / 6, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bodyWidth / 6, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw legs (animated when walking) - positioned at bottom of body
    // Legs extend downward from body center, so robot center stays on path
    const legLength = ROBOT_SIZE / 4;
    const legWidth = 4;
    const legSpread = bodyWidth / 2.5;
    const legY = bodyHeight / 2;
    
    if (isWalking) {
      // Animate legs swinging - slower, more pronounced movement
      const leftLegAngle = Math.sin(walkCycle * 2) * 0.6; // -0.6 to 0.6 radians (more pronounced)
      const rightLegAngle = -Math.sin(walkCycle * 2) * 0.6; // Opposite phase
      
      // Left leg
      ctx.save();
      ctx.translate(-legSpread / 2, legY);
      ctx.rotate(leftLegAngle);
      ctx.fillStyle = "#d97706";
      ctx.fillRect(-legWidth / 2, 0, legWidth, legLength);
      ctx.restore();
      
      // Right leg
      ctx.save();
      ctx.translate(legSpread / 2, legY);
      ctx.rotate(rightLegAngle);
      ctx.fillStyle = "#d97706";
      ctx.fillRect(-legWidth / 2, 0, legWidth, legLength);
      ctx.restore();
    } else {
      // Static legs when not walking
      ctx.fillStyle = "#d97706";
      ctx.fillRect(-legSpread / 2 - legWidth / 2, legY, legWidth, legLength);
      ctx.fillRect(legSpread / 2 - legWidth / 2, legY, legWidth, legLength);
    }
    
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
    
    // Update walking animation cycle when moving (slower for visibility)
    if (isAnimating) {
      setWalkCycle(prev => (prev + 0.15) % (Math.PI * 2));
    }
    
    // Draw robot (pass isAnimating to show walking animation)
    drawRobot(ctx, robot, isAnimating);
    
    // Smooth movement animation
    if (isAnimating) {
      const dx = targetRobot.x - robot.x;
      const dy = targetRobot.y - robot.y;
      
      if (Math.abs(dx) < MOVE_SPEED && Math.abs(dy) < MOVE_SPEED) {
        // Reached target
        setRobot(targetRobot);
        setIsAnimating(false);
        setWalkCycle(0); // Reset walk cycle when stopped
      } else {
        // Move towards target - keep the direction from targetRobot (set when turning or moving)
        setRobot(prev => {
          const newX = prev.x + Math.sign(dx) * Math.min(MOVE_SPEED, Math.abs(dx));
          const newY = prev.y + Math.sign(dy) * Math.min(MOVE_SPEED, Math.abs(dy));
          
          return {
            ...prev,
            x: newX,
            y: newY,
            direction: targetRobot.direction, // Use the direction from targetRobot (set when action was initiated)
          };
        });
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
    
    // Show dialog after first move
    if (!hasShownFirstMove) {
      setHasShownFirstMove(true);
      const instruction = {
        title: "Great! First Move",
        message: "Excellent! You moved the robot forward. Notice how `move_forward()` appeared in the code?\n\nEach action you take is being recorded. The code on the right shows all the moves you've made so far!"
      };
      setLastInstruction(instruction);
      setTimeout(() => {
        setInstructionContent(instruction);
        setShowInstructionDialog(true);
      }, 500);
    }
    
    // Check if we reached the end
    if (newPathIndex >= PATH.length - 1) {
      setTimeout(() => {
        setHasReachedEnd(true);
        const instruction = {
          title: "You Reached the End!",
          message: `Excellent! You've reached the red dot. You took ${actions.length + 1} steps to get there.\n\nNow click the button "${functionName}()" to perform all the steps at once! This is how functions work - they group multiple instructions together so you can reuse them.`
        };
        setLastInstruction(instruction);
        setTimeout(() => {
          setInstructionContent(instruction);
          setShowInstructionDialog(true);
        }, 500);
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
    
    // Turn to face the required direction immediately
    setRobot(prev => ({ ...prev, direction: requiredDirection }));
    setTargetRobot(prev => ({ ...prev, direction: requiredDirection }));
    setIsAnimating(true);
    setActions(prev => [...prev, "turnLeft"]);
    
    // Show dialog after first turn
    if (!hasShownFirstTurn) {
      setHasShownFirstTurn(true);
      const instruction = {
        title: "Perfect! First Turn",
        message: "Great! You turned the robot. See how `turn_left()` was added to the code?\n\nThe code is building as you move the robot. Each button click adds a new instruction to your sequence!"
      };
      setLastInstruction(instruction);
      setTimeout(() => {
        setInstructionContent(instruction);
        setShowInstructionDialog(true);
      }, 300);
    }
    
    // For turns, animation completes immediately
    setTimeout(() => {
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
    
    // Show celebration after function execution
    setTimeout(() => {
      setShowCelebration(true);
    }, 500);
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
    setHasShownFirstMove(false);
    setHasShownFirstTurn(false);
    setShowCelebration(false);
    setLastInstruction(null);
    setInstructionContent(null);
  };

  // Show Example 2 if selected
  if (currentExample === "example2") {
    return <Example2Component />;
  }

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
          <div className="absolute top-0 right-0 md:right-4 flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Examples menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCurrentExample("example1")}>
                  Example 1: Robot Path
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentExample("example2")}>
                  Example 2: Full Name Function
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                    Functions help us run multiple instructions together
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
            Functions help us run multiple instructions together
          </p>
        </header>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Left side - Canvas and controls */}
          <div className="flex flex-col animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="bg-card border border-border rounded-xl p-3 flex-shrink-0">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-base font-semibold text-foreground">
                  Robot Path
                </h3>
                <button
                  onClick={() => {
                    if (lastInstruction) {
                      setInstructionContent(lastInstruction);
                      setShowInstructionDialog(true);
                    } else {
                      setShowHelpDialog(true);
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Show last instruction"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  className="border border-border rounded-lg bg-background"
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-3 flex-1 flex flex-col">
              <h3 className="text-base font-semibold text-foreground text-center">
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
                  <>
                    <Button
                      onClick={runFunction}
                      disabled={isRunning || actions.length === 0 || isAnimating}
                      className="w-full h-12 mb-2"
                      size="lg"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {functionName}()
                    </Button>
                    {showCelebration && (
                      <div className="mb-2 p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg text-center">
                        <div className="text-2xl mb-1">🎉</div>
                        <h4 className="text-sm font-bold text-foreground mb-1">Amazing! Function Executed!</h4>
                        <p className="text-xs text-muted-foreground">
                          The function `{functionName}()` executed all {actions.length} moves automatically. Functions let you reuse code!
                        </p>
                      </div>
                    )}
                  </>
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

        {/* Instruction Dialog for Example 1 */}
        {instructionContent && (
          <AlertDialog open={showInstructionDialog} onOpenChange={setShowInstructionDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{instructionContent.title}</AlertDialogTitle>
                <AlertDialogDescription className="whitespace-pre-line text-lg">
                  {instructionContent.message}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowInstructionDialog(false)}>OK</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Help Dialog */}
        <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <span>📖</span> How it works
              </DialogTitle>
              <DialogDescription className="text-lg">
                <ul className="space-y-2 text-muted-foreground mt-4">
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
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

