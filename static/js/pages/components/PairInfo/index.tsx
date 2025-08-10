/**
 * @description Component-PairInfo
 */
import './index.less';

import classNames from 'classnames';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from '@/components/Card';
// import CountdownTime from '@/components/CountdownTime';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
// import LeanMoreToolTip from '@/components/ToolTip/LeanMoreToolTip';
import { PAIR_PAGE_TYPE } from '@/constants/global';
// import { FAQ_LINKS } from '@/constants/links';
import { useCurrentPairBaseInfoFromUrl, useCurrentPairFromUrl } from '@/features/pair/hook';
import { useListenGateEvent, useListenSingleInstrumentEvent } from '@/hooks/data/useListenEventOnWorker';
import { usePollingSingleInstrumentDataOnTradeOrEarn } from '@/hooks/data/usePollingDataOnWorker';
// import Change24 from '@/pages/components/Change24';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { showProperDateString } from '@/utils/timeUtils';

import Change24 from '../Change24';
// import BackButton from './BackButton';
import { useMockDevTool } from '@/components/Mock';
import SearchPair from '@/components/SearchPair';
import { useIsFetchedPairInfo, useMarketPairInfo, useWatchMarketPairInfoChange } from '@/features/futures/hooks';
import { useFetchFuturesInstrument } from '@/features/futures/query';
import { useTitle } from '@/features/global/hooks';
import { useFetchMarketPairList } from '@/features/market/query';
import { OrderEventListener } from '@/features/pair/EventListener';
import PairInfoRight from './PairInfoRight';
import PairInfoSkeleton from './PairInfoSkeleton';
interface IPropTypes {
  type?: PAIR_PAGE_TYPE;
  className?: string;
}
const PairInfo: FC<IPropTypes> = function ({ className, type = PAIR_PAGE_TYPE.TRADE }) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const navigate = useNavigate();
  const currentPair = useCurrentPairFromUrl(chainId);
  const currentBaseInfo = useCurrentPairBaseInfoFromUrl(chainId);
  const currentMarketPairInfo = useMarketPairInfo(chainId, currentBaseInfo?.instrumentAddr, currentBaseInfo?.expiry);

  const { isMockSkeleton } = useMockDevTool();
  // show pair price in title
  useTitle(
    currentPair?.fairPrice &&
      currentPair?.rootInstrument?.displayBaseToken &&
      currentPair?.rootInstrument?.displayQuoteToken
      ? `${currentPair?.wrapAttribute('fairPrice')?.formatPriceString()} ${
          currentPair?.rootInstrument?.displayBaseToken?.symbol
        }/${currentPair?.rootInstrument?.displayQuoteToken?.symbol}-${showProperDateString({
          expiry: currentPair.expiry,
          format: 'MMDD',
          showShortPerp: true,
        })} | SynFutures`
      : 'SynFutures',
    // { restoreOnUnmount: true },
  );
  // const isFetched = useMarketPairInfoIsFetched(chainId, currentBaseInfo?.instrumentAddr, currentBaseInfo?.expiry);
  const isFetchedPair = useIsFetchedPairInfo(
    chainId,
    currentBaseInfo?.instrumentAddr,
    currentBaseInfo?.expiry,
    type === PAIR_PAGE_TYPE.EARN,
  );
  useListenSingleInstrumentEvent(chainId, userAddr, currentBaseInfo?.instrumentAddr);
  useListenGateEvent(chainId, userAddr);
  usePollingSingleInstrumentDataOnTradeOrEarn(
    chainId,
    userAddr,
    currentBaseInfo?.instrumentAddr,
    currentBaseInfo?.expiry,
  );
  // useFetchSingleInstrumentDataWhenChangePage(
  //   chainId,
  //   userAddr,
  //   currentBaseInfo?.instrumentAddr,
  //   currentBaseInfo?.expiry,
  // );

  useFetchMarketPairList();
  // useWatchMarketListChange(chainId);
  useFetchFuturesInstrument(chainId, currentBaseInfo?.instrumentAddr);
  useWatchMarketPairInfoChange(chainId, currentBaseInfo?.instrumentAddr, currentBaseInfo?.expiry);
  // useGetUserProfile();

  useEffect(() => {
    const hash = document.location.hash;
    if (currentPair && !currentPair?.isNormalPair && hash.startsWith('#/earn/')) {
      navigate('/portfolio');
    }
    //  must dep on isNormalPair
  }, [currentPair?.isNormalPair]);

  // useEffect(() => {
  //   if (currentBaseInfo?.instrumentAddr) {
  //     // if (currentBaseInfo?.rootInstrument?.marketType)
  //     //   currentBaseInfo?.chainId &&
  //     //     window.synWorker.postMessage({
  //     //       eventName: WorkerEventNames.FetchInstrumentSpotState,
  //     //       data: {
  //     //         chainId: currentBaseInfo?.chainId,
  //     //         instrumentAddr: currentBaseInfo?.instrumentAddr,
  //     //         marketType: currentBaseInfo.rootInstrument.marketType,
  //     //       },
  //     //     });
  //     // window.synWorker.postMessage({
  //     //   eventName: WorkerEventNames.PollingFetchInstrument,
  //     //   data: {
  //     //     chainId,
  //     //     instrumentAddr: currentBaseInfo?.instrumentAddr,
  //     //   },
  //     // });
  //     window.synWorker.postMessage({
  //       eventName: WorkerEventNames.FetchPair,
  //       data: {
  //         chainId,
  //         instrumentAddr: currentBaseInfo?.instrumentAddr,
  //       },
  //     });
  //   }
  // }, [currentBaseInfo?.instrumentAddr]);
  const isLoading = isMockSkeleton || !isFetchedPair;
  // const isLoading = isMockSkeleton || !isFetched;

  return (
    <>
      <Card className={classNames(className, 'syn-pair-info')}>
        {isLoading && <PairInfoSkeleton />}
        <div className="syn-pair-info-container" style={{ display: isLoading ? 'none' : undefined }}>
          <div className="syn-pair-info-left">
            <SearchPair type={type} />
            <div className="syn-pair-info-left-price">
              <div className="syn-pair-info-left-price-top">
                <EmptyDataWrap isLoading={!currentMarketPairInfo?.fairPrice || currentMarketPairInfo?.fairPrice.eq(0)}>
                  {currentMarketPairInfo?.fairPrice.formatPriceNumberWithTooltip()}
                </EmptyDataWrap>
              </div>
              <Change24
                instrumentAddr={currentPair?.instrumentAddr}
                expiry={currentPair?.expiry}
                chainId={chainId}
                priceChange24h={currentMarketPairInfo?.fairPriceChange24h}
              />
            </div>
          </div>
          <PairInfoRight currentPair={currentPair} type={type} />
        </div>
        <OrderEventListener instrument={currentPair?.rootInstrument} />

        {/* <PairNotFound type={type} createOnly={false} /> */}
      </Card>
    </>
  );
};

export default PairInfo;
