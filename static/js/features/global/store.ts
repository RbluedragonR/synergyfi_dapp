import { IGlobalConfig, IGlobalConfigStorage } from '@/types/global';
import { useMemo } from 'react';
import { create } from 'zustand';

interface ConfigState {
  configTemp: IGlobalConfigStorage; // Replace 'any' with the appropriate type if known
  setConfigTemp: (config: IGlobalConfigStorage) => void; // Replace 'any' with the appropriate type if known
}

export const useConfigStore = create<ConfigState>((set) => ({
  configTemp: {},
  setConfigTemp: (config) => set(() => ({ configTemp: config })),
}));

export const useConfigStoreWithChainId = (
  chainId: number | undefined,
): {
  configTemByChain: IGlobalConfig;
  setConfigTempByChainId: (config: IGlobalConfig) => void;
} => {
  const { configTemp, setConfigTemp } = useConfigStore();

  const configTemByChain = useMemo(() => {
    return (chainId ? configTemp[chainId] || {} : {}) as IGlobalConfig;
  }, [chainId, configTemp]);

  const setConfigTempByChainId = (config: IGlobalConfig) => {
    chainId &&
      setConfigTemp({
        ...configTemp,
        [chainId]: config,
      });
  };

  return {
    configTemByChain,
    setConfigTempByChainId,
  };
};
