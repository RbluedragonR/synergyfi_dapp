/**
 * @description Component-EarnMobileSubpage
 */
import SubPageWrap from '@/components/SubPage';
import './index.less';

import SynTitleTabs from '@/components/Tabs/SynTitleTabs';
import BlockNumberTextMobile from '@/components/Text/BlockNumberText/BlockNumberTextMobile';
import { EARN_TYPE } from '@/constants/earn';
import { PAIR_PAGE_TYPE, TVL_THRESHHOLD } from '@/constants/global';
import { MOBILE_SHOW_CHART_EARN } from '@/constants/storage';
import { resetLiquidityFormByChainId, setEarnFormType } from '@/features/earn/action';
import { useIsInWhiteList } from '@/features/earn/hook';
import { useMarketList } from '@/features/market/hooks';
import { useCurrentPairBaseInfoFromUrl, useCurrentPairFromUrl } from '@/features/pair/hook';
import { resetFormByChainId } from '@/features/trade/actions';
import { useAppDispatch } from '@/hooks';
import { usePollingSingleInstrumentDataOnTradeOrEarn } from '@/hooks/data/usePollingDataOnWorker';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { usePairCheck } from '@/pages/components/PairInfo/pairCheckHook';
import AddLiqForm from '@/pages/earn/EarnCard/EarnForm/AddLiqForm';
import PairNotInWhitelist from '@/pages/earn/EarnCard/EarnForm/PairNotInWhitelist';
import InfoChart from '@/pages/earn/EarnChart/InfoChart';
import _ from 'lodash';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import MobileBanner from '../components/MobileBanner';
import MobileProfile from '../components/MobileProfile';
import MobileSubPageHeader from '../components/MobileSubpageHeader';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const EarnMobileSubpage: FC<IPropTypes> = function ({}) {
  const [showChart, setShowChart] = useState(false);
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const currentPair = useCurrentPairFromUrl(chainId);
  const navigate = useNavigate();
  const isInWhiteList = useIsInWhiteList(chainId, userAddr, currentPair?.rootInstrument.quoteToken);
  const { pairSymbol: symbolFromUrl } = useParams();
  const { t } = useTranslation();
  const items = useMemo(
    () => [
      {
        key: EARN_TYPE.ADD_LIQ.toString(),
        label: t('common.earn.addLiq'),
        // children: <EarnLiquidities />,
      },
    ],
    [t],
  );
  const { marketPairList, isFetched } = useMarketList(chainId ? [chainId] : undefined);
  const marketPairListOrdered = useMemo(
    () =>
      _.orderBy(
        marketPairList.filter((p) => p.tvlUsd.gte(TVL_THRESHHOLD)),
        [(p) => p?.liquidityApy?.toNumber()],
        ['desc'],
      ),
    [marketPairList],
  );
  const dispatch = useAppDispatch();
  const resetCurrentPair = useCallback(() => {
    navigate('/market');
    chainId && dispatch(resetLiquidityFormByChainId({ chainId }));
  }, [chainId, dispatch, navigate]);
  const currentBaseInfo = useCurrentPairBaseInfoFromUrl(chainId);
  // const pairFetchingStatus = usePairFetchingStatus(chainId, currentBaseInfo?.id);

  usePollingSingleInstrumentDataOnTradeOrEarn(
    chainId,
    userAddr,
    currentBaseInfo?.instrumentAddr,
    currentBaseInfo?.expiry,
  );
  usePairCheck(
    chainId,
    currentPair?.symbol,
    marketPairListOrdered.map((p) => p.pairSymbol),
    PAIR_PAGE_TYPE.EARN,
    false,
  );
  useEffect(() => {
    chainId && !currentPair && dispatch(resetFormByChainId({ chainId }));
  }, [chainId, dispatch, currentPair]);

  useEffect(() => {
    setTimeout(() => {
      const localOpenState = localStorage.getItem(MOBILE_SHOW_CHART_EARN);
      if (localOpenState) {
        setShowChart(true);
      }
    }, 1000);
  }, []);
  useEffect(() => {
    if (isFetched && symbolFromUrl && currentPair?.symbol.toLocaleLowerCase() !== symbolFromUrl.toLocaleLowerCase()) {
      const pair = marketPairList.find((p) => p.pairSymbol.toLowerCase() === symbolFromUrl.toLowerCase());
      if (pair) {
        if (chainId) {
          dispatch(setEarnFormType({ chainId, formType: EARN_TYPE.ADD_LIQ }));
        }
      }
    }
    // only these three
  }, [isFetched, symbolFromUrl, currentPair?.symbol]);

  return (
    <SubPageWrap
      footer={<BlockNumberTextMobile />}
      noFooterPadding
      isOverflowAuto
      onClose={() => {
        resetCurrentPair();
      }}
      isShowSubPage={true}
      header={
        <MobileSubPageHeader
          type={PAIR_PAGE_TYPE.EARN}
          toggleShowChart={() => {
            if (showChart) {
              localStorage.setItem(MOBILE_SHOW_CHART_EARN, '');
            } else {
              localStorage.setItem(MOBILE_SHOW_CHART_EARN, 'true');
            }
            setShowChart((pre) => !pre);
          }}
          closeDetail={resetCurrentPair}
          showChart={showChart}
        />
      }
      className="syn-earn-mobile-subpage">
      {isInWhiteList ? (
        <>
          <MobileBanner pageType={PAIR_PAGE_TYPE.EARN} />
          <div className="syn-earn-mobile-subpage-content">
            <div className="syn-earn-mobile-subpage-content-top">
              {showChart && (
                <div className="syn-earn-mobile-subpage-chart">
                  <div className="syn-earn-mobile-subpage-chart-title">{t('mobile.volume')}</div>
                  <InfoChart pair={currentPair} chainId={chainId} />
                </div>
              )}
              <div className="syn-earn-mobile-subpage-form">
                <SynTitleTabs
                  wrapStyle={{ marginBottom: 8 }}
                  className="syn-earn-mobile-subpage-tabs"
                  activeKey={EARN_TYPE.ADD_LIQ}
                  items={items}
                />
                <AddLiqForm />
              </div>
            </div>
            <MobileProfile type={PAIR_PAGE_TYPE.EARN} />
          </div>
        </>
      ) : (
        <PairNotInWhitelist isNewPair={false} currentPair={currentPair} />
      )}
    </SubPageWrap>
  );
};

export default EarnMobileSubpage;
