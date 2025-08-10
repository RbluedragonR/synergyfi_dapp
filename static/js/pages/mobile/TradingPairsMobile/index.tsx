/**
 * @description Component-TradingPairsMobile
 */
import './index.less';

import Empty from '@/components/Empty';
import TokenPair from '@/components/TokenPair';
import { TVL_THRESHHOLD } from '@/constants/global';
import { useMarginSearch, useMarketList } from '@/features/market/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import OysterAmm from '@/pages/components/OysterAmm';
import { PAIR_DATE_TYPE } from '@/types/global';
import _ from 'lodash';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import BlockedAlert from '@/components/Alert/BlockedAlert';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { useMockDevTool } from '@/components/Mock';
import TVLWarningIcon from '@/components/TVLWarningIcon';
import { getChainShortName } from '@/utils/chain';
import { getMarginTypeByFeeder } from '@/utils/pairs';
import { PERP_EXPIRY } from '@synfutures/sdks-perp';
import { useLocalStorageState } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import MarginTypeSelector from './MarginTypeSelector';
import TradingPairSkeleton from './TradingPairSkeleton';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TradingPairsMobile: FC<IPropTypes> = function () {
  const chainId = useChainId();
  const { t } = useTranslation();
  const { marketPairList, isFetched } = useMarketList(chainId ? [chainId] : undefined, true);
  const navigate = useNavigate();
  const { pairTypeForMobile: pairType } = useMarginSearch();
  // const dispatch = useAppDispatch();
  const { isMockSkeleton } = useMockDevTool();
  const [lastFutures] = useLocalStorageState('last_futures', { defaultValue: 'trade', listenStorageChange: true });

  const filteredPairs = useMemo(() => {
    if (!marketPairList) return [];
    let pairsFiltered = marketPairList;
    if (pairType) {
      switch (pairType) {
        case PAIR_DATE_TYPE.PERPETUAL:
          pairsFiltered = marketPairList.filter((pair) => pair.expiry === PERP_EXPIRY);
          break;
        case PAIR_DATE_TYPE.DATED:
          pairsFiltered = marketPairList.filter((pair) => pair.expiry !== PERP_EXPIRY);
          break;
        default:
          pairsFiltered = marketPairList.filter((pair) => getMarginTypeByFeeder(pair.feederType) === pairType);
          break;
      }
    }
    return _.orderBy(
      pairsFiltered.filter((p) => p.tvlUsd.gte(TVL_THRESHHOLD)),
      [(p) => p?.volume24hUsd?.toNumber()],
      ['desc'],
    );
  }, [marketPairList, pairType]);

  // useEffect(() => {
  //   if (marketPairList?.length && chainId) {
  //     const fetchPairs = () => {
  //       const params: FetchInstrumentParam[] = marketPairList.reduce((acc: FetchInstrumentParam[], pair) => {
  //         const accI = acc.find((p) => p.instrument === pair.instrumentAddress);
  //         if (!accI) {
  //           acc.push({ instrument: pair.instrumentAddress, expiries: [pair.expiry] });
  //         } else {
  //           accI.expiries.push(pair.expiry);
  //         }
  //         return acc;
  //       }, []);
  //       // dispatch(batchPairsFromChain({ chainId, params: params }));
  //     };

  //     fetchPairs();
  //     const intervalId = pollingFunc(fetchPairs, POLLING_ORDER_BOOK);

  //     return () => intervalId && clearInterval(intervalId); // Cleanup on unmount
  //   }
  // }, [marketPairList?.length, chainId]);

  return (
    <div className="syn-trading-pairs-mobile">
      <BlockedAlert
        style={{
          margin: '12px 16px 0 16px',
        }}
      />
      <div className="syn-trading-pairs-mobile-header">
        <div className="syn-trading-pairs-mobile-header-item">
          <MarginTypeSelector />
        </div>
        <div className="syn-trading-pairs-mobile-header-item">{t('mobile.price')}</div>
        <div className="syn-trading-pairs-mobile-header-item">{t('mobile.tvlApy')}</div>
      </div>
      {isFetched && filteredPairs.length === 0 && <Empty type="vertical" />}
      <div className="syn-trading-pairs-mobile-container syn-scrollbar">
        {(!isFetched || isMockSkeleton) && <TradingPairSkeleton />}
        {/* {!isMockSkeleton && pairStatus !== FETCHING_STATUS.FETCHING && filteredPairs.length > 0 && ( */}
        {!isMockSkeleton && filteredPairs.length > 0 && (
          <>
            {filteredPairs.map((pair) => (
              <div
                onClick={() => {
                  const routeRoot = lastFutures === 'earn' ? '/earn' : `/trade`;
                  navigate(`${routeRoot}/${getChainShortName(pair.chainId)}/${pair.pairSymbol}`);
                }}
                key={pair.id}
                className="syn-trading-pairs-mobile-item">
                <TokenPair
                  tokenSize={32}
                  baseToken={pair?.baseToken}
                  quoteToken={pair?.quoteToken}
                  isInverse={pair?.isInverse || false}
                  expiry={pair?.expiry}
                  showShortPerp={true}
                  showOracle={true}
                  marketType={pair?.marketType}
                  verticalMode
                  showLeverage
                  leverage={pair?.maxLeverage}
                  isMobile
                />
                <div key={pair.id} className="syn-trading-pairs-mobile-item-price">
                  {pair.fairPrice.formatPriceNumberWithTooltip()}
                  <div className="sub">
                    <EmptyDataWrap isLoading={!pair.fairPriceChange24h}>
                      {pair.fairPriceChange24h.formatPercentage({ requirePlusSymbol: true })}
                    </EmptyDataWrap>
                  </div>
                </div>
                <div className="syn-trading-pairs-mobile-item-change">
                  <div className="syn-trading-pairs-mobile-item-change-top">
                    <TVLWarningIcon tvl={pair.tvlUsd} />
                    {pair.tvlUsd.formatNumberWithTooltip({ isShowTBMK: true, prefix: '$' })}
                  </div>
                  <div className="sub">{pair?.liquidityApy?.formatPercentage({ colorShader: false })} </div>
                </div>
              </div>
            ))}
            <div className="syn-trading-pairs-mobile-amm-wrapper">
              <OysterAmm />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TradingPairsMobile;
