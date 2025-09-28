'use client';

interface GlowingTextProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlowingText({ children, className = '' }: GlowingTextProps) {
  return (
    <h1 className={`
      ${className}
      font-bold text-transparent bg-clip-text
      bg-gradient-to-r from-blue-400 to-purple-600
      animate-glow
    `}>
      {children}
    </h1>
  );
}