import { WrappedVault } from '@/entities/WrappedVault';

export const getVaultRowKey = (vault: WrappedVault) => `${vault.quoteToken.address}-${vault.vaultAddress}`;
