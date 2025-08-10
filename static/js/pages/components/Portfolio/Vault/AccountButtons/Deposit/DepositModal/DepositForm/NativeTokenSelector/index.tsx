/**
 * @description Component-NativeTokenSelector
 */
import './index.less';

import { FC, useEffect, useMemo, useState } from 'react';

import Tabs from '@/components/Tabs';
import TokenLogo from '@/components/TokenLogo';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useNativeToken, useWrappedNativeToken } from '@/features/chain/hook';
import { useChainId } from '@/hooks/web3/useChain';
interface IPropTypes {
  className?: string;
  onSideChange: (addr: string) => void;
  tokenBalance: WrappedBigNumber;
}
const NativeTokenSelector: FC<IPropTypes> = function ({ onSideChange, tokenBalance }) {
  const chainId = useChainId();
  const nativeToken = useNativeToken(chainId);
  const wrappedNativeToken = useWrappedNativeToken(chainId);
  const [tokenAddr, setTokenAddr] = useState(
    nativeToken && tokenBalance.eq(0) ? nativeToken.address : wrappedNativeToken?.address,
  );

  const tabList = useMemo(() => {
    return nativeToken && wrappedNativeToken
      ? [
          {
            key: nativeToken.address.toLowerCase(),
            value: nativeToken.address.toLowerCase(),
            label: (
              <>
                <TokenLogo token={nativeToken} size={16} />
                {nativeToken?.symbol}{' '}
              </>
            ),
          },
          {
            key: wrappedNativeToken.address.toLowerCase(),
            value: wrappedNativeToken.address.toLowerCase(),
            label: (
              <>
                <TokenLogo token={wrappedNativeToken} size={16} />
                {wrappedNativeToken?.symbol}{' '}
              </>
            ),
          },
        ]
      : [];
  }, [nativeToken, wrappedNativeToken]);
  useEffect(() => {
    if (nativeToken && tokenBalance.eq(0)) {
      setTokenAddr(nativeToken?.address.toLowerCase());
      onSideChange(nativeToken?.address.toLowerCase());
    }
    // no dep
  }, []);

  if (!nativeToken || !wrappedNativeToken) {
    return <></>;
  }
  return (
    <div className="syn-native-token-selector">
      <Tabs
        className="syn-native-token-selector-tabs"
        showSegment={true}
        onClick={(key) => {
          setTokenAddr(key);
          onSideChange(key);
        }}
        value={tokenAddr || ''}
        tabList={tabList}
      />
    </div>
  );
};

export default NativeTokenSelector;
