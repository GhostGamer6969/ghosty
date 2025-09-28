'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InterstellarButton from '../components/InterstellarButton';
import InteractiveBalls from '../components/InteractiveBalls';
import { motion } from 'framer-motion';

interface SwapForm {
  ethAddress: string;
  walletAddress: string; // Stellar address
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
  type: 'connect' | 'direction' | 'asset' | 'amount' | 'slippage' | 'wallet' | 'confirm';
  options?: string[];
}

const questions: Question[] = [
  {
    id: 'connect',
    title: 'Connect your wallets',
    subtitle: 'Link your Ethereum (Metamask) and Stellar (Freighter) wallets to continue',
    type: 'connect'
  },
  {
    id: 'direction',
    title: 'Which direction do you want to swap?',
    subtitle: 'Choose your swap direction',
    type: 'direction',
    options: ['ETH → XLM', 'XLM → ETH']
  },
  {
    id: 'fromAsset',
    title: 'Select the asset you are swapping',
    subtitle: 'Select the asset you want to convert (only ETH available)',
    type: 'asset',
    options: ['USDC', 'USDT', 'BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK']
  },
  {
    id: 'fromAmount',
    title: 'How much do you want to swap?',
    subtitle: 'Enter the amount of ETH you want to convert to XLM',
    type: 'amount'
  },
  {
    id: 'wallet',
    title: 'Where should we send your XLM?',
    subtitle: 'Enter your Stellar wallet address',
    type: 'wallet'
  },
  {
    id: 'confirm',
    title: 'Ready to transcend dimensions?',
    subtitle: 'Review your swap details and conversion rate before proceeding',
    type: 'confirm'
  }
];

export default function SwapTypeformPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [swapForm, setSwapForm] = useState<SwapForm>({
    ethAddress: '',
    walletAddress: '',
    direction: '',
    fromAsset: '',
    fromAmount: ''
  });
  const [conversionRate, setConversionRate] = useState<ConversionRate>({
    fromAmount: '',
    toAmount: '',
    rate: '',
    gasEstimate: '',
    loading: false,
    error: null
  });
  const [isLoading, setIsLoading] = useState(false);
  

  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
    
    // Trigger fade in after a short delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        
        // Check if current question is answered
        const currentQuestion = questions[currentStep];
        let hasAnswer = false;
        
        switch (currentQuestion.type) {
          case 'connect':
            hasAnswer = !!swapForm.ethAddress && !!swapForm.walletAddress;
            break;
          case 'direction':
            hasAnswer = !!swapForm.direction;
            break;
          case 'asset':
            hasAnswer = !!swapForm.fromAsset;
            break;
          case 'amount':
            hasAnswer = !!swapForm.fromAmount && parseFloat(swapForm.fromAmount) > 0;
            break;
          case 'wallet':
            hasAnswer = !!swapForm.walletAddress && swapForm.walletAddress.length > 0;
            break;
          case 'confirm':
            hasAnswer = true; // Always valid on confirm step
            break;
          default:
            hasAnswer = false;
        }
        
        if (hasAnswer) {
          if (currentStep < questions.length - 1) {
            handleNext();
          } else if (currentStep === questions.length - 1 && !isLoading) {
            handleSwap();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentStep, swapForm, isLoading]);

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (value: string | number) => {
    const currentQuestion = questions[currentStep];
    console.log('Input change:', { field: currentQuestion.id, value, currentStep });
    setSwapForm(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    // Fetch conversion rate when amount changes
    if (currentQuestion.id === 'fromAmount' && typeof value === 'string') {
      getConversionRate(value);
    }
  };

  const hasValidAnswer = () => {
    const currentQuestion = questions[currentStep];
    
    switch (currentQuestion.type) {
      case 'connect':
        return !!swapForm.ethAddress && !!swapForm.walletAddress;
      case 'asset':
        return !!swapForm[currentQuestion.id as keyof SwapForm];
      case 'amount':
        return !!swapForm.fromAmount && parseFloat(swapForm.fromAmount) > 0;
      case 'wallet':
        return !!swapForm.walletAddress && swapForm.walletAddress.length > 0;
      case 'confirm':
        return true; // Always valid on confirm step
      default:
        return false;
    }
  };

  // 1inch API integration via our API route
  const getConversionRate = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setConversionRate(prev => ({ ...prev, loading: false, error: null }));
      return;
    }

    setConversionRate(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Call our API route instead of 1inch directly
      const response = await fetch(`/api/1inch/quote?amount=${amount}`);

      if (!response.ok) {
        throw new Error('Failed to fetch conversion rate');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

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
        error: null
      });
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      setConversionRate(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch rate'
      }));
    }
  };

  const router = useRouter();

  const handleSwap = () => {
    router.push(`/swap-typeform/progress?direction=${encodeURIComponent(swapForm.direction)}`);
  };


  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const isEthToXlm = swapForm.direction === 'ETH → XLM';

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'connect':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ethereum Wallet */}
            <div className="p-6 rounded-lg border-2 border-white/20 bg-white/5 text-center text-white/80 space-y-4">
              <h3 className="text-xl font-bold">Ethereum Wallet</h3>
              {swapForm.ethAddress ? (
                <p className="font-mono break-all text-sm">{swapForm.ethAddress}</p>
              ) : (
                <InterstellarButton onClick={async () => {
                  if ((window as any).ethereum) {
                    try {
                      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
                      setSwapForm(prev => ({ ...prev, ethAddress: accounts[0] }));
                    } catch (err) {
                      console.error(err);
                    }
                  } else {
                    alert('MetaMask not detected');
                  }
                }}>Connect Metamask</InterstellarButton>
              )}
            </div>
            {/* Stellar Wallet */}
            <div className="p-6 rounded-lg border-2 border-white/20 bg-white/5 text-center text-white/80 space-y-4">
              <h3 className="text-xl font-bold">Stellar Wallet</h3>
              {swapForm.walletAddress ? (
                <p className="font-mono break-all text-sm">{swapForm.walletAddress}</p>
              ) : (
                <InterstellarButton onClick={async () => {
                  try {
                    const { connect: connectStellar, getPublicKey } = await import('../lib/stellar-wallets-kit');
                    await connectStellar();
                    const pk = await getPublicKey();
                    if (pk) setSwapForm(prev => ({ ...prev, walletAddress: pk }));
                  } catch (err) {
                    console.error(err);
                  }
                }}>Connect Freighter</InterstellarButton>
              )}
            </div>
          </div>
        );
      case 'direction':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleInputChange(option)}
                className={`
                  p-6 rounded-lg border-2 transition-all duration-300
                  ${swapForm.direction === option
                    ? 'border-white/50 bg-white/10 text-white'
                    : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10'
                  }
                `}
              >
                <div className="text-xl font-bold mb-2">{option}</div>
                <div className="text-sm opacity-70">
                  {option === 'ETH → XLM' ? 'Ethereum to Stellar' : 'Stellar to Ethereum'}
                </div>
              </button>
            ))}
          </div>
        );
      case 'asset':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => (isEthToXlm ? option === 'ETH' : option === 'XLM') ? handleInputChange(option) : null}
                disabled={isEthToXlm ? option !== 'ETH' : option !== 'XLM'}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-300
                  ${(isEthToXlm ? option === 'ETH' : option === 'XLM')
                    ? swapForm.fromAsset === option
                      ? 'border-white/50 bg-white/10 text-white'
                      : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10'
                    : 'border-white/10 bg-white/5 text-white/30 cursor-not-allowed opacity-50'
                  }
                `}
              >
                <div className="text-lg font-bold mb-1">{option}</div>
                <div className="text-xs opacity-70">
                  {option === 'ETH' ? 'Available' : 'Coming Soon'}
                </div>
              </button>
            ))}
          </div>
        );

      case 'amount':
        return (
          <div className="max-w-md mx-auto">
            <input
              type="number"
              placeholder={isEthToXlm ? 'ETH amount' : 'XLM amount'}
              value={swapForm.fromAmount}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full px-6 py-3 text-xl text-center bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 font-mono focus:outline-none focus:border-white/50 transition-colors"
            />
          </div>
        );

      case 'slippage':
        return null; // Slippage step removed

      case 'wallet':
        return (
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="G..."
              value={swapForm.walletAddress}
              onChange={(e) => {
                console.log('Wallet input change:', e.target.value);
                setSwapForm(prev => ({
                  ...prev,
                  walletAddress: e.target.value
                }));
              }}
              className="w-full px-6 py-3 text-base text-center bg-black/40 border border-white/50 rounded-lg text-white placeholder-white/50 font-mono focus:outline-none focus:border-white/70 focus:bg-black/60 transition-colors"
            />
          </div>
        );

      case 'confirm':
        return (
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-white/10 border border-white/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/70 text-sm">Direction:</span>
                <span className="text-white font-mono text-sm">{swapForm.direction}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/70 text-sm">From:</span>
                <span className="text-white font-mono text-sm">{swapForm.fromAmount} {swapForm.fromAsset}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/70 text-sm">To:</span>
                <span className="text-white font-mono text-sm">
                  {conversionRate.loading ? 'Loading...' : conversionRate.toAmount ? `${conversionRate.toAmount} ${isEthToXlm ? 'XLM' : 'ETH'}` : '~0'}
                </span>
              </div>
              {conversionRate.rate && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/70 text-sm">Rate:</span>
                  <span className="text-white font-mono text-sm">
                    {isEthToXlm ? `1 ETH = ${conversionRate.rate} XLM` : `1 XLM = ${conversionRate.rate} ETH`}
                  </span>
                </div>
              )}
              {conversionRate.ethPriceUSD && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/70 text-sm">ETH Price:</span>
                  <span className="text-white font-mono text-sm">${conversionRate.ethPriceUSD}</span>
                </div>
              )}
              {conversionRate.xlmPriceUSD && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/70 text-sm">XLM Price:</span>
                  <span className="text-white font-mono text-sm">${conversionRate.xlmPriceUSD}</span>
                </div>
              )}
              {conversionRate.gasEstimate && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/70 text-sm">Gas:</span>
                  <span className="text-white font-mono text-sm">~{conversionRate.gasEstimate} ETH</span>
                </div>
              )}
              {conversionRate.error && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-red-400 text-sm">Error:</span>
                  <span className="text-red-300 font-mono text-xs">{conversionRate.error}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/70 text-sm">Network:</span>
                <span className="text-white font-mono text-sm">{isEthToXlm ? 'Ethereum → Stellar' : 'Stellar → Ethereum'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Wallet:</span>
                <span className="text-white font-mono text-xs">{swapForm.walletAddress.slice(0, 8)}...{swapForm.walletAddress.slice(-8)}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#000913] relative overflow-hidden">
      {/* Interactive Background */}
      <InteractiveBalls />
      
      {/* Glassmorphism Overlay */}
      <div className="fixed inset-0 backdrop-blur-[100px] pointer-events-none" />

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 h-screen flex items-center justify-center p-4"
      >
        <div className="max-w-4xl w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10
        shadow-[0_0_50px_-12px] shadow-[#45B7D1]/20">
          {/* Progress Bar */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-1 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-t-3xl"
          />

          <div className="p-8 space-y-8">
            {/* Question Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
              from-white to-[#45B7D1] font-['Cyberway'] text-center"
            >
              {currentQuestion.title}
            </motion.h1>

            {/* Question Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {renderQuestion()}
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8">
              {currentStep > 0 && (
                <motion.button
                  whileHover={{ x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className="px-6 py-3 text-[#45B7D1] hover:text-white transition-colors 
                  font-['Cyberway'] flex items-center gap-2"
                >
                  ← Back
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={currentStep < questions.length - 1 ? handleNext : handleSwap}
                className="px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-xl
                font-['Cyberway'] text-white shadow-lg shadow-[#4ECDC4]/20 
                hover:shadow-[#4ECDC4]/40 transition-all duration-300"
              >
                {currentStep < questions.length - 1 ? 'Continue' : 'Execute Swap'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}