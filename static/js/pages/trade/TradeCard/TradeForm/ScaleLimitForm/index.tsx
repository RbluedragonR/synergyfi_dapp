/**
 * @description Component-ScaleLimitForm
 */
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import './index.less';

import { AvailableBalance } from '@/components/ToolTip/AvailableBalanceToolTip';
import { TRADE_TYPE } from '@/constants/trade';
import { useWrappedPortfolioByPairId } from '@/features/account/portfolioHook';
import { useIsFetchedPairInfo } from '@/features/futures/hooks';
import { useCurrentPairFromUrl, usePairLimitPriceRange } from '@/features/pair/hook';
import { useTradeSide } from '@/features/trade/hooks';
import { useSDK } from '@/features/web3/hook';
import { FC } from 'react';
import TradeFormAlert from '../TradeFormAlert';
import PriceInput from './PriceInput';
import ScaleFormDetail from './ScaleFormDetail';
import ScaleLeverage from './ScaleLeverage';
import ScaleLimitEffect from './ScaleLimitEffect';
import ScaleLimitPreview from './ScaleLimitPreview';
import ScaleSizeDistribution from './ScaleSizeDistribution';
import ScaleSizeInput from './ScaleSizeInput';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const ScaleLimitForm: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const tradeSide = useTradeSide(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const sdkContext = useSDK(chainId);
  const isFetchedPair = useIsFetchedPairInfo(chainId, currentPair?.instrumentAddr, currentPair?.expiry);
  const portfolio = useWrappedPortfolioByPairId(chainId, userAddr, currentPair?.id);
  const [lowerPrice, upperPrice] = usePairLimitPriceRange(currentPair, tradeSide, sdkContext);

  return (
    <div className="syn-scale-limit-form">
      <PriceInput
        currentPair={currentPair}
        sdkContext={sdkContext}
        tradeSide={tradeSide}
        disabled={!isFetchedPair}
        lowerPrice={lowerPrice}
        upperPrice={upperPrice}
      />
      <ScaleSizeInput
        price={currentPair?.fairPrice ? currentPair.wrapAttribute('fairPrice').stringValue : undefined}
        pair={currentPair}
        sdkContext={sdkContext}
      />
      <ScaleSizeDistribution />
      <ScaleLeverage pair={currentPair} />
      <div className="syn-scale-limit-form-base-section">
        <AvailableBalance />
      </div>
      <ScaleFormDetail tradeSide={tradeSide} currentPair={currentPair} />
      <TradeFormAlert
        chainId={chainId}
        marginToken={currentPair?.rootInstrument.marginToken}
        tradeType={TRADE_TYPE.SCALE_LIMIT}
        tradeSimulation={undefined}
      />
      <ScaleLimitEffect
        sdkContext={sdkContext}
        upperPrice={upperPrice}
        lowerPrice={lowerPrice}
        tradeSide={tradeSide}
        portfolio={portfolio}
      />
      <ScaleLimitPreview />
    </div>
  );
};

export default ScaleLimitForm;
