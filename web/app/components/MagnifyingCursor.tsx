'use client';

import { useEffect, useState } from 'react';

export default function MagnifyingCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringText, setIsHoveringText] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Check if hovering over text or interactive elements
      const target = e.target as HTMLElement;
      setIsHoveringText(
        target.tagName === 'P' || 
        target.tagName === 'H1' || 
        target.tagName === 'H2' || 
        target.tagName === 'H3' ||
        target.tagName === 'SPAN' ||
        target.tagName === 'BUTTON'
      );
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <div
        className={`fixed w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-blue-400/50 
        transition-all duration-150 mix-blend-difference
        ${isHoveringText ? 'scale-75 bg-blue-400/10' : 'scale-100'}`}
        style={{
          left: position.x,
          top: position.y,
          transform: `scale(${isHoveringText ? 1.5 : 1})`,
        }}
      />
      <div
        className={`fixed w-2 h-2 -ml-1 -mt-1 bg-blue-400 rounded-full 
        transition-all duration-100 mix-blend-difference`}
        style={{
          left: position.x,
          top: position.y,
        }}
      />
    </div>
  );
}