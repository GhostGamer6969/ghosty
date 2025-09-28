'use client';

interface InterstellarButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
  loadingText?: string;
}

export default function InterstellarButton({
  children,
  onClick,
  className = '',
  loading = false,
  loadingText = 'Loading...'
}: InterstellarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        ${className}
        relative overflow-hidden
        px-6 py-3 rounded-lg
        bg-gradient-to-r from-blue-500 to-purple-600
        text-white font-medium
        transition-all duration-300
        hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25
        disabled:opacity-50 disabled:hover:scale-100
      `}
    >
      <div className="relative z-10">
        {loading ? loadingText : children}
      </div>
      <div className="absolute inset-0 bg-white/20 animate-shimmer" />
    </button>
  );
}