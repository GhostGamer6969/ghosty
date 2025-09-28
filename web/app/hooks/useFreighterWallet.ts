import { useState, useEffect, useCallback } from 'react';
import StellarSdk from '@stellar/stellar-sdk';
import { getPublicKey, connect, disconnect } from '../lib/stellar-wallets-kit';

interface FreighterWalletState {
  isConnected: boolean;
  publicKey: string | null;
  balance: string;
  isLoading: boolean;
  error: string | null;
}

interface UseFreighterWalletReturn {
  wallet: FreighterWalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

export const useFreighterWallet = (): UseFreighterWalletReturn => {
  const [wallet, setWallet] = useState<FreighterWalletState>({
    isConnected: false,
    publicKey: null,
    balance: '0',
    isLoading: false,
    error: null,
  });

  // Check if Freighter is available
  const isFreighterAvailable = useCallback(() => {
    return typeof window !== 'undefined' && window.freighterApi;
  }, []);

  // Fetch balance from Stellar network
  const fetchBalance = useCallback(async (publicKey: string) => {
    try {
      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(publicKey);
      
      // Find the native XLM balance
      const xlmBalance = account.balances.find(
        (balance: any) => balance.asset_type === 'native'
      );
      
      return xlmBalance?.balance || '0';
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }, []);

  // Connect to Freighter wallet
  const connectWallet = useCallback(async () => {
    if (!isFreighterAvailable()) {
      setWallet(prev => ({
        ...prev,
        error: 'Freighter wallet not found. Please install Freighter extension.',
        isLoading: false,
      }));
      return;
    }

    setWallet(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Connect using the stellar-wallets-kit
      await connect();
      
      // Get the public key
      const publicKey = await getPublicKey();
      
      if (!publicKey) {
        throw new Error('Failed to get public key from Freighter');
      }

      // Fetch the balance
      const balance = await fetchBalance(publicKey);

      setWallet({
        isConnected: true,
        publicKey,
        balance,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error connecting to Freighter:', error);
      setWallet(prev => ({
        ...prev,
        isConnected: false,
        publicKey: null,
        balance: '0',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Freighter',
      }));
    }
  }, [isFreighterAvailable, fetchBalance]);

  // Disconnect from Freighter wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      setWallet({
        isConnected: false,
        publicKey: null,
        balance: '0',
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error disconnecting from Freighter:', error);
    }
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!wallet.publicKey) return;

    setWallet(prev => ({ ...prev, isLoading: true }));

    try {
      const balance = await fetchBalance(wallet.publicKey);
      setWallet(prev => ({
        ...prev,
        balance,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error refreshing balance:', error);
      setWallet(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh balance',
      }));
    }
  }, [wallet.publicKey, fetchBalance]);

  // Auto-refresh balance every 30 seconds when connected
  useEffect(() => {
    if (!wallet.isConnected) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [wallet.isConnected, refreshBalance]);

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (!isFreighterAvailable()) return;

      try {
        const isConnected = await window.freighterApi.isConnected();
        if (isConnected) {
          const publicKey = await getPublicKey();
          if (publicKey) {
            const balance = await fetchBalance(publicKey);
            setWallet({
              isConnected: true,
              publicKey,
              balance,
              isLoading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    };

    checkExistingConnection();
  }, [isFreighterAvailable, fetchBalance]);

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };
};
