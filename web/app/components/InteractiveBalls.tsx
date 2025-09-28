'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function InteractiveBalls() {
  const ballsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      ballsRef.current.forEach((ball, index) => {
        if (!ball) return;

        const rect = ball.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const moveX = (clientX - centerX) * 0.05;
        const moveY = (clientY - centerY) * 0.05;
        const scale = 1 + Math.sin(Date.now() * 0.001 + index) * 0.1;

        gsap.to(ball, {
          x: moveX,
          y: moveY,
          scale: scale,
          duration: 1,
          ease: 'power2.out',
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        ref={el => { ballsRef.current[0] = el; }}
        className="absolute top-1/4 -left-20 w-[40rem] h-[40rem] rounded-full
        bg-blue-500/10 blur-3xl transition-all duration-500"
      />
      <div
        ref={el => { ballsRef.current[1] = el; }}
        className="absolute bottom-1/4 -right-20 w-[30rem] h-[30rem] rounded-full
        bg-purple-500/10 blur-3xl transition-all duration-500"
      />
      <div
        ref={el => { ballsRef.current[2] = el; }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[50rem] h-[50rem] rounded-full bg-cyan-500/5 blur-3xl transition-all duration-500"
      />
    </div>
  );
}
