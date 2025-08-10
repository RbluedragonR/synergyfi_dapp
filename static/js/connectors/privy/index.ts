import { getDefaultChainId } from '@/utils/chain';
import { PrivyClientConfig } from '@privy-io/react-auth';
import { arbitrum, base, blast, blastSepolia, linea } from 'viem/chains';

const defaultChainId = getDefaultChainId();

export const privyConfig: PrivyClientConfig = {
  // Display email and wallet as login methods
  loginMethods: ['email', 'sms', 'google', 'twitter', 'discord', 'farcaster', 'github'],
  // Customize Privy's appearance in your app
  appearance: {
    theme: 'light',
    accentColor: '#00bfbf',
    logo: 'https://api.synfutures.com/ipfs/logo/logo-svg/logo_light.svg',
  },
  // Create embedded wallets for users who don't have a wallet
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
  supportedChains: [blast, base, blastSepolia, linea, arbitrum],
  defaultChain: defaultChainId === base.id ? base : blast,
};

export const privyAppId = process.env.REACT_APP_PRIVY_APP_ID || 'clz2gl5r702phkqjy3zhlalh9';
