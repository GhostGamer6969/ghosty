'use client';

import { useState, useRef, useEffect } from 'react';
import { Keypair } from '@stellar/stellar-sdk';
import Link from 'next/link';
import { useStellarAccount } from './hooks/useStellarAccount';
import ThreeScene from './components/ThreeScene';
import Navbar from './components/Navbar';
import InterstellarButton from './components/InterstellarButton';
import SpaceBackground from './components/SpaceBackground';
import StarField from './components/StarField';
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#000913]">
      <CustomCursor />
      {/* 3D Background */}
      <ThreeScene />
      <SpaceBackground />
      <StarField />
      
      {/* Updated Docs Button */}
      <div className="fixed top-6 right-6 z-50">
        <a
          href="https://github.com/GhostGamer6969/ghosty"
          target="_blank"
          rel="noopener noreferrer"
          className="group px-6 py-2 bg-white/5 backdrop-blur-md rounded-lg font-mono text-sm tracking-wider 
          transition-all duration-300 border border-white/10 hover:border-white/20
          hover:bg-white/10 cursor-crosshair flex items-center gap-2"
        >
          <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span className="relative">
            Docs
            <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/50 to-transparent 
            transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
          </span>
        </a>
      </div>
      
      {/* Navbar */}
      <Navbar />
      
      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center space-y-8">
            <GlowingText className="text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent 
            bg-gradient-to-r from-blue-500 via-white to-blue-500">
              GHOSTY
            </GlowingText>
            <p className="text-xl text-blue-400/70 font-mono tracking-widest">
              NEXT-GEN CRYPTO ECOSYSTEM
            </p>
            
            {/* Updated Wallet Interface */}
            <div className="mt-12 backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 
            shadow-[0_0_50px_-12px] shadow-blue-500/10">
              {!wallet ? (
                <button
                  onClick={createWallet}
                  className="group relative w-full px-8 py-4 bg-gradient-to-r from-blue-600/20 to-blue-400/20 
                  rounded-xl font-mono text-lg tracking-wider transition-all duration-500 
                  hover:bg-gradient-to-r hover:from-blue-600/40 hover:to-blue-400/40 
                  border border-white/10 hover:border-white/20 cursor-crosshair overflow-hidden"
                >
                  <span className="relative z-10">INITIALIZE WALLET</span>
                  <div className="absolute inset-0 -translate-y-full group-hover:translate-y-0 
                  bg-gradient-to-r from-blue-600/20 to-blue-400/20 transition-transform duration-500"></div>
                </button>
              ) : (
                <div className="space-y-6">
                  {/* Wallet Info Cards */}
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 
                  hover:border-white/20 transition-all duration-300 group cursor-default">
                    <span className="text-blue-400 font-mono text-xs tracking-wider">PUBLIC KEY</span>
                    <div className="mt-2 text-sm font-mono tracking-wide text-white/80 break-all 
                    group-hover:text-white transition-colors duration-300">{wallet.publicKey}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 
                  hover:border-white/20 transition-all duration-300 group cursor-default">
                    <span className="text-blue-400 font-mono text-xs tracking-wider">PRIVATE KEY</span>
                    <div className="mt-2 text-sm font-mono tracking-wide text-white/80 break-all 
                    group-hover:text-white transition-colors duration-300">{wallet.privateKey}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 
                  hover:border-white/20 transition-all duration-300 group cursor-default">
                    <span className="text-blue-400 font-mono text-xs tracking-wider">BALANCE</span>
                    <div className="mt-2 text-2xl font-mono tracking-wide text-white">
                      {wallet.balance ?? '0'} <span className="text-sm text-purple-400">XLM</span>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  {!wallet.isFunded ? (
                    <button 
                      onClick={fundWallet}
                      disabled={isLoading}
                      className="group relative w-full px-8 py-4 bg-gradient-to-r from-blue-600/20 to-blue-400/20 
                      rounded-xl font-mono text-lg tracking-wider transition-all duration-500 
                      hover:bg-gradient-to-r hover:from-blue-600/40 hover:to-blue-400/40 
                      disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 
                      hover:border-white/20 cursor-crosshair overflow-hidden"
                    >
                      <span className="relative z-10">{isLoading ? 'PROCESSING...' : 'FUND WALLET'}</span>
                      <div className="absolute inset-0 -translate-y-full group-hover:translate-y-0 
                      bg-gradient-to-r from-blue-600/20 to-blue-400/20 transition-transform duration-500"></div>
                    </button>
                  ) : (
                    <button 
                      onClick={deployWallet}
                      disabled={isLoading || wallet.isDeployed}
                      className="group relative w-full px-8 py-4 bg-gradient-to-r from-blue-600/20 to-blue-400/20 
                      rounded-xl font-mono text-lg tracking-wider transition-all duration-500 
                      hover:bg-gradient-to-r hover:from-blue-600/40 hover:to-blue-400/40 
                      disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 
                      hover:border-white/20 cursor-crosshair overflow-hidden"
                    >
                      <span className="relative z-10">{wallet.isDeployed ? 'DEPLOYMENT COMPLETE' : isLoading ? 'DEPLOYING...' : 'DEPLOY WALLET'}</span>
                      <div className="absolute inset-0 -translate-y-full group-hover:translate-y-0 
                      bg-gradient-to-r from-blue-600/20 to-blue-400/20 transition-transform duration-500"></div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Launch Button */}
            {wallet?.isDeployed && (
              <div className="text-center mt-8">
                <Link href="/swap-typeform">
                  <button className="group relative px-16 py-4 bg-gradient-to-r from-blue-500/20 to-blue-300/20 
                  rounded-xl font-mono text-lg tracking-wider transition-all duration-500 
                  hover:bg-gradient-to-r hover:from-blue-500/40 hover:to-blue-300/40 
                  border border-white/10 hover:border-white/20 cursor-crosshair overflow-hidden">
                    <span className="relative z-10">LAUNCH APP</span>
                    <div className="absolute inset-0 -translate-y-full group-hover:translate-y-0 
                    bg-gradient-to-r from-blue-500/20 to-blue-300/20 transition-transform duration-500"></div>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Updated Floating Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
