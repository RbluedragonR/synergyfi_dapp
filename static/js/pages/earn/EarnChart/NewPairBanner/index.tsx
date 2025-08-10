/**
 * @description Component-NewPairBanner
 */
import './index.less';

import { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useSDK } from '@/features/web3/hook';
import { useChainId } from '@/hooks/web3/useChain';
import { CreativePair } from '@/types/pair';

import LiqIcon from './assets/icon_mj_liq.png';
interface IPropTypes {
  className?: string;
  pair: CreativePair;
}
const NewPairBanner: FC<IPropTypes> = function ({ pair }) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const sdkContext = useSDK(chainId);
  const [price, setPrice] = useState<WrappedBigNumber>();
  const getPrice = useCallback(async () => {
    try {
      const price = await sdkContext?.perp?.observer?.getRawSpotPrice({
        baseSymbol: pair.rootInstrument.baseToken,
        quoteSymbol: pair.rootInstrument.quoteToken,
        marketType: pair.rootInstrument.marketType,
      });

      // setPrice(getAdjustTradePrice(WrappedBigNumber.from(price || 0), pair.rootInstrument.isInverse || false));
      setPrice(WrappedBigNumber.from(price || 0));
    } catch (error) {
      console.log('🚀 ~ file: index.tsx:35 ~ getPrice ~ error:', error);
    }
  }, [pair, sdkContext]);
  useEffect(() => {
    getPrice();
  }, [pair]);
  return (
    <div className="syn-new-pair-banner">
      <img src={LiqIcon} />
      <div className="syn-new-pair-banner-content">
        <div className="syn-new-pair-banner-content-title">{t('common.earn.pairBannerTitle')}</div>
        <div className="syn-new-pair-banner-content-subTitle">
          {t('common.earn.pairBannerSubTitle')}
          <span className="syn-new-pair-banner-content-subTitle-price">{price?.formatPriceNumberWithTooltip()}</span>
        </div>
      </div>
    </div>
  );
};

export default NewPairBanner;
