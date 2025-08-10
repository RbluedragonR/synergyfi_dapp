import { useSDK } from '@/features/web3/hook';
import { useEffect, useState } from 'react';
import { useChainId, useUserAddr } from '../web3/useChain';

export default function useIsBlacklisted(): {
  isBlacklisted: boolean;
} {
  const chainId = useChainId();
  const userAddress = useUserAddr();
  const sdk = useSDK(chainId);
  const [isBlacklisted, setIsBlacklisted] = useState<boolean>(false);
  useEffect(() => {
    const fetchIsBlacklisted = async () => {
      if (sdk && userAddress) {
        const isBlacklistedFromSdk = await sdk.perp.contracts.gate.isBlacklisted(userAddress);
        setIsBlacklisted(isBlacklistedFromSdk);
      }
    };
    fetchIsBlacklisted();
  }, [sdk, sdk?.perp?.contracts?.gate, userAddress]);

  return { isBlacklisted };
}
