declare global {
  interface Window {
    freighterApi: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      signTransaction: (transaction: string) => Promise<string>;
      signAuthEntry: (entry: string) => Promise<string>;
    };
  }
}

export {};
