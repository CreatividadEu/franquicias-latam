'use client';

import { useEffect, useRef } from 'react';
import { DIM_LABELS } from './data';

// DO NOT MODIFY: radar mapping locked per brief (DIM_Q_MAP = [0,1,3,4,5])
interface RadarChartProps {
  values: number[];
  color?: string;
  size?: number;
}

export default function RadarChart({
  values,
  color = '#ea5a2a',
  size = 210,
}: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const currentVals = useRef([0, 0, 0, 0, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = size / 2, cy = size / 2, r = size * 0.36, n = 5;
    const target = [...values];
    cancelAnimationFrame(animRef.current);
    let start: number | null = null;
    const dur = 700;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const ease = (t: number) =>
      t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1;

    function hexToRgb(h: string) {
      const m = h.replace('#', '').match(/.{2}/g);
      if (!m) return '234,90,42';
      return `${parseInt(m[0], 16)},${parseInt(m[1], 16)},${parseInt(m[2], 16)}`;
    }
    const rgb = hexToRgb(color);

    function draw(progress: number) {
      ctx.clearRect(0, 0, size, size);
      const t = ease(Math.min(progress, 1));
      const cv = currentVals.current.map((c, i) => lerp(c, target[i], t));

      // Grid rings
      for (let lvl = 1; lvl <= 4; lvl++) {
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const a = (Math.PI * 2 * i) / n - Math.PI / 2;
          const rv = (r * lvl) / 4;
          const x = cx + rv * Math.cos(a);
          const y = cy + rv * Math.sin(a);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Axis spokes
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Labels
      ctx.font = `600 9.5px 'JetBrains Mono', ui-monospace, monospace`;
      ctx.fillStyle = 'rgba(200, 220, 240, 0.42)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        ctx.fillText(
          DIM_LABELS[i].toUpperCase(),
          cx + (r + 22) * Math.cos(a),
          cy + (r + 22) * Math.sin(a)
        );
      }

      // Filled polygon
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        const rv = r * cv[i];
        const x = cx + rv * Math.cos(a);
        const y = cy + rv * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(${rgb}, 0.45)`);
      grad.addColorStop(1, `rgba(${rgb}, 0.08)`);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vertex dots + glow
      for (let i = 0; i < n; i++) {
        if (cv[i] === 0) continue;
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        const rv = r * cv[i];
        const x = cx + rv * Math.cos(a);
        const y = cy + rv * Math.sin(a);
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      }

      if (t < 1) {
        animRef.current = requestAnimationFrame((ts) => {
          if (!start) start = ts;
          draw((ts - start) / dur);
        });
      } else {
        currentVals.current = [...target];
      }
    }

    animRef.current = requestAnimationFrame((ts) => {
      start = ts;
      draw(0);
    });

    return () => cancelAnimationFrame(animRef.current);
  }, [values, color, size]);

  return <canvas ref={canvasRef} />;
}
