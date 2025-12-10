import { Train } from "./Train";
import { ThoughtBubble } from "./ThoughtBubble";

interface TrackProps {
  rotation: number;
  isChecking: boolean;
  checkResult: boolean | null;
  showNoFuelMessage: boolean;
}

export const Track = ({ rotation, isChecking, checkResult, showNoFuelMessage }: TrackProps) => {
  const trackRadius = 120;

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Thought bubbles - positioned above the track */}
      <div className="absolute -top-28 left-1/2 -translate-x-1/2 z-20">
        <ThoughtBubble 
          isVisible={isChecking || showNoFuelMessage} 
          checkResult={checkResult}
          showNoFuelMessage={showNoFuelMessage}
        />
      </div>
      
      {/* Track container */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Grass background */}
        <div className="absolute inset-0 rounded-full bg-grass" />
        
        {/* Outer track */}
        <div className="absolute inset-4 rounded-full border-[20px] border-track shadow-inner" />
        
        {/* Inner grass */}
        <div className="absolute inset-12 rounded-full bg-grass" />
        
        {/* Track ties (sleepers) */}
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-6 bg-wood rounded"
            style={{
              left: "50%",
              top: "50%",
              transformOrigin: "center center",
              transform: `rotate(${i * 22.5}deg) translateY(-${trackRadius}px) translateX(-2px)`,
            }}
          />
        ))}
        
        {/* Center decoration */}
        <div className="absolute inset-20 rounded-full bg-accent/20 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-accent/40" />
        </div>
        
        {/* Starting point marker */}
        <div 
          className="absolute w-4 h-4 bg-secondary rounded-full border-2 border-secondary-foreground shadow-lg z-10"
          style={{
            left: "50%",
            top: "24px",
            transform: "translateX(-50%)",
          }}
        />
        
        {/* Train wrapper */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: `calc(50% - ${trackRadius}px - 17px)`,
              left: '50%',
              transform: 'translateX(-50%) rotate(90deg)',
            }}
          >
            <Train isRunning={!isChecking && !showNoFuelMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};
