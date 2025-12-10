import { Train } from "./Train";

interface TrackProps {
  isRunning: boolean;
}

export const Track = ({ isRunning }: TrackProps) => {
  return (
    <div className="relative w-80 h-80 mx-auto">
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
            transform: `rotate(${i * 22.5}deg) translateY(-120px) translateX(-2px)`,
          }}
        />
      ))}
      
      {/* Center decoration */}
      <div className="absolute inset-20 rounded-full bg-accent/20 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-accent/40" />
      </div>
      
      {/* Train container - positioned on track */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 0, height: 0 }}
      >
        <div className={isRunning ? "train-running" : ""}>
          <div style={{ transform: "translateX(120px)" }}>
            <Train isRunning={isRunning} />
          </div>
        </div>
      </div>
    </div>
  );
};
