'use client';

import { useState } from 'react';

interface Piece {
  id: number; left: number; delay: number; dur: number;
  color: string; size: number; round: boolean;
}

export default function Confetti() {
  // useState lazy-init avoids calling Math.random() during render
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: 55 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.8,
      dur: 2 + Math.random() * 2,
      color: ['#ea5a2a', '#4fd4e0', '#e8c557', '#6a72ff', '#3fd39a', '#ffffff'][i % 6],
      size: 5 + Math.random() * 8,
      round: Math.random() > 0.5,
    }))
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 100,
      }}
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `dx-confetti-fall ${p.dur}s linear ${p.delay}s forwards`,
            borderRadius: p.round ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}
