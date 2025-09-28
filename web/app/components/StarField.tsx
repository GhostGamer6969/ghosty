'use client';

import { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const stars: Star[] = Array.from({ length: 200 }, () => ({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      speed: Math.random() * 1 + 0.5,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random()
    }));

    const animate = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      stars.forEach(star => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Update star position
        star.y += star.speed;
        star.opacity = Math.sin(Date.now() * 0.001 + star.speed) * 0.5 + 0.5;

        // Reset star position when it goes off screen
        if (star.y > dimensions.height) {
          star.y = 0;
          star.x = Math.random() * dimensions.width;
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions]); // Re-run effect when dimensions change

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  );
}