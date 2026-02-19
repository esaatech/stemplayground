import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Info, Droplet, Sun, Leaf, Ruler, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

type ToolbarItem = "pot" | "soil" | "water" | "sun" | "seed" | "measure";

type PlantStage = "empty" | "soil" | "seed" | "sprout" | "small" | "medium" | "large" | "flowering";

interface LabState {
  hasPot: boolean;
  soilLevel: number; // 0-100, fills the pot
  hasSeed: boolean;
  waterLevel: number; // 0-100
  sunlightOn: boolean;
  stage: PlantStage;
  daysPassed: number;
  height: number; // in cm
}

interface DragState {
  item: ToolbarItem;
  target: "lab" | null;
}

const PlantGrowthDemo = () => {
  const [labState, setLabState] = useState<LabState>({
    hasPot: false,
    soilLevel: 0,
    hasSeed: false,
    waterLevel: 0,
    sunlightOn: false,
    stage: "empty",
    daysPassed: 0,
    height: 0,
  });

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [growthHistory, setGrowthHistory] = useState<Array<{ day: number; height: number; stage: PlantStage }>>([]);

  // Update plant stage based on days passed (when seed is planted and has water/sunlight)
  useEffect(() => {
    if (labState.hasSeed && labState.waterLevel > 0 && labState.sunlightOn) {
      let newStage: PlantStage = "seed";
      let newHeight = 0;

      if (labState.daysPassed >= 1) {
        newStage = "sprout";
        newHeight = 2;
      }
      if (labState.daysPassed >= 3) {
        newStage = "small";
        newHeight = 5;
      }
      if (labState.daysPassed >= 7) {
        newStage = "medium";
        newHeight = 12;
      }
      if (labState.daysPassed >= 14) {
        newStage = "large";
        newHeight = 25;
      }
      if (labState.daysPassed >= 21) {
        newStage = "flowering";
        newHeight = 35;
      }

      if (newStage !== labState.stage || newHeight !== labState.height) {
        setLabState(prev => ({ ...prev, stage: newStage, height: newHeight }));
        
        // Add to growth history
        if (newStage !== labState.stage) {
          setGrowthHistory(prev => {
            const exists = prev.some(h => h.day === labState.daysPassed && h.stage === newStage);
            if (!exists) {
              return [...prev, { day: labState.daysPassed, height: newHeight, stage: newStage }];
            }
            return prev;
          });
        }
      }
    }
  }, [labState.daysPassed, labState.hasSeed, labState.waterLevel, labState.sunlightOn, labState.stage, labState.height]);

  // Update current step based on lab state
  useEffect(() => {
    if (!labState.hasPot) {
      setCurrentStep(1);
    } else if (labState.soilLevel < 100) {
      setCurrentStep(2);
    } else if (!labState.hasSeed) {
      setCurrentStep(3);
    } else if (labState.waterLevel === 0) {
      setCurrentStep(4);
    } else if (!labState.sunlightOn) {
      setCurrentStep(5);
    } else {
      setCurrentStep(6);
    }
  }, [labState]);

  useEffect(() => {
    const handleDragEnd = () => {
      console.log("🔴 window dragend event");
      setDragState(null);
    };
    
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🌍 Global dragOver event", { x: e.clientX, y: e.clientY, target: e.target });
    };
    
    const handleGlobalDragEnter = (e: DragEvent) => {
      e.preventDefault();
      console.log("🌍 Global dragEnter event", { x: e.clientX, y: e.clientY, target: e.target });
    };
    
    // Prevent default drag behavior on document to allow custom drops
    const handleDocumentDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    
    document.addEventListener('dragover', handleDocumentDragOver);
    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('dragover', handleGlobalDragOver);
    window.addEventListener('dragenter', handleGlobalDragEnter);
    
    return () => {
      document.removeEventListener('dragover', handleDocumentDragOver);
      window.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('dragover', handleGlobalDragOver);
      window.removeEventListener('dragenter', handleGlobalDragEnter);
    };
  }, []);

  // Debug: Log dragState changes
  useEffect(() => {
    console.log("📊 dragState changed:", dragState);
  }, [dragState]);

  const handleDragStart = (item: ToolbarItem) => {
    console.log("🟢 handleDragStart called", { item, timestamp: Date.now() });
    setDragState({ item, target: null });
    console.log("🟢 handleDragStart - dragState set", { item });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    console.log("🟡 handleDragOver", { 
      hasDragState: !!dragState, 
      dragState, 
      x: e.clientX, 
      y: e.clientY,
      target: e.target,
      currentTarget: e.currentTarget 
    });
    if (dragState) {
      console.log("🟡 drag over lab - updating state", {
        item: dragState.item,
        target: dragState.target,
        x: e.clientX,
        y: e.clientY,
      });
      setDragState(prev => prev ? { ...prev, target: "lab" } : null);
    } else {
      console.warn("⚠️ handleDragOver called but dragState is null!");
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    console.log("🟢 handleDragEnter", { 
      hasDragState: !!dragState, 
      dragState, 
      x: e.clientX, 
      y: e.clientY,
      target: e.target,
      currentTarget: e.currentTarget 
    });
    if (dragState) {
      console.log("🟢 drag enter lab - updating state", {
        item: dragState.item,
        target: dragState.target,
        x: e.clientX,
        y: e.clientY,
      });
      setDragState(prev => prev ? { ...prev, target: "lab" } : null);
    } else {
      console.warn("⚠️ handleDragEnter called but dragState is null!");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    console.log("🔴 handleDragLeave", { 
      x, 
      y, 
      rect, 
      hasDragState: !!dragState,
      dragState,
      isLeaving: x < rect.left || x > rect.right || y < rect.top || y > rect.bottom
    });
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (dragState) {
        console.log("🔴 drag leave lab - clearing target");
        setDragState(prev => prev ? { ...prev, target: null } : null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🟣 handleDrop", { 
      hasDragState: !!dragState, 
      dragState, 
      dataTransfer: e.dataTransfer.getData("text/plain"),
      x: e.clientX,
      y: e.clientY,
      target: e.target,
      currentTarget: e.currentTarget
    });
    
    if (!dragState) {
      console.error("❌ handleDrop called but dragState is null!");
      return;
    }

    const { item } = dragState;
    console.log("🟣 drop on lab - processing", { item, labState });

    switch (item) {
      case "pot":
        if (!labState.hasPot) {
          setLabState(prev => ({ ...prev, hasPot: true, stage: "empty" }));
        }
        break;
      case "soil":
        if (labState.hasPot && labState.soilLevel < 100) {
          setLabState(prev => ({ ...prev, soilLevel: Math.min(100, prev.soilLevel + 25) }));
          if (labState.soilLevel >= 75) {
            setLabState(prev => ({ ...prev, stage: "soil" }));
          }
        }
        break;
      case "seed":
        if (labState.hasPot && labState.soilLevel >= 100 && !labState.hasSeed) {
          setLabState(prev => ({ ...prev, hasSeed: true, stage: "seed" }));
        }
        break;
      case "water":
        if (labState.hasSeed) {
          setLabState(prev => ({
            ...prev,
            waterLevel: Math.min(100, prev.waterLevel + 30),
          }));
        }
        break;
      case "sun":
        // Sun is handled by the switch, but we can allow dragging to toggle it
        if (labState.hasSeed) {
          setLabState(prev => ({ ...prev, sunlightOn: true }));
        }
        break;
    }

    setDragState(null);
    console.log("🟣 handleDrop - completed, dragState cleared");
  };

  const reset = () => {
    setLabState({
      hasPot: false,
      soilLevel: 0,
      hasSeed: false,
      waterLevel: 0,
      sunlightOn: false,
      stage: "empty",
      daysPassed: 0,
      height: 0,
    });
    setGrowthHistory([]);
    setCurrentStep(1);
  };

  const getGuideText = () => {
    switch (currentStep) {
      case 1:
        return { step: "Step 1: Add pot to lab area", action: "👈 Drag pot into lab area" };
      case 2:
        return { step: "Step 2: Add soil to pot", action: "👈 Drag soil into pot until it's filled" };
      case 3:
        return { step: "Step 3: Plant a seed", action: "👈 Drag seed into pot" };
      case 4:
        return { step: "Step 4: Water the seed", action: "👈 Drag water into pot" };
      case 5:
        return { step: "Step 5: Turn on sunlight", action: "👈 Drag sun or toggle the sunlight switch" };
      case 6:
        return { step: "Step 6: Advance days to watch it grow!", action: "🌱 Use the day slider to advance time and watch your plant grow!" };
      default:
        return { step: "Get started!", action: "👈 Drag items from the toolbar" };
    }
  };

  const EmptyPotIcon = () => (
    <svg width="32" height="32" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="text-secondary">
      {/* Shadow */}
      <ellipse cx="100" cy="185" rx="50" ry="8" fill="#000" opacity="0.2"/>
      
      {/* Pot Bottom (drainage hole plate) */}
      <ellipse cx="100" cy="175" rx="25" ry="8" fill="#8B4513"/>
      
      {/* Main Pot Body */}
      <path d="M 60 80 L 70 175 L 130 175 L 140 80 Z" 
            fill="#C86428" 
            stroke="#8B4513" 
            strokeWidth="2"/>
      
      {/* Pot Rim/Top */}
      <ellipse cx="100" cy="80" rx="40" ry="10" fill="#D2691E"/>
      <ellipse cx="100" cy="80" rx="40" ry="8" fill="#E07B39"/>
      
      {/* Inner Rim Shadow */}
      <ellipse cx="100" cy="80" rx="35" ry="6" fill="#A0522D"/>
      
      {/* Pot Shine/Highlight */}
      <path d="M 75 90 Q 80 130 82 160" 
            fill="none" 
            stroke="#E8A76F" 
            strokeWidth="3" 
            opacity="0.6"
            strokeLinecap="round"/>
      
      {/* Decorative Bands */}
      <ellipse cx="100" cy="100" rx="38" ry="6" fill="#A0522D" opacity="0.4"/>
      <ellipse cx="100" cy="130" rx="35" ry="6" fill="#A0522D" opacity="0.4"/>
      <ellipse cx="100" cy="155" rx="30" ry="6" fill="#A0522D" opacity="0.4"/>
      
      {/* Drainage Hole */}
      <ellipse cx="100" cy="175" rx="8" ry="3" fill="#654321"/>
      <ellipse cx="100" cy="174" rx="6" ry="2" fill="#3D2817"/>
      
      {/* Texture Lines (vertical ridges) */}
      <line x1="85" y1="82" x2="75" y2="173" stroke="#A0522D" strokeWidth="1" opacity="0.3"/>
      <line x1="115" y1="82" x2="125" y2="173" stroke="#A0522D" strokeWidth="1" opacity="0.3"/>
      
      {/* Additional highlight */}
      <path d="M 120 95 Q 122 125 123 150" 
            fill="none" 
            stroke="#3D2817" 
            strokeWidth="2" 
            opacity="0.3"
            strokeLinecap="round"/>
    </svg>
  );

  const ToolbarItem = ({ item, label, icon: Icon, emoji, customIcon }: { item: ToolbarItem; label: string; icon?: React.ElementType; emoji?: string; customIcon?: React.ReactNode }) => {
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (itemRef.current) {
        const isDraggable = itemRef.current.draggable;
        const draggableAttr = itemRef.current.getAttribute('draggable');
        console.log(`📦 ToolbarItem "${label}" mounted`, { 
          item, 
          isDraggable, 
          draggableAttr,
          element: itemRef.current 
        });
      }
    }, [item, label]);

    const onDragStart = (e: React.DragEvent) => {
      console.log("🔵 ToolbarItem onDragStart", { item, label, event: e.type, target: e.target });
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", item);
      e.dataTransfer.dropEffect = "move";
      console.log("🔵 ToolbarItem onDragStart - calling handleDragStart", { item });
      handleDragStart(item);
      console.log("🔵 ToolbarItem onDragStart - after handleDragStart");
    };

    const onDragEnd = (e: React.DragEvent) => {
      console.log("🔴 ToolbarItem onDragEnd", { item, label, event: e.type });
      setDragState(null);
    };

    return (
      <div
        ref={itemRef}
        draggable={true}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing",
          "hover:scale-105 hover:shadow-md border-border hover:border-secondary/50",
          "select-none",
          dragState?.item === item && "opacity-50"
        )}
        style={{ userSelect: 'none' }}
      >
        {customIcon ? (
          customIcon
        ) : emoji ? (
          <span className="text-3xl">{emoji}</span>
        ) : Icon ? (
          <Icon className="h-8 w-8 text-secondary" />
        ) : null}
        <span className="text-sm font-medium">{label}</span>
      </div>
    );
  };

  const renderPot = () => {
    if (!labState.hasPot) {
      return null; // Empty - no placeholder text
    }

    // Calculate soil fill height (soil fills from bottom, up to soilLevel%)
    // Pot viewBox is 0 0 200 200, pot bottom is at y=175, pot top rim is at y=80
    // Soil should fill from y=175 (bottom) up to y=175 - (soilLevel% of 95 pixels)
    const potBottomY = 175;
    const potTopY = 80;
    const potHeight = potBottomY - potTopY; // 95 pixels
    const soilFillHeight = (labState.soilLevel / 100) * potHeight; // Height of soil in the pot
    const soilTopY = potBottomY - soilFillHeight; // Top of soil

    return (
      <div className="relative w-full h-full flex items-end justify-center pointer-events-none">
        {/* Pot SVG - bigger size, EMPTY POT ONLY - using provided pot design */}
        <svg 
          width="700" 
          height="700" 
          viewBox="0 0 200 200" 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none" 
          style={{ width: '700px', height: '700px', minWidth: '700px', minHeight: '700px', pointerEvents: 'none' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shadow */}
          <ellipse cx="100" cy="185" rx="50" ry="8" fill="#000" opacity="0.2"/>
          
          {/* Pot Bottom (drainage hole plate) */}
          <ellipse cx="100" cy="175" rx="25" ry="8" fill="#8B4513"/>
          
          {/* Main Pot Body */}
          <path d="M 60 80 L 70 175 L 130 175 L 140 80 Z" 
                fill="#C86428" 
                stroke="#8B4513" 
                strokeWidth="2"/>
          
          {/* Pot Rim/Top */}
          <ellipse cx="100" cy="80" rx="40" ry="10" fill="#D2691E"/>
          <ellipse cx="100" cy="80" rx="40" ry="8" fill="#E07B39"/>
          
          {/* Inner Rim Shadow */}
          <ellipse cx="100" cy="80" rx="35" ry="6" fill="#A0522D"/>
          
          {/* Pot Shine/Highlight */}
          <path d="M 75 90 Q 80 130 82 160" 
                fill="none" 
                stroke="#E8A76F" 
                strokeWidth="3" 
                opacity="0.6"
                strokeLinecap="round"/>
          
          {/* Decorative Bands */}
          <ellipse cx="100" cy="100" rx="38" ry="6" fill="#A0522D" opacity="0.4"/>
          <ellipse cx="100" cy="130" rx="35" ry="6" fill="#A0522D" opacity="0.4"/>
          <ellipse cx="100" cy="155" rx="30" ry="6" fill="#A0522D" opacity="0.4"/>
          
          {/* Drainage Hole */}
          <ellipse cx="100" cy="175" rx="8" ry="3" fill="#654321"/>
          <ellipse cx="100" cy="174" rx="6" ry="2" fill="#3D2817"/>
          
          {/* Texture Lines (vertical ridges) */}
          <line x1="85" y1="82" x2="75" y2="173" stroke="#A0522D" strokeWidth="1" opacity="0.3"/>
          <line x1="115" y1="82" x2="125" y2="173" stroke="#A0522D" strokeWidth="1" opacity="0.3"/>
          
          {/* Additional highlight */}
          <path d="M 120 95 Q 122 125 123 150" 
                fill="none" 
                stroke="#3D2817" 
                strokeWidth="2" 
                opacity="0.3"
                strokeLinecap="round"/>
          
          {/* Soil - fills from bottom based on soilLevel */}
          {labState.soilLevel > 0 && (
            <rect 
              x="70" 
              y={soilTopY} 
              width="60" 
              height={soilFillHeight} 
              fill="#8B6F47"
            >
              <animate
                attributeName="height"
                from="0"
                to={soilFillHeight}
                dur="0.5s"
                fill="freeze"
              />
              <animate
                attributeName="y"
                from={potBottomY}
                to={soilTopY}
                dur="0.5s"
                fill="freeze"
              />
            </rect>
          )}

          {/* Seed - only shows when planted and still in seed stage */}
          {labState.hasSeed && labState.stage === "seed" && labState.soilLevel >= 100 && (
            <circle cx="100" cy={soilTopY + 10} r="4" fill="#D2691E">
              <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Plant - only appears when it starts growing (after seed stage) */}
          {labState.stage !== "empty" && labState.stage !== "soil" && labState.stage !== "seed" && (
            <g transform={`translate(100, ${soilTopY})`}>
              {/* Stem - animated growth */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2={-getPlantHeight()}
                stroke="#228B22"
                strokeWidth={getStemWidth()}
                strokeLinecap="round"
              >
                <animate
                  attributeName="y2"
                  from="0"
                  to={-getPlantHeight()}
                  dur="1s"
                  fill="freeze"
                />
              </line>
              
              {/* Leaves/Flowers based on stage */}
              <g>
                {renderPlantTop()}
              </g>
            </g>
          )}
        </svg>

        {/* Water droplets animation */}
        {labState.waterLevel > 0 && (
          <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
            {[0, 1, 2].map((i) => (
              <Droplet
                key={i}
                className={cn(
                  "h-6 w-6 text-blue-400",
                  "animate-bounce"
                )}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}

        {/* Sun animation */}
        {labState.sunlightOn && (
          <div className="absolute top-4 right-4 animate-pulse pointer-events-none">
            <Sun className="h-12 w-12 text-yellow-400 fill-yellow-400" />
          </div>
        )}
      </div>
    );
  };

  const getPlantHeight = () => {
    switch (labState.stage) {
      case "sprout": return 30;
      case "small": return 60;
      case "medium": return 120;
      case "large": return 180;
      case "flowering": return 220;
      default: return 0;
    }
  };

  const getStemWidth = () => {
    switch (labState.stage) {
      case "sprout": return 3;
      case "small": return 4;
      case "medium": return 5;
      case "large": return 6;
      case "flowering": return 7;
      default: return 3;
    }
  };

  const renderPlantTop = () => {
    const height = -getPlantHeight();
    
    switch (labState.stage) {
      case "sprout":
        return <circle cx="0" cy={height} r="8" fill="#32CD32" />;
      case "small":
        return (
          <>
            <circle cx="-12" cy={height} r="10" fill="#32CD32" />
            <circle cx="12" cy={height} r="10" fill="#32CD32" />
          </>
        );
      case "medium":
        return (
          <>
            <circle cx="-18" cy={height - 8} r="12" fill="#228B22" />
            <circle cx="0" cy={height} r="12" fill="#228B22" />
            <circle cx="18" cy={height - 8} r="12" fill="#228B22" />
          </>
        );
      case "large":
        return (
          <>
            <circle cx="-24" cy={height - 12} r="14" fill="#006400" />
            <circle cx="-6" cy={height} r="14" fill="#006400" />
            <circle cx="6" cy={height} r="14" fill="#006400" />
            <circle cx="24" cy={height - 12} r="14" fill="#006400" />
          </>
        );
      case "flowering":
        return (
          <>
            <g transform="translate(-24, -12)">
              <circle cx="0" cy={height} r="14" fill="#006400" />
              <circle cx="0" cy={height} r="7" fill="#FFD700" />
            </g>
            <g transform="translate(0, 0)">
              <circle cx="0" cy={height} r="14" fill="#006400" />
              <circle cx="0" cy={height} r="7" fill="#FF69B4" />
            </g>
            <g transform="translate(24, -12)">
              <circle cx="0" cy={height} r="14" fill="#006400" />
              <circle cx="0" cy={height} r="7" fill="#FFD700" />
            </g>
            <g transform="translate(-12, 12)">
              <circle cx="0" cy={height} r="14" fill="#006400" />
              <circle cx="0" cy={height} r="7" fill="#FF69B4" />
            </g>
            <g transform="translate(12, 12)">
              <circle cx="0" cy={height} r="14" fill="#006400" />
              <circle cx="0" cy={height} r="7" fill="#FFD700" />
            </g>
          </>
        );
      default:
        return null;
    }
  };

  const guide = getGuideText();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/science" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <span>←</span> Back to Science
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/20">
                  <Leaf className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">How Plants Grow</h1>
                  <p className="text-slate-300 text-lg mt-2">
                    Plant a seed, care for it, and watch it grow!
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={reset} variant="ghost" className="text-slate-300 hover:text-white">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-slate-300 hover:text-white">
                    <Info className="h-5 w-5 mr-2" />
                    About
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>How Plants Grow</DialogTitle>
                    <DialogDescription>
                      This interactive lab lets you experience what it's like to grow a real plant!
                      <br /><br />
                      <strong>Actions you can take:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Drag a pot into the lab area</li>
                        <li>Add soil to the pot (drag multiple times to fill)</li>
                        <li>Plant a seed</li>
                        <li>Water your plant</li>
                        <li>Turn on sunlight</li>
                        <li>Advance days using the slider to watch it grow!</li>
                      </ul>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* TOOLBAR */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4 border-r border-border pr-4 mb-4">
              <span className="text-sm font-semibold text-muted-foreground">TOOLBAR</span>
            </div>
            <div className="flex items-center justify-around gap-4">
              <ToolbarItem item="pot" label="Pot" customIcon={<EmptyPotIcon />} />
              <div className="h-12 w-px bg-border" />
              <ToolbarItem item="soil" label="Soil" emoji="🟤" />
              <div className="h-12 w-px bg-border" />
              <ToolbarItem item="water" label="Water" icon={Droplet} />
              <div className="h-12 w-px bg-border" />
              <ToolbarItem item="sun" label="Sun" icon={Sun} />
              <div className="h-12 w-px bg-border" />
              <ToolbarItem item="seed" label="Seed" emoji="🌰" />
              <div className="h-12 w-px bg-border" />
              <ToolbarItem item="measure" label="Measure" icon={Ruler} />
            </div>
          </CardContent>
        </Card>

        {/* LAB AREA */}
        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-4">
              <span className="text-sm font-semibold text-muted-foreground">LAB AREA</span>
            </div>
            <div
              className={cn(
                "min-h-[700px] border-2 border-dashed rounded-xl p-8 transition-all relative flex items-center justify-center",
                dragState?.target === "lab"
                  ? "border-secondary bg-secondary/10 scale-[1.02]"
                  : "border-border bg-muted/30"
              )}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {renderPot()}
              {!labState.hasPot && (
                <p className="text-muted-foreground text-sm pointer-events-none">Drag a pot here to get started</p>
              )}
              {dragState?.target === "lab" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="bg-secondary/20 border-2 border-secondary rounded-lg p-4">
                    <p className="text-secondary font-semibold">Drop {dragState.item} here!</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls and Guide Panel */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">Controls</h3>
              
              {/* Sunlight Switch */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sunlight">Sunlight</Label>
                  <p className="text-sm text-muted-foreground">Turn on to help plant grow</p>
                </div>
                <Switch
                  id="sunlight"
                  checked={labState.sunlightOn}
                  onCheckedChange={(checked) => {
                    if (labState.hasSeed) {
                      setLabState(prev => ({ ...prev, sunlightOn: checked }));
                    }
                  }}
                  disabled={!labState.hasSeed}
                />
              </div>

              {/* Day Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Day: {labState.daysPassed}</Label>
                  <span className="text-sm text-muted-foreground">Drag to advance time</span>
                </div>
                <Slider
                  value={[labState.daysPassed]}
                  onValueChange={(value) => {
                    if (labState.hasSeed && labState.waterLevel > 0 && labState.sunlightOn) {
                      setLabState(prev => ({ ...prev, daysPassed: value[0] }));
                    }
                  }}
                  min={0}
                  max={30}
                  step={1}
                  disabled={!labState.hasSeed || labState.waterLevel === 0 || !labState.sunlightOn}
                />
              </div>

              {/* Status */}
              {labState.hasPot && (
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Soil Level:</span>
                    <span className="font-semibold">{labState.soilLevel}%</span>
                  </div>
                  {labState.hasSeed && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Water Level:</span>
                        <span className="font-semibold">{labState.waterLevel}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Height:</span>
                        <span className="font-semibold">{labState.height} cm</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Stage:</span>
                        <span className="font-semibold capitalize">{labState.stage}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* GUIDE PANEL */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <span className="text-sm font-semibold text-muted-foreground">GUIDE PANEL</span>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">{guide.step}</p>
                <p className="text-muted-foreground">{guide.action}</p>
              </div>

              {/* Growth History */}
              {growthHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Growth Over Time
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {growthHistory.slice(-5).reverse().map((entry, idx) => (
                      <div key={idx} className="flex justify-between text-xs bg-muted/50 p-2 rounded">
                        <span>Day {entry.day} - {entry.stage}</span>
                        <span className="font-semibold text-secondary">{entry.height} cm</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlantGrowthDemo;
