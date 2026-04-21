'use client';

import { useEffect, useRef } from 'react';

// DO NOT MODIFY: palette, speeds, density, charset locked per brief
interface MatrixRainProps {
  intensity?: number;
}

export default function MatrixRain({ intensity = 1 }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false })!;

    const CHARS = (
      '0123456789'.repeat(3) +
      '01'.repeat(6) +
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
      'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
      '$€¥%+-<>@#&' +
      '║│╠╣' +
      'ΣΩψ∆∇∫∮∑∏∞ √∂∈∉∅αβγδ∘'
    ).split('');
    const randChar = () => CHARS[(Math.random() * CHARS.length) | 0];

    let rafId: number;
    let W = 0, H = 0, dpr = 1;
    type Column = {
      x: number;
      headRow: number;
      speed: number;
      trailLength: number;
      accent: boolean;
      mutateRate: number;
      active: boolean;
      cooldown: number;
      chars: Map<number, string>;
      burstUntil: number;
    };
    let columns: Column[] = [];
    let fontSize = 14;
    let cellSize = 18;
    let frameCount = 0;

    function createColumn(x: number): Column {
      return {
        x,
        headRow: -((Math.random() * 40) | 0),
        speed: 0.06 + Math.random() * 0.22,
        trailLength: 10 + ((Math.random() * 22) | 0),
        accent: Math.random() < 0.11,
        mutateRate: 0.015 + Math.random() * 0.035,
        active: Math.random() < 0.68,
        cooldown: (Math.random() * 120) | 0,
        chars: new Map(),
        burstUntil: 0,
      };
    }

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parent = canvas.parentElement;
      W = parent ? parent.clientWidth : window.innerWidth;
      H = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fontSize = W < 640 ? 11 : 14;
      cellSize = Math.round(fontSize * 1.3);

      const colCount = Math.ceil(W / cellSize) + 1;
      columns = [];
      for (let i = 0; i < colCount; i++) columns.push(createColumn(i * cellSize));

      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, W, H);
    }

    resize();
    window.addEventListener('resize', resize);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      ro = new ResizeObserver(() => resize());
      ro.observe(canvas.parentElement);
    }

    if (W === 0 || H === 0) {
      requestAnimationFrame(() => resize());
    }

    function draw() {
      frameCount++;
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, W, H);

      const globalI = intensityRef.current;
      if (globalI <= 0.02) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      ctx.font = `500 ${fontSize}px 'JetBrains Mono', ui-monospace, monospace`;
      ctx.textBaseline = 'top';
      const numRows = Math.ceil(H / cellSize);

      for (const col of columns) {
        if (!col.active) {
          col.cooldown--;
          if (col.cooldown <= 0 && Math.random() < 0.012) {
            col.active = true;
            col.headRow = -((Math.random() * 4) | 0);
            col.speed = 0.06 + Math.random() * 0.22;
            col.trailLength = 10 + ((Math.random() * 22) | 0);
            col.accent = Math.random() < 0.11;
            col.mutateRate = 0.015 + Math.random() * 0.035;
            col.chars.clear();
          }
          continue;
        }

        const prevHead = Math.floor(col.headRow);
        col.headRow += col.speed;
        const head = Math.floor(col.headRow);

        if (head > prevHead) {
          for (let r = prevHead + 1; r <= head; r++) col.chars.set(r, randChar());
          for (const row of col.chars.keys()) {
            if (head - row > col.trailLength) col.chars.delete(row);
          }
        }

        if (col.chars.size > 1 && Math.random() < col.mutateRate) {
          const rows = [...col.chars.keys()];
          const pickIdx = 1 + ((Math.random() * (rows.length - 1)) | 0);
          const pick = rows[pickIdx];
          if (pick !== undefined && pick !== head) col.chars.set(pick, randChar());
        }

        if (frameCount > 120 && Math.random() < 0.00025) {
          col.burstUntil = frameCount + 25 + ((Math.random() * 20) | 0);
        }
        const bursting = frameCount < col.burstUntil;

        const accentRGB = col.accent ? '244, 114, 56' : '79, 212, 224';
        const headRGB   = col.accent ? '255, 180, 130' : '195, 245, 252';

        for (const [row, ch] of col.chars) {
          const y = row * cellSize;
          if (y < -cellSize || y > H + cellSize) continue;

          const dist = head - row;
          const isHead = dist === 0;
          const trailT = dist / col.trailLength;
          let opacity = Math.max(0, Math.pow(1 - trailT, 1.4));
          if (bursting) opacity = Math.min(1, opacity * 1.8);
          opacity *= globalI;

          if (isHead) {
            ctx.shadowColor = col.accent ? '#f47238' : '#4fd4e0';
            ctx.shadowBlur = bursting ? 16 : 10;
            ctx.fillStyle = `rgba(${headRGB}, ${globalI})`;
            ctx.fillText(ch, col.x, y);
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = `rgba(${accentRGB}, ${opacity * 0.72})`;
            ctx.fillText(ch, col.x, y);
          }
        }

        if (col.headRow - col.trailLength > numRows + 2) {
          col.active = false;
          col.cooldown = 30 + ((Math.random() * 160) | 0);
          col.chars.clear();
        }
      }

      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      ro?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
