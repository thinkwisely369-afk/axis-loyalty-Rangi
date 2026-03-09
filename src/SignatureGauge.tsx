import { useRef, useEffect } from "react";

interface Props {
  value: number;
  max: number;
  label: string;
  sublabel: string;
}

const SignatureGauge = ({ value, max, label, sublabel }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const percentage = Math.min(value / max, 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 200;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 80;
    const lineWidth = 8;
    const startAngle = 0.75 * Math.PI;
    const endAngle = 2.25 * Math.PI;
    const sweep = endAngle - startAngle;

    // Track background
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = "hsl(220, 15%, 15%)";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Active arc
    const gradient = ctx.createLinearGradient(0, size, size, 0);
    gradient.addColorStop(0, "hsl(180, 100%, 50%)");
    gradient.addColorStop(0.5, "hsl(180, 100%, 45%)");
    gradient.addColorStop(1, "hsl(160, 100%, 40%)");

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, startAngle + sweep * percentage);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.shadowColor = "hsl(180, 100%, 50%)";
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Tick marks
    const numTicks = 40;
    for (let i = 0; i <= numTicks; i++) {
      const angle = startAngle + (sweep * i) / numTicks;
      const isMajor = i % 10 === 0;
      const innerR = radius - (isMajor ? 18 : 14);
      const outerR = radius - 10;
      const x1 = cx + Math.cos(angle) * innerR;
      const y1 = cy + Math.sin(angle) * innerR;
      const x2 = cx + Math.cos(angle) * outerR;
      const y2 = cy + Math.sin(angle) * outerR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = i / numTicks <= percentage
        ? "hsl(180, 80%, 50%)"
        : "hsl(220, 10%, 25%)";
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();
    }
  }, [value, max, percentage]);

  return (
    <div className="flex flex-col items-center relative">
      <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">
        Signature Member
      </p>
      <div className="relative">
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold neon-text font-mono tracking-tight">
            {value.toLocaleString()}
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            {label}
          </span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground -mt-3 mb-0 font-medium">{sublabel}</p>
    </div>
  );
};

export default SignatureGauge;
