"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import InterstellarButton from "../components/InterstellarButton";
import InteractiveBalls from "../components/InteractiveBalls";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";

interface SwapForm {
  ethAddress: string;
  walletAddress: string;
  direction: string;
  fromAsset: string;
  fromAmount: string;
}

interface ConversionRate {
  fromAmount: string;
  toAmount: string;
  rate: string;
  gasEstimate: string;
  ethPriceUSD?: string;
  xlmPriceUSD?: string;
  source?: string;
  loading: boolean;
  error: string | null;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  type:
    | "connect"
    | "direction"
    | "asset"
    | "amount"
    | "slippage"
    | "wallet"
    | "confirm";
  options?: string[];
}

const questions: Question[] = [
  {
    id: "connect",
    title: "Connect your wallets",
    subtitle:
      "Link your Ethereum (Metamask) and Stellar (Freighter) wallets to continue",
    type: "connect",
  },
  {
    id: "direction",
    title: "Which direction do you want to swap?",
    subtitle: "Choose your swap direction",
    type: "direction",
    options: ["ETH → XLM", "XLM → ETH"],
  },
  {
    id: "fromAsset",
    title: "Select the asset you are swapping",
    subtitle: "Select the asset you want to convert (only ETH available)",
    type: "asset",
    options: ["USDC", "USDT", "BTC", "ETH", "SOL", "ADA", "DOT", "LINK"],
  },
  {
    id: "fromAmount",
    title: "How much do you want to swap?",
    subtitle: "Enter the amount of ETH you want to convert to XLM",
    type: "amount",
  },
  {
    id: "wallet",
    title: "Where should we send your XLM?",
    subtitle: "Enter your Stellar wallet address",
    type: "wallet",
  },
  {
    id: "confirm",
    title: "Ready to transcend dimensions?",
    subtitle: "Review your swap details and conversion rate before proceeding",
    type: "confirm",
  },
];

const cardVariants = {
  initial: { opacity: 0, scale: 0.9, y: 90, filter: "blur(14px)", zIndex: 0 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    zIndex: 2,
    transition: { type: "spring" as const, stiffness: 140, damping: 16 },
  },
  exit: {
    opacity: 0,
    scale: 0.84,
    y: -70,
    filter: "blur(14px)",
    zIndex: 0,
    transition: { duration: 0.3 },
  },
};

export default function SwapTypeformPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [swapForm, setSwapForm] = useState<SwapForm>({
    ethAddress: "",
    walletAddress: "",
    direction: "",
    fromAsset: "",
    fromAmount: "",
  });
  const [conversionRate, setConversionRate] = useState<ConversionRate>({
    fromAmount: "",
    toAmount: "",
    rate: "",
    gasEstimate: "",
    loading: false,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isEthToXlm = swapForm.direction === "ETH → XLM";

  // 3D tilt / glare
  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useTransform(my, [0, 1], [14, -14]);
  const rotateY = useTransform(mx, [0, 1], [-18, 18]);
  const rX = useSpring(rotateX, { stiffness: 180, damping: 18 });
  const rY = useSpring(rotateY, { stiffness: 180, damping: 18 });

  const [shine, setShine] = useState({ x: 200, y: 160 });

  const onCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mx.set(x);
    my.set(y);
    setShine({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const onCardMouseLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  // Cursor / spotlight
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const onRootMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setCursor({ x: e.clientX, y: e.clientY });
  };

  // Navigation
  const handleNext = useCallback(() => {
    if (currentStep < questions.length - 1) setCurrentStep(currentStep + 1);
  }, [currentStep]);
  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }, [currentStep]);
  const handleSwap = useCallback(() => {
    router.push(
      `/swap-typeform/progress?direction=${encodeURIComponent(
        swapForm.direction
      )}`
    );
  }, [router, swapForm.direction]);

  // Key press advance
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const q = questions[currentStep];
        let ok = false;
        switch (q.type) {
          case "connect":
            ok = !!swapForm.ethAddress && !!swapForm.walletAddress;
            break;
          case "direction":
            ok = !!swapForm.direction;
            break;
          case "asset":
            ok = !!swapForm.fromAsset;
            break;
          case "amount":
            ok = !!swapForm.fromAmount && parseFloat(swapForm.fromAmount) > 0;
            break;
          case "wallet":
            ok = !!swapForm.walletAddress && swapForm.walletAddress.length > 0;
            break;
          case "confirm":
            ok = true;
            break;
          default:
            ok = false;
        }
        if (ok) {
          if (currentStep < questions.length - 1) handleNext();
          else if (!isLoading) handleSwap();
        }
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [currentStep, swapForm, isLoading, handleNext, handleSwap]);

  // Inputs
  const handleInputChange = (value: string | number) => {
    const q = questions[currentStep];
    setSwapForm((prev) => ({ ...prev, [q.id]: value }));
    if (q.id === "fromAmount" && typeof value === "string")
      getConversionRate(value);
  };

  const getConversionRate = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setConversionRate((prev) => ({ ...prev, loading: false, error: null }));
      return;
    }
    setConversionRate((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(`/api/1inch/quote?amount=${amount}`);
      if (!response.ok) throw new Error("Failed to fetch conversion rate");
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      const { data } = result;
      setConversionRate({
        fromAmount: data.fromAmount,
        toAmount: data.toAmount,
        rate: data.rate,
        gasEstimate: data.gasEstimate.toString(),
        ethPriceUSD: data.ethPriceUSD?.toString(),
        xlmPriceUSD: data.xlmPriceUSD?.toString(),
        source: data.source,
        loading: false,
        error: null,
      });
    } catch (error) {
      setConversionRate((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch rate",
      }));
    }
  };

  // Updated: premium monochrome glass card background
  const cardBg =
    "relative flex flex-col items-center justify-center w-[520px] h-[320px] sm:w-[620px] sm:h-[370px] rounded-[28px] overflow-hidden bg-gradient-to-tl from-[#15181f] via-[#0f1116] to-[#0a0c10] border border-white/10 shadow-[0_0_96px_-16px_rgba(255,255,255,0.10)] z-[2] paycard-glow";

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case "connect":
        return (
          <div className="flex flex-col gap-5 w-full px-3">
            <div className="flex items-center justify-between gap-4">
              <div className="w-1/2 flex flex-col items-center gap-2">
                <span className="paycard-label text-base">Ethereum Wallet</span>
                {swapForm.ethAddress ? (
                  <span className="paycard-value text-[15px]">
                    {swapForm.ethAddress}
                  </span>
                ) : (
                  <InterstellarButton className="magnetic-btn">
                    <span
                      onClick={async () => {
                        if ((window as any).ethereum) {
                          try {
                            const accounts = await (
                              window as any
                            ).ethereum.request({
                              method: "eth_requestAccounts",
                            });
                            setSwapForm((prev) => ({
                              ...prev,
                              ethAddress: accounts[0],
                            }));
                          } catch {
                            alert("Failed to connect to MetaMask");
                          }
                        } else {
                          alert("MetaMask not detected");
                        }
                      }}
                    >
                      Connect MetaMask
                    </span>
                  </InterstellarButton>
                )}
              </div>
              <div className="w-[2px] h-14 mx-2 bg-gradient-to-b from-white/10 to-white/5" />
              <div className="w-1/2 flex flex-col items-center gap-2">
                <span className="paycard-label text-base">Stellar Wallet</span>
                {swapForm.walletAddress ? (
                  <span className="paycard-value text-[15px]">
                    {swapForm.walletAddress}
                  </span>
                ) : (
                  <InterstellarButton className="magnetic-btn">
                    <span
                      onClick={async () => {
                        try {
                          const { connect: connectStellar, getPublicKey } =
                            await import("../lib/stellar-wallets-kit");
                          await connectStellar();
                          const pk = await getPublicKey();
                          if (pk)
                            setSwapForm((prev) => ({
                              ...prev,
                              walletAddress: pk,
                            }));
                        } catch {
                          // silent
                        }
                      }}
                    >
                      Connect Freighter
                    </span>
                  </InterstellarButton>
                )}
              </div>
            </div>
          </div>
        );
      case "direction":
        return (
          <div className="flex flex-row gap-4 w-full justify-center">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleInputChange(option)}
                className={`paycard-directionbtn ${
                  swapForm.direction === option
                    ? "paycard-selected"
                    : "paycard-unselected"
                }`}
              >
                <span className="font-semibold text-[18px]">{option}</span>
                <span className="text-xs block opacity-70">
                  {option === "ETH → XLM"
                    ? "Ethereum to Stellar"
                    : "Stellar to Ethereum"}
                </span>
              </button>
            ))}
          </div>
        );
      case "asset":
        return (
          <div className="flex flex-row gap-3 w-full justify-center">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() =>
                  isEthToXlm
                    ? option === "ETH" && handleInputChange(option)
                    : null
                }
                disabled={isEthToXlm ? option !== "ETH" : true}
                className={`paycard-assetbtn ${
                  isEthToXlm
                    ? option === "ETH"
                      ? swapForm.fromAsset === option
                        ? "paycard-selected"
                        : "paycard-unselected"
                      : "paycard-disabled"
                    : "paycard-disabled"
                }`}
              >
                <span className="font-semibold text-[16px]">{option}</span>
                <span className="text-[11px] opacity-70">
                  {option === "ETH" ? "Available" : "Coming Soon"}
                </span>
              </button>
            ))}
          </div>
        );
      case "amount":
        return (
          <div className="w-full flex flex-col items-center">
            <input
              type="number"
              placeholder={isEthToXlm ? "ETH amount" : "XLM amount"}
              value={swapForm.fromAmount}
              onChange={(e) => handleInputChange(e.target.value)}
              className="paycard-input"
              min={0}
              aria-label={`Enter ${isEthToXlm ? "ETH" : "XLM"} amount`}
              role="spinbutton"
            />
          </div>
        );
      case "wallet":
        return (
          <div className="w-full flex flex-col items-center">
            <input
              type="text"
              placeholder="G..."
              value={swapForm.walletAddress}
              onChange={(e) =>
                setSwapForm((prev) => ({
                  ...prev,
                  walletAddress: e.target.value,
                }))
              }
              className="paycard-input"
            />
          </div>
        );
      case "confirm":
        return (
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-[17px] text-white/85 mb-1">
              Review Your Swap
            </span>
            <div className="paycard-details">
              <div>
                <span className="paycard-label">Direction:</span>
                <span className="paycard-value">{swapForm.direction}</span>
              </div>
              <div>
                <span className="paycard-label">From:</span>
                <span className="paycard-value">
                  {swapForm.fromAmount} {swapForm.fromAsset}
                </span>
              </div>
              <div>
                <span className="paycard-label">To:</span>
                <span className="paycard-value">
                  {conversionRate.loading
                    ? "Loading..."
                    : conversionRate.toAmount
                    ? `${conversionRate.toAmount} ${isEthToXlm ? "XLM" : "ETH"}`
                    : "~0"}
                </span>
              </div>
              {conversionRate.rate && (
                <div>
                  <span className="paycard-label">Rate:</span>
                  <span className="paycard-value">
                    {isEthToXlm
                      ? `1 ETH = ${conversionRate.rate} XLM`
                      : `1 XLM = ${conversionRate.rate} ETH`}
                  </span>
                </div>
              )}
              {conversionRate.ethPriceUSD && (
                <div>
                  <span className="paycard-label">ETH Price:</span>
                  <span className="paycard-value">
                    ${conversionRate.ethPriceUSD}
                  </span>
                </div>
              )}
              {conversionRate.xlmPriceUSD && (
                <div>
                  <span className="paycard-label">XLM Price:</span>
                  <span className="paycard-value">
                    ${conversionRate.xlmPriceUSD}
                  </span>
                </div>
              )}
              {conversionRate.gasEstimate && (
                <div>
                  <span className="paycard-label">Gas:</span>
                  <span className="paycard-value">
                    ~{conversionRate.gasEstimate} ETH
                  </span>
                </div>
              )}
              {conversionRate.error && (
                <div>
                  <span className="text-red-400 font-bold">Error:</span>
                  <span className="text-red-300">{conversionRate.error}</span>
                </div>
              )}
              <div>
                <span className="paycard-label">Network:</span>
                <span className="paycard-value">
                  {isEthToXlm ? "Ethereum → Stellar" : "Stellar → Ethereum"}
                </span>
              </div>
              <div>
                <span className="paycard-label">Wallet:</span>
                <span className="paycard-value text-xs">
                  {swapForm.walletAddress
                    ? `${swapForm.walletAddress.slice(0, 8)}...${swapForm.walletAddress.slice(-8)}`
                    : ""}
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="swap-bg min-h-screen flex items-center justify-center swap-overflow"
      onMouseMove={onRootMouseMove}
    >
      <InteractiveBalls />

      {/* Spotlight overlay */}
      <div
        className="spotlight pointer-events-none fixed inset-0 z-10"
        style={{
          ["--x" as any]: `${cursor.x}px`,
          ["--y" as any]: `${cursor.y}px`,
        }}
      />

      <div className="paycard-outer flex flex-col items-center justify-center relative z-20">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[2, 1].map((idx) => (
            <motion.div
              key={idx}
              className="paycard-bg shadow-md pointer-events-none"
              style={{
                zIndex: 1,
                transform: `scale(${0.95 - idx * 0.03}) translateY(${10 * idx}px)`,
                opacity: 1 / (2 * (idx + 1)),
                filter: "blur(14px)",
              }}
              initial={false}
              animate={{ opacity: 0.16 / (1 + idx), filter: "blur(24px)" }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            ref={cardRef}
            className={cardBg}
            key={currentStep}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 140, damping: 16 }}
            onMouseMove={onCardMouseMove}
            onMouseLeave={onCardMouseLeave}
            style={{
              rotateX: rX,
              rotateY: rY,
              transformStyle: "preserve-3d",
              perspective: 1000,
            }}
            whileHover={{ scale: 1.015 }}
          >
            {/* moving circular specular */}
            <div
              className="paycard-shine"
              style={{
                ["--sx" as any]: `${shine.x}px`,
                ["--sy" as any]: `${shine.y}px`,
              }}
            />
            {/* sweeping shiny line */}
            <div className="paycard-sweep" aria-hidden="true" />

            <div className="w-full flex flex-col items-center px-5">
              <span className="paycard-question-title">
                {currentQuestion.title}
              </span>
              <span className="paycard-question-subtitle">
                {currentQuestion.subtitle}
              </span>
              <div className="w-full flex flex-col items-center pt-7">
                {renderQuestion()}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center w-[520px] sm:w-[620px] mx-auto pt-10 gap-4 z-10">
          {currentStep > 0 ? (
            <motion.button
              whileHover={{ y: -2, scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="paycard-nav"
              onClick={handleBack}
            >
              ← Back
            </motion.button>
          ) : (
            <span />
          )}
          <div
            className="flex-1 overflow-hidden rounded-md progress-track"
            style={{ height: "10px" }}
          >
            <motion.div
              className="h-full progress-bar"
              style={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 16 }}
            />
          </div>
          <motion.button
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="paycard-nav paycard-next"
            onClick={
              currentStep < questions.length - 1 ? handleNext : handleSwap
            }
          >
            {currentStep < questions.length - 1 ? "Continue" : "Execute Swap"}
          </motion.button>
        </div>
      </div>

      <div
        className="
        cursor-glow 
        fixed z-[60] 
        pointer-events-none"
        style={{
          transform: `translate3d(${cursor.x - 28}px, ${cursor.y - 28}px, 0)`,
        }}
      />
    </div>
  );
}
