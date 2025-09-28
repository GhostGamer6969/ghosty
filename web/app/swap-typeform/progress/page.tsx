"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import InterstellarButton from "../../components/InterstellarButton";

const STEPS = [
  "Preparing swap",
  "Fetching conversion rate",
  "Submitting transaction",
  "Awaiting confirmation",
  "Swap complete",
];

export default function SwapProgressPage() {
  const params = useSearchParams();
  const router = useRouter();

  const direction = params.get("direction") ?? "ETH → XLM";

  const [step, setStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(console.error);
    const t = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (step >= STEPS.length - 1) return;
    const timer = setTimeout(() => setStep((s) => s + 1), 1500);
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center">
      {/* video background */}
      <div className="fixed inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-40"
        >
          <source src="/lightspeed_compressed.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* content */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center transition-all duration-700 px-4 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ maxWidth: "100vw" }}
      >
        <h1 className="text-3xl md:text-3xl font-bold font-mono text-white mb-4 text-center">
          Executing Swap
        </h1>
        <p className="text-sm opacity-70 text-white mb-10 font-mono text-center">
          Direction: {direction}
        </p>

        <div
          className="relative overflow-visible w-full max-w-[8000px]"
          style={{ width: "100%", maxWidth: 1400, height: 60 }}
        >
          <svg
            viewBox="0 20 1400 60"
            className="w-[1200px] h-[60px]"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Glow/filter for shadow around arrow */}
              <filter
                id="glow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
                colorInterpolationFilters="sRGB"
              >
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="8"
                  floodColor="white"
                  floodOpacity="0.8"
                />
              </filter>

              {/* Arrow mask with parallelogram shape and glow */}
              <mask id="arrow-mask" maskUnits="userSpaceOnUse">
                <rect width="9000" height="60" fill="black" />
                <polygon
                  points="0,0 200,0 260,60 60,60"
                  fill="white"
                  filter="url(#glow)"
                  className="arrow-mask"
                  style={{ animation: "arrowSlide 3s linear infinite" }}
                />
              </mask>

              <style>{`
                .text-stroke {
                  font-family: monospace;
                  font-weight: 700;
                  font-size: 48px;
                  stroke: white;
                  stroke-width: 3;
                  stroke-linejoin: round;
                  user-select: none;
                }
                .text-fill-black {
                  fill: black;
                  stroke-width: 1;
                  stroke-linejoin: round;
                }
                .text-fill-white {
                  fill: white;
                  stroke-width: 3;
                  stroke-linejoin: round;
                  mask: url(#arrow-mask);
                }
                .text-fill-green {
                  fill: #22c55e; /* Tailwind green 500 */
                  stroke-width: 1;
                  stroke-linejoin: round;
                }
              `}</style>
            </defs>

            {/* Bottom base text with conditional black or green fill, always white stroke */}
            <text
              x="50%"
              y="45"
              dominantBaseline="middle"
              textAnchor="middle"
              className={`text-stroke ${step === STEPS.length - 1 ? "text-fill-green" : "text-fill-black"}`}
              stroke={step === STEPS.length - 1 ? "#22c55e" : "white"}
              strokeWidth="3"
              strokeLinejoin="round"
              fill={step === STEPS.length - 1 ? "#22c55e" : "black"}
            >
              {STEPS[step]}
            </text>

            {/* Top white fill text masked by arrow */}
            <text
              x="50%"
              y="45"
              dominantBaseline="middle"
              textAnchor="middle"
              className="text-stroke text-fill-white"
              stroke="white"
              strokeWidth="3"
              strokeLinejoin="round"
              // userSelect="none"
              mask="url(#arrow-mask)"
            >
              {STEPS[step]}
            </text>
          </svg>
        </div>

        {step === STEPS.length - 1 && (
          <div className="mt-12">
            <InterstellarButton onClick={() => router.push("/swap-typeform")}>
              Start New Swap
            </InterstellarButton>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes arrowSlide {
          0% {
            transform: translateX(-80px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(680px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
