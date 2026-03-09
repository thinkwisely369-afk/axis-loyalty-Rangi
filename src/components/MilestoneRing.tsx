import { useRef, useEffect } from "react";

const TIERS = [
  { name: "Silver Member", threshold: 6000, colors: { arc: ["hsl(0,0%,55%)", "hsl(0,0%,78%)", "hsl(0,0%,72%)"], glow: "hsl(0,0%,72%)", text: "text-[hsl(0,0%,75%)]" } },
  { name: "Gold Member", threshold: 12000, colors: { arc: ["hsl(43,96%,40%)", "hsl(43,96%,60%)", "hsl(36,100%,55%)"], glow: "hsl(43,96%,50%)", text: "text-[hsl(43,96%,56%)]" } },
  { name: "Platinum Member", threshold: 18000, colors: { arc: ["hsl(191,100%,35%)", "hsl(191,100%,50%)", "hsl(210,100%,60%)"], glow: "hsl(191,100%,50%)", text: "text-primary" } },
  { name: "Signature Member", threshold: 24000, colors: { arc: ["hsl(175,85%,38%)", "hsl(175,85%,50%)", "hsl(190,90%,60%)"], glow: "hsl(175,85%,50%)", text: "text-[hsl(175,85%,50%)]" } },
];

function getTier(points: number) {
  for (let i = TIERS.length - 1; i >= 0; i--)
    if (points >= TIERS[i].threshold) return TIERS[i];
  return TIERS[0];
}

function getNextTier(tier: typeof TIERS[0]) {
  const i = TIERS.indexOf(tier);
  return i < TIERS.length - 1 ? TIERS[i + 1] : null;
}

function formatMaturityNumber(value: string | null): string | null {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  const num = parseFloat(lower);
  if (isNaN(num)) return null;
  const amount = lower.includes("million") ? Math.round(num * 1_000_000) : Math.round(num);
  return amount.toLocaleString();
}

function parseDurationToMonths(duration: string | null): number | null {
  if (!duration) return null;
  const lower = duration.toLowerCase().trim();
  const num = parseFloat(lower);
  if (isNaN(num)) return null;
  if (lower.includes("year")) return Math.round(num * 12);
  if (lower.includes("month")) return Math.round(num);
  return Math.round(num); // assume months if no unit
}

function calcMonthsRemaining(startedDate: string | null, totalMonths: number | null): number | null {
  if (!startedDate || !totalMonths) return null;
  const start = new Date(startedDate);
  const now = new Date();
  const elapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.max(0, totalMonths - elapsed);
}

interface MilestoneRingProps {
  currentPoints: number;
  role?: string;
  policyDuration?: string | null;
  startedDate?: string | null;
  maturityValue?: string | null;
}

export const MilestoneRing = ({ currentPoints, policyDuration, startedDate, maturityValue }: MilestoneRingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const totalMonths = parseDurationToMonths(policyDuration ?? null);
  const remainingMonths = calcMonthsRemaining(startedDate ?? null, totalMonths);
  const hasPolicyData = remainingMonths !== null && totalMonths !== null;

  const tier = getTier(currentPoints);
  const next = getNextTier(tier);

  // Gauge shows policy elapsed % when policy data available, otherwise loyalty points %
  const percentage = hasPolicyData
    ? Math.min((totalMonths! - remainingMonths!) / totalMonths!, 1)
    : Math.min(currentPoints / 24000, 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 220;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 88;
    const lineWidth = 8;
    const startAngle = 0.75 * Math.PI;
    const endAngle = 2.25 * Math.PI;
    const sweep = endAngle - startAngle;

    // Background track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = "hsl(230,12%,11%)";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    if (percentage > 0) {
      const arcEnd = startAngle + sweep * percentage;

      // Wide glow halo
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, arcEnd);
      ctx.strokeStyle = tier.colors.glow;
      ctx.lineWidth = lineWidth + 10;
      ctx.lineCap = "round";
      ctx.globalAlpha = 0.12;
      ctx.shadowColor = tier.colors.glow;
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Main progress arc
      const gradient = ctx.createLinearGradient(0, size, size, 0);
      gradient.addColorStop(0, tier.colors.arc[0]);
      gradient.addColorStop(0.5, tier.colors.arc[1]);
      gradient.addColorStop(1, tier.colors.arc[2]);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, arcEnd);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.shadowColor = tier.colors.glow;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Tick marks (inside the arc)
    const numTicks = 40;
    for (let i = 0; i <= numTicks; i++) {
      const angle = startAngle + (sweep * i) / numTicks;
      const isMajor = i % 10 === 0;
      const outerR = radius - 10;
      const innerR = radius - (isMajor ? 20 : 15);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.strokeStyle = i / numTicks <= percentage ? tier.colors.arc[1] : "hsl(225,10%,22%)";
      ctx.lineWidth = isMajor ? 2 : 0.9;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Start / end value labels on the arc endpoints (policy mode only)
    if (hasPolicyData) {
      const labelR = radius + 18;
      ctx.font = "bold 8px sans-serif";

      // "Month 0" at start point
      const sx = cx + Math.cos(startAngle) * labelR;
      const sy = cy + Math.sin(startAngle) * labelR;
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillText("Month 0", sx, sy + 3);

      // Total months at end point
      const ex = cx + Math.cos(endAngle) * labelR;
      const ey = cy + Math.sin(endAngle) * labelR;
      ctx.textAlign = "right";
      ctx.fillStyle = tier.colors.arc[1];
      ctx.fillText(`${totalMonths} Months`, ex, ey + 3);
    }
  }, [currentPoints, percentage, tier, hasPolicyData, maturityValue, totalMonths]);

  return (
    <div className="flex flex-col items-center py-4">
      {/* Brand + tier label */}
      <div className={`text-[9px] font-bold tracking-[0.3em] uppercase opacity-55 mb-0.5 flex gap-1 items-center ${tier.colors.text}`}>
        <span>✦</span><span>HNBA LOYALTY</span>
      </div>
      <div className={`text-[11px] font-black tracking-[0.25em] uppercase mb-1 ${tier.colors.text}`}>
        {tier.name}
      </div>

      {/* Canvas gauge */}
      <div className="relative w-[220px] h-[220px]">
        <canvas ref={canvasRef} className="block" />

        <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
          {hasPolicyData ? (
            <>
              <span
                className="text-4xl font-black tracking-tight leading-none"
                style={{ color: tier.colors.arc[1], textShadow: `0 0 20px ${tier.colors.glow}` }}
              >
                {remainingMonths!.toLocaleString()}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/25 mt-1.5 text-center leading-tight">
                MONTHS<br />TO PAY
              </span>
              {maturityValue && (() => {
                const formatted = formatMaturityNumber(maturityValue);
                return formatted ? (
                  <div className="flex flex-col items-center mt-3 gap-0.5">
                    <span className="text-[8px] text-white/35 font-medium">to get</span>
                    <span
                      className="text-[9px] font-black tracking-wide whitespace-nowrap px-1.5 py-0.5 rounded-full"
                      style={{
                        color: "hsl(38,95%,60%)",
                        background: "hsla(38,95%,50%,0.12)",
                        border: "1px solid hsla(38,95%,60%,0.3)",
                        textShadow: "0 0 10px hsla(38,95%,60%,0.8)",
                      }}
                    >
                      LKR {formatted}
                    </span>
                  </div>
                ) : null;
              })()}
            </>
          ) : (
            <>
              <span
                className="text-4xl font-black tracking-tight leading-none"
                style={{ color: tier.colors.arc[1], textShadow: `0 0 20px ${tier.colors.glow}` }}
              >
                {(currentPoints ?? 0).toLocaleString()}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/25 mt-2">
                POINTS
              </span>
            </>
          )}
        </div>
      </div>

      {/* Sub-label */}
      <div className="-mt-3 text-center">
        {hasPolicyData ? (
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <span className={`font-bold ${tier.colors.text}`}>{totalMonths}</span> month policy ·{" "}
            <span className={`font-bold ${tier.colors.text}`}>
              {totalMonths! - remainingMonths!}
            </span> elapsed
          </p>
        ) : next ? (
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <span className={`font-bold ${next.colors.text}`}>
              {(next.threshold - currentPoints).toLocaleString()}
            </span>{" "}
            points to next milestone
          </p>
        ) : (
          <p className={`text-xs font-bold uppercase tracking-[0.15em] ${tier.colors.text}`}>
            Maximum tier reached
          </p>
        )}
      </div>
    </div>
  );
};
