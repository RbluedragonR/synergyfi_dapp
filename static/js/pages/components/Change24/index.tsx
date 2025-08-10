import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import React, { ReactNode, useMemo } from 'react';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useMarketPairInfo } from '@/features/futures/hooks';
import { formatNumber } from '@/utils/numberUtil';

function Change24({
  loadingWrap,
  isMobile,
  chainId,
  priceChange24h,
  instrumentAddr,
  expiry,
}: {
  loadingWrap?: ReactNode;
  isMobile?: boolean;
  chainId: CHAIN_ID | undefined;
  priceChange24h?: WrappedBigNumber;
  instrumentAddr: string | undefined;
  expiry: number | undefined;
}): JSX.Element {
  const marketPairInfo = useMarketPairInfo(chainId, instrumentAddr, expiry, priceChange24h == undefined);
  const change24 = useMemo(() => {
    let change: number | undefined = undefined;

    if (priceChange24h) {
      change = priceChange24h.toNumber();
    }

    if (marketPairInfo?.fairPriceChange24h) {
      change = marketPairInfo?.fairPriceChange24h.toNumber();
    }
    // if (pairStats?.priceChange24h) {
    //   change = WrappedBigNumber.from(pairStats?.priceChange24h || 0).toNumber();
    // }
    // if (pair?.rootInstrument?.isInverse && change) {
    //   change = -change;
    // }
    return change;
  }, [marketPairInfo?.fairPriceChange24h, priceChange24h]);

  const changeDisplay = useMemo(() => {
    return change24 !== undefined ? `${change24 > 0 ? '+' : ''}${formatNumber(change24 * 100, 2)}%` : '';
  }, [change24]);

  return (
    <EmptyDataWrap isLoading={change24 === undefined} loadingWrap={loadingWrap}>
      <span
        className={`change24 ${change24 !== undefined && change24 < 0 ? 'text-danger' : 'text-success'} font-number ${
          isMobile && 'mobile'
        }`}>
        {changeDisplay}
      </span>
    </EmptyDataWrap>
  );
}

export default React.memo(Change24);
