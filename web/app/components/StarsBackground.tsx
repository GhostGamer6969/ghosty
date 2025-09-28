// components/StarsBackground.tsx
"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

export default function StarsBackground({ density = 1 }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const widthRef = useRef<number>(0);
  const heightRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const initStars = (count: number) => {
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * widthRef.current,
        y: Math.random() * heightRef.current,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1,
      }));
    };

    const handleResize = () => {
      widthRef.current = window.innerWidth;
      heightRef.current = window.innerHeight;

      if (canvasRef.current) {
        canvasRef.current.width = widthRef.current * window.devicePixelRatio;
        canvasRef.current.height = heightRef.current * window.devicePixelRatio;
        canvasRef.current.style.width = `${widthRef.current}px`;
        canvasRef.current.style.height = `${heightRef.current}px`;
      }

      const count = Math.floor((widthRef.current * heightRef.current) / 10000 * density);
      initStars(count);
    };

    const animate = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, widthRef.current, heightRef.current);
      ctx.fillStyle = "white";

      starsRef.current.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.speed;
        if (star.y > heightRef.current) {
          star.y = 0;
          star.x = Math.random() * widthRef.current;
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
    />
  );
}
