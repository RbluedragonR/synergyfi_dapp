/**
 * @description Component-trade
 */
import React, { FC, useEffect, useMemo } from 'react';
import '../earn/index.less';
import './index.less';

import { resetFormByChainId } from '@/features/trade/actions';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import BlockedAlert from '@/components/Alert/BlockedAlert';
import TradeYourOwnRiskAlert from '@/components/Alert/TradeYourOwnRiskAlert';
import { useMockDevTool } from '@/components/Mock';
import { PAIR_PAGE_TYPE } from '@/constants/global';
import { WrappedPair } from '@/entities/WrappedPair';
import { useMainPosition } from '@/features/account/positionHook';
import { useBackendChainConfig } from '@/features/config/hook';
import { useRemoveLiquidationSimulation } from '@/features/earn/hook';
import { useIsFetchedPairInfo } from '@/features/futures/hooks';
import { useCurrentMarketType } from '@/features/global/hooks';
import { useCurrentPairBaseInfoFromUrl, useCurrentPairFromUrl } from '@/features/pair/hook';
import { useIsFetchedSinglePortfolio } from '@/features/portfolio/hook';
import { useCrossMarketSimulation, useMarketSimulation } from '@/features/trade/hooks';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import { useLocalStorageState } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import PairInfo from '../components/PairInfo';
import ConnectWalletCard from '../components/WalletStatus/ConnectWalletCard';
import EarnCard from '../earn/EarnCard';
import EarnChart from '../earn/EarnChart';
import CoinPriceChart from './CoinPriceChart';
import TradeCard from './TradeCard';
import TradePortfolio from './TradePortfolio';
import { TradePositionCard } from './TradePortfolio/TradePosition';
import TradePositionSkeleton from './TradePortfolio/TradePosition/TradePositionSkeleton';

interface IPropTypes {
  children?: React.ReactNode;
}
const Trade: FC<IPropTypes> = function ({}) {
  const dispatch = useAppDispatch();
  const chainId = useChainId();

  const [, setLastFuturesToStorage] = useLocalStorageState('last_futures', {
    listenStorageChange: true,
  });
  const pairPageType = useCurrentMarketType();
  // clear form when change page
  useEffect(() => {
    return () => {
      chainId && dispatch(resetFormByChainId({ chainId }));
    };
  }, [chainId, dispatch]);

  useEffect(() => {
    if (pairPageType) {
      setLastFuturesToStorage(pairPageType);
    }
  }, [pairPageType, setLastFuturesToStorage]);

  const walletConnectStatus = useWalletConnectStatus();

  const { pairSymbol } = useParams();
  const { i18n } = useTranslation();
  const chainConfig = useBackendChainConfig(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const currentBaseInfo = useCurrentPairBaseInfoFromUrl(chainId);

  const { isMockSkeleton } = useMockDevTool();
  const marginCustomSelectorId = useMemo(
    () =>
      (chainConfig?.marketCustomPairs || []).find((item) => {
        return currentPair?.symbol && item.pairs.includes(currentPair.symbol);
      })?.id,
    [chainConfig?.marketCustomPairs, currentPair?.symbol],
  );
  const isFetchedPair = useIsFetchedPairInfo(
    chainId,
    currentBaseInfo?.instrumentAddr,
    currentBaseInfo?.expiry,
    pairPageType === PAIR_PAGE_TYPE.EARN,
  );
  const userAddr = useUserAddr();
  const pairFuturesAlertI18n = `common.pairFuturesAlert.${chainId}.${pairSymbol}`;
  const isPairFutureAlert = i18n.exists(pairFuturesAlertI18n);
  const currentPosition = useMainPosition(chainId, userAddr, currentBaseInfo?.id);
  const marketSimulation = useMarketSimulation(chainId);
  const crossMarketSimulation = useCrossMarketSimulation(chainId);
  const removeLiquiditySimulation = useRemoveLiquidationSimulation(chainId);
  const haveMarketSimulation = useMemo(() => {
    const haveRemoveLiqSimulation =
      !!removeLiquiditySimulation?.data &&
      !removeLiquiditySimulation?.data?.simulationMainPosition?.size?.eq(0) &&
      !removeLiquiditySimulation?.data?.simulationMainPosition?.size?.sub(currentPosition?.size || 0)?.eq(0);

    return haveRemoveLiqSimulation || !!marketSimulation?.data || !!crossMarketSimulation?.data;
  }, [crossMarketSimulation?.data, currentPosition?.size, marketSimulation?.data, removeLiquiditySimulation?.data]);
  const hasPosition = useMemo(() => {
    return haveMarketSimulation || currentPosition?.hasPosition;
  }, [currentPosition?.hasPosition, haveMarketSimulation]);
  const isNewPair = !(currentPair && currentPair instanceof WrappedPair);

  const isFetchedPortfolio = useIsFetchedSinglePortfolio(
    chainId,
    userAddr,
    currentBaseInfo?.instrumentAddr,
    currentBaseInfo?.expiry,
  );

  const accountPositionContent = useMemo(() => {
    if (walletConnectStatus === WALLET_CONNECT_STATUS.UN_CONNECT) {
      return <ConnectWalletCard />;
    }
    if (!isFetchedPortfolio || isMockSkeleton) {
      return <TradePositionSkeleton />;
    }

    return (
      <>
        {hasPosition && <TradePositionCard pairSymbol={pairSymbol} className="syn-trade-position-area" />}
        <TradePortfolio className="syn-trade-position-area" />
      </>
    );
  }, [hasPosition, isFetchedPortfolio, isMockSkeleton, pairSymbol, walletConnectStatus]);

  return (
    <div className="syn-trade-wrapper">
      <BlockedAlert />
      {!isFetchedPair && marginCustomSelectorId && (
        <TradeYourOwnRiskAlert
          style={{ marginBottom: 16, zIndex: 10 }}
          i18nId={
            isPairFutureAlert ? pairFuturesAlertI18n : `common.tradeYourOwnRiskAlert.${marginCustomSelectorId}.details`
          }
          hrefInfo={isPairFutureAlert && pairSymbol ? chainConfig?.pairFuturesAlertUrl?.[pairSymbol] : undefined}
        />
      )}
      <div className="syn-trade">
        <div className="syn-trade-left">
          {pairPageType && <PairInfo type={pairPageType} className="syn-trade-info-area" />}
          {isNewPair ? (
            <EarnChart className="syn-earn-chart-area" />
          ) : (
            <>
              <CoinPriceChart className="syn-trade-chart-area" />
              {accountPositionContent}
            </>
          )}
        </div>
        <div className="syn-trade-right">{pairPageType === PAIR_PAGE_TYPE.TRADE ? <TradeCard /> : <EarnCard />}</div>
      </div>
    </div>
  );
};

export default Trade;
