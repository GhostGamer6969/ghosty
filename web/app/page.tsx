'use client';

import { useState, useRef, useEffect } from 'react';
import { Keypair } from '@stellar/stellar-sdk';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStellarAccount } from './hooks/useStellarAccount';
// import { useStarfield } from './starfield/ClientStarfieldProvider';
import ThreeScene from './components/ThreeScene';
import InterstellarButton from './components/InterstellarButton';
import SpaceBackground from './components/SpaceBackground';
import GlowingText from './components/GlowingText';
import CustomCursor from './components/CustomCursor';

interface WalletInfo {
  publicKey: string;
  privateKey: string;
  isFunded: boolean;
  isDeployed: boolean;
  balance?: string;
}

export default function Home() {
  const router = useRouter();
  // const starfield = useStarfield();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { createAccountWithFriendbot } = useStellarAccount();

  const createWallet = () => {
    const keypair = Keypair.random();
    setWallet({
      publicKey: keypair.publicKey(),
      privateKey: keypair.secret(),
      isFunded: false,
      isDeployed: false,
    });
  };

  const fundWallet = async () => {
    if (!wallet) return;

    setIsLoading(true);
    try {
      const keypair = Keypair.fromSecret(wallet.privateKey);
      const result = await createAccountWithFriendbot(keypair);

      if (result.success) {
        setWallet(prev => prev ? {
          ...prev,
          isFunded: true,
          balance: '10000.0000000' // Friendbot funds with 10,000 XLM
        } : null);
      }
    } catch (error) {
      console.error('Funding failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deployWallet = async () => {
    if (!wallet || !wallet.isFunded) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setWallet(prev => prev ? { ...prev, isDeployed: true } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunch = async () => {
    // await starfield.rush({ to: 26, hold: 200, idle: 1.4 });
    router.push('/swap-typeform');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#000913]">
      <CustomCursor />
      {/* 3D Background */}
      <ThreeScene
        onReachedEdge={() => {
          console.log('Model reached edge of screen');
          // Handle edge reached event
        }}
      />
      <SpaceBackground />

      {/* Content Overlay */}

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center space-y-8">
            <GlowingText className="text-9xl font-extrabold tracking-tighter bg-clip-text text-transparent
            bg-gradient-to-r from-blue-500 via-white to-blue-500">
              Supernova
            </GlowingText>
            <p className="text-l text-blue-400/70 font-mono tracking-widest">
              NEXT-GEN CRYPTO ECOSYSTEM
            </p>

            {/* Updated Launch Button with rush effect */}
            <div className="mt-12">
              <button
                onClick={handleLaunch}
                className="group relative w-[10] px-8 py-4 bg-gradient-to-r from-blue-600/20 to-blue-400/20
                rounded-xl font-mono text-lg tracking-wider transition-all duration-500
                hover:bg-gradient-to-r hover:from-blue-600/40 hover:to-blue-400/40
                border border-white/10 hover:border-white/20 cursor-crosshair overflow-hidden"
              >
                <span className="relative z-10">Launch DAPP</span>
                <div className="absolute inset-0 -translate-y-full group-hover:translate-y-0
                bg-gradient-to-r from-blue-600/20 to-blue-400/20 transition-transform duration-500"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
