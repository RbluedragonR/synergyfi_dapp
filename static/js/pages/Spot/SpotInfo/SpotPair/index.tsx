/**
 * @description Component-SpotPair
 */
import { TokenInfo } from '@/types/token';
import './index.less';

import TokenLogo from '@/components/TokenLogo';
import { FC } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  baseToken?: TokenInfo;
  quoteToken?: TokenInfo;
  size?: number;
}
const SpotPair: FC<IPropTypes> = function ({ baseToken, quoteToken, size }) {
  return (
    <div className="syn-spot-pair">
      <TokenLogo isSpot={true} chainId={baseToken?.chainId} size={size} token={baseToken} showChainIcon />
      <TokenLogo isSpot={true} chainId={quoteToken?.chainId} size={size} token={quoteToken} showChainIcon />
      {baseToken?.symbol}-{quoteToken?.symbol}
    </div>
  );
};

export default SpotPair;
