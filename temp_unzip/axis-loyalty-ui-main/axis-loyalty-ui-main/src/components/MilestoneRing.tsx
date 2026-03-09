import { useEffect, useState } from "react";

interface MilestoneRingProps {
  progress: number; // 0-100
  currentPoints: number;
  nextMilestone: number;
  tier: string;
}

export const MilestoneRing = ({ 
  progress, 
  currentPoints, 
  nextMilestone, 
  tier 
}: MilestoneRingProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className="flex flex-col items-center py-8">
      {/* Ring Container */}
      <div className="relative w-48 h-48">
        {/* Glow effect behind ring */}
        <div 
          className="absolute inset-0 rounded-full opacity-30 blur-xl"
          style={{
            background: `radial-gradient(circle, hsl(191 100% 50% / 0.4), transparent 70%)`
          }}
        />
        
        {/* SVG Ring */}
        <svg 
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(240 4% 16%)"
            strokeWidth="6"
          />
          
          {/* Progress ring with gradient */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(191 100% 42%)" />
              <stop offset="100%" stopColor="hsl(210 100% 55%)" />
            </linearGradient>
          </defs>
          
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: "drop-shadow(0 0 8px hsl(191 100% 50% / 0.6))"
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
            {tier}
          </span>
          <span className="text-3xl font-bold text-foreground">
            {currentPoints.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">
            points
          </span>
        </div>
      </div>

      {/* Milestone info */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-semibold">
            {(nextMilestone - currentPoints).toLocaleString()}
          </span>{" "}
          points to next milestone
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-xs font-medium uppercase tracking-wider text-secondary">
            Platinum Status
          </span>
        </div>
      </div>
    </div>
  );
};
