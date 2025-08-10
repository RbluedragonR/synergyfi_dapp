/**
 * @description Component-TradeMobile
 */
import './index.less';

import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import SubPageWrap from '@/components/SubPage';
import { MOBILE_SHOW_CHART } from '@/constants/storage';
import { useCurrentPairBaseInfoFromUrl, useCurrentPairFromUrl } from '@/features/pair/hook';
import { resetFormByChainId, setTradeFormType } from '@/features/trade/actions';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import BlockNumberTextMobile from '@/components/Text/BlockNumberText/BlockNumberTextMobile';
import { PAIR_PAGE_TYPE, TVL_THRESHHOLD } from '@/constants/global';
import { TRADE_TYPE } from '@/constants/trade';
import { useMarketList } from '@/features/market/hooks';
import { usePollingSingleInstrumentDataOnTradeOrEarn } from '@/hooks/data/usePollingDataOnWorker';
import { usePairCheck } from '@/pages/components/PairInfo/pairCheckHook';
import _ from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import MobileBanner from '../components/MobileBanner';
import MobileProfile from '../components/MobileProfile';
import MobileSubPageHeader from '../components/MobileSubpageHeader';
import TradeMobileOrdersTrade from './TradeMobileOrdersTrade';
import TradeMobileTradingView from './TradeMobileTradingView';
interface IPropTypes {
  className?: string;
}
const TradeMobile: FC<IPropTypes> = function () {
  const [showChart, setShowChart] = useState(false);
  const chainId = useChainId();
  const dispatch = useAppDispatch();
  const userAddr = useUserAddr();
  const { marketPairList, isFetched } = useMarketList(chainId ? [chainId] : undefined);
  const navigate = useNavigate();
  const currentPair = useCurrentPairFromUrl(chainId);

  const { pairSymbol: symbolFromUrl } = useParams();
  const marketPairListOrdered = useMemo(
    () =>
      _.orderBy(
        marketPairList.filter((p) => p.tvlUsd.gte(TVL_THRESHHOLD)),
        [(p) => p?.volume24hUsd?.toNumber()],
        ['desc'],
      ),
    [marketPairList],
  );
  const currentBaseInfo = useCurrentPairBaseInfoFromUrl(chainId);
  // const pairFetchingStatus = usePairFetchingStatus(chainId, currentBaseInfo?.id);

  usePollingSingleInstrumentDataOnTradeOrEarn(
    chainId,
    userAddr,
    currentBaseInfo?.instrumentAddr,
    currentBaseInfo?.expiry,
  );
  const resetCurrentPair = useCallback(() => {
    chainId && dispatch(resetFormByChainId({ chainId }));
    navigate('/market');
  }, [chainId, dispatch, navigate]);
  usePairCheck(
    chainId,
    currentPair?.symbol,
    marketPairListOrdered.map((p) => p.pairSymbol),
    PAIR_PAGE_TYPE.TRADE,
    false,
  );
  useEffect(() => {
    chainId && !currentPair && dispatch(resetFormByChainId({ chainId }));
  }, [chainId, dispatch, currentPair]);

  useEffect(() => {
    setTimeout(() => {
      if (localStorage.getItem(MOBILE_SHOW_CHART)) {
        setShowChart(true);
      }
    }, 1000);
  }, []);
  useEffect(() => {
    if (
      isFetched &&
      symbolFromUrl &&
      currentBaseInfo?.symbol?.toLocaleLowerCase() !== symbolFromUrl.toLocaleLowerCase()
    ) {
      const pair = marketPairList.find((p) => p.pairSymbol.toLowerCase() === symbolFromUrl.toLowerCase());
      if (pair) {
        chainId && dispatch(setTradeFormType({ chainId, tradeType: TRADE_TYPE.MARKET }));
      }
    }
    // only these three
  }, [isFetched, symbolFromUrl, currentBaseInfo?.symbol]);

  return (
    <SubPageWrap
      className="syn-trade-mobile"
      isShowSubPage={true}
      noFooterPadding
      isOverflowAuto
      footer={<BlockNumberTextMobile />}
      header={
        <MobileSubPageHeader
          closeDetail={() => {
            resetCurrentPair();
          }}
          showChart={showChart}
          toggleShowChart={() => {
            if (showChart) {
              localStorage.setItem(MOBILE_SHOW_CHART, '');
            } else {
              localStorage.setItem(MOBILE_SHOW_CHART, 'true');
            }
            setShowChart(!showChart);
          }}
        />
      }
      onClose={() => {
        resetCurrentPair();
      }}>
      <MobileBanner />
      <div className="syn-trade-mobile-content">
        {showChart && <TradeMobileTradingView />}
        {
          <>
            <TradeMobileOrdersTrade />
            <MobileProfile />
          </>
        }
      </div>
    </SubPageWrap>
  );
};

export default TradeMobile;
