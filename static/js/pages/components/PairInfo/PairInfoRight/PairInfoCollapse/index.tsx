/**
 * @description Component-PairInfoCollapse
 */

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import TVLWarningIcon from '@/components/TVLWarningIcon';
import LeanMoreToolTip from '@/components/ToolTip/LeanMoreToolTip';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { CHAIN_ID } from '@/constants/chain';
import { PAIR_PAGE_TYPE } from '@/constants/global';
import { LEARN_MORE_LINK } from '@/constants/links';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { useMarketPairInfo } from '@/features/futures/hooks';
import { useCurrentPairBaseInfoFromUrl } from '@/features/pair/hook';
import { useChainId } from '@/hooks/web3/useChain';
import { ISpotState } from '@/types/spot';
import { useDebounceFn } from 'ahooks';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ReactComponent as ArrowLeft } from '../../assets/icon_arrow_left.svg';
import { ReactComponent as ArrowRight } from '../../assets/icon_arrow_right.svg';
import FundingRate from '../FundingRate';
import './index.less';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  currentPair?: WrappedPair | undefined;
  type: PAIR_PAGE_TYPE;
}

function PairInfos({
  chainId,
  currentPair,
}: {
  chainId: CHAIN_ID | undefined;
  currentPair: WrappedPair | undefined;
  spotRawPrice: WrappedBigNumber | undefined;
  spotState: ISpotState | undefined;
}) {
  const { t } = useTranslation();
  const currentPairBaseInfo = useCurrentPairBaseInfoFromUrl(chainId);
  const marketPairInfo = useMarketPairInfo(chainId, currentPairBaseInfo?.instrumentAddr, currentPairBaseInfo?.expiry);
  const markPrice = useMemo(() => {
    return marketPairInfo?.markPrice || currentPair?.wrapAttribute('markPrice');
  }, [currentPair, marketPairInfo?.markPrice]);

  const effectLiqTvl = useMemo(() => {
    return marketPairInfo?.effectLiqTvl || currentPair?.wrapAttribute('effectLiqTvl');
  }, [currentPair, marketPairInfo?.effectLiqTvl]);

  const openInterests = useMemo(() => {
    return marketPairInfo?.openInterests || currentPair?.wrapAttribute('openInterests');
  }, [currentPair, marketPairInfo?.openInterests]);

  const longOi = useMemo(() => {
    return marketPairInfo?.longOi || currentPair?.wrapAttribute('longOpenInterest');
  }, [currentPair, marketPairInfo?.longOi]);

  const shortOi = useMemo(() => {
    return marketPairInfo?.shortOi || currentPair?.wrapAttribute('shortOpenInterest');
  }, [currentPair, marketPairInfo?.shortOi]);

  const baseToken = useMemo(() => {
    return marketPairInfo?.baseToken || currentPair?.rootInstrument?.baseToken;
  }, [currentPair?.rootInstrument?.baseToken, marketPairInfo?.baseToken]);
  return (
    <>
      <div className="syn-pair-info-right-item">
        <div className="syn-pair-info-right-item-title">
          <LeanMoreToolTip title={t('tooltip.tradePage.markPrice')}>{t('common.markP')}</LeanMoreToolTip>
        </div>
        <div className="syn-pair-info-right-item-value">
          <EmptyDataWrap isLoading={!markPrice || markPrice.eq(0)}>
            {markPrice?.formatPriceNumberWithTooltip({
              isShowTBMK: true,
            })}
          </EmptyDataWrap>
        </div>
      </div>
      {/* 24HV */}
      <div className="syn-pair-info-right-item">
        <div className="syn-pair-info-right-item-title">{t('common.24HV')}</div>
        <div className="syn-pair-info-right-item-value">
          {/* <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.stats}>
            {currentPair?.volume24hUSD?.formatNumberWithTooltip({
              isShowTBMK: true,
              prefix: '$',
              isShowApproximatelyEqualTo: false,
            })}
          </EmptyDataWrap> */}

          <EmptyDataWrap isLoading={!marketPairInfo?.volume24hUsd}>
            {marketPairInfo?.volume24hUsd?.formatNumberWithTooltip({
              isShowTBMK: true,
              prefix: '$',
              isShowApproximatelyEqualTo: false,
            })}
          </EmptyDataWrap>
        </div>
      </div>
      {/* tvl */}
      <div className="syn-pair-info-right-item">
        <div className="syn-pair-info-right-item-title">
          <UnderlineToolTip title={t('common.effectLiqTooltip')}>{t('common.effectLiq')}</UnderlineToolTip>
        </div>
        <div className="syn-pair-info-right-item-value">
          <div className="syn-pair-info-right-item-value-oi">
            {/* <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.fairPrice}>
              {currentPair?.effectLiqTvl?.formatNumberWithTooltip({
                isShowTBMK: true,
                prefix: '$',
                isShowApproximatelyEqualTo: false,
              })}
            </EmptyDataWrap> */}
            <EmptyDataWrap isLoading={!effectLiqTvl}>
              {effectLiqTvl?.formatNumberWithTooltip({
                isShowTBMK: true,
                prefix: '$',
                isShowApproximatelyEqualTo: false,
              })}
            </EmptyDataWrap>
          </div>
        </div>
      </div>
      <div className="syn-pair-info-right-item">
        <div className="syn-pair-info-right-item-title">
          {t('common.tvl')}
          <TVLWarningIcon tvl={marketPairInfo?.tvlUsd} />
        </div>
        <div className="syn-pair-info-right-item-value">
          <div className="syn-pair-info-right-item-value-oi">
            {/* <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.fairPrice}>
              {currentPair?.tvlUSD?.formatNumberWithTooltip({
                isShowTBMK: true,
                prefix: '$',
                isShowApproximatelyEqualTo: false,
              })}
            </EmptyDataWrap> */}
            <EmptyDataWrap isLoading={!marketPairInfo?.tvlUsd}>
              {marketPairInfo?.tvlUsd?.formatNumberWithTooltip({
                isShowTBMK: true,
                prefix: '$',
                isShowApproximatelyEqualTo: false,
              })}
            </EmptyDataWrap>
          </div>
        </div>
      </div>

      {/* estPoolApy */}
      <div className="syn-pair-info-right-item">
        <div className="syn-pair-info-right-item-title">{t('common.earn.estPoolApy')}</div>
        <div className="syn-pair-info-right-item-value">
          {/* <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.stats}>
            {currentPair?.stats?.wrapAttribute('APY24h')?.formatPercentage({
              hundredfold: true,
              colorShader: false,
            })}
          </EmptyDataWrap> */}
          <EmptyDataWrap isLoading={!marketPairInfo?.liquidityApy}>
            {marketPairInfo?.liquidityApy?.formatPercentage({
              hundredfold: true,
              colorShader: false,
            })}
          </EmptyDataWrap>
        </div>
      </div>
      <FundingRate chainId={chainId} currentPair={currentPair} marketPairInfo={marketPairInfo} />
      {/* Oi long short */}
      {/* openInterest */}
      {(process.env.REACT_APP_AWS_ENV === 'dev' || process.env.REACT_APP_AWS_ENV === 'pre') && (
        <div className="syn-pair-info-right-item">
          <div className="syn-pair-info-right-item-title">
            <LeanMoreToolTip link={LEARN_MORE_LINK.oi} title={t('tooltip.tradePage.openInterest')}>
              {t('common.oi')}
            </LeanMoreToolTip>
          </div>
          <div className="syn-pair-info-right-item-value">
            <EmptyDataWrap isLoading={!openInterests}>
              {openInterests?.formatNumberWithTooltip({
                isShowTBMK: true,
                suffix: baseToken?.symbol,
              })}
            </EmptyDataWrap>
          </div>
        </div>
      )}
      {process.env.REACT_APP_APP_PORTFOLIO_SHOW_PNL === 'true' && (
        <div className="syn-pair-info-right-item">
          <div className="syn-pair-info-right-item-title">
            {
              <Trans
                i18nKey={'common.longOiShortOi2'}
                components={{
                  color: <span />,
                }}
              />
            }
          </div>
          <div className="syn-pair-info-right-item-value">
            <EmptyDataWrap isLoading={!longOi}>
              <div className="syn-pair-info-right-item-value-oi">
                {longOi?.formatNumberWithTooltip({
                  isShowTBMK: true,
                })}
                <span>{` / `}</span>

                {shortOi?.formatNumberWithTooltip({
                  isShowTBMK: true,
                  suffix: baseToken?.symbol,
                })}
              </div>
            </EmptyDataWrap>
          </div>
        </div>
      )}
    </>
  );
}

// function TradeInfos({
//   chainId,
//   currentPair,
//   spotRawPrice,
//   spotState,
//   pairFetchingStatus,
//   pairStatsStatus,
// }: {
//   chainId: CHAIN_ID | undefined;
//   currentPair: WrappedPair | undefined;
//   spotRawPrice: WrappedBigNumber | undefined;
//   spotState: ISpotState | undefined;
//   pairFetchingStatus: FETCHING_STATUS;
//   pairStatsStatus: FETCHING_STATUS;
// }) {
//   const { t } = useTranslation();
//   const spotPriceDisplay = useMemo(() => {
//     // if (!currentPair?.rootInstrument?.spotPrice && !spotRawPrice) return;
//     let price: WrappedBigNumber | undefined;
//     // if (currentPair?.rootInstrument?.spotPrice) {
//     //   price = WrappedBigNumber.from(currentPair?.rootInstrument?.spotPrice);
//     // }
//     if (spotRawPrice && spotRawPrice.gt(0)) {
//       price = spotRawPrice;
//     }

//     if (currentPair?.isInverse && price?.gt(0)) {
//       price = WrappedBigNumber.from(1).div(price);
//     }
//     return price;
//   }, [currentPair?.isInverse, spotRawPrice]);
//   return (
//     <>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">{t('common.indexP')}</div>
//         <div className="syn-pair-info-right-item-value">
//           {/* {currentPair?.rootInstrument.market.info.type} */}
//           <EmptyDataWrap isLoading={!spotPriceDisplay || spotPriceDisplay.eq(0)}>
//             <Tooltip
//               title={
//                 <div>
//                   <div>{spotPriceDisplay?.stringValue}</div>
//                   {spotState?.time && (
//                     <div>
//                       {t('common.updated')}: {formatDate(spotState?.time * 1000, 'MM-DD HH:mm:ss')}
//                     </div>
//                   )}
//                 </div>
//               }>
//               <span>{spotPriceDisplay?.formatPriceString()}</span>
//             </Tooltip>
//           </EmptyDataWrap>
//           <small>
//             {' '}
//             <TokenPairOracle marketType={currentPair?.rootInstrument.marketType} />
//           </small>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">
//           <LeanMoreToolTip title={t('tooltip.tradePage.markPrice')}>{t('common.markP')}</LeanMoreToolTip>
//         </div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={!currentPair?.markPrice || currentPair?.markPrice.eq(0)}>
//             {currentPair?.wrapAttribute('markPrice').formatPriceNumberWithTooltip({
//               isShowTBMK: true,
//             })}
//           </EmptyDataWrap>
//         </div>
//       </div>

//       <FundingRate chainId={chainId} currentPair={currentPair} pairFetchingStatus={pairFetchingStatus} />
//       <div className="syn-pair-info-right-item hide-1280">
//         <div className="syn-pair-info-right-item-title">{t('common.24HH')}</div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.stats}>
//             {currentPair?.stats?.high24h && currentPair?.stats?.displayHigh24h.formatPriceNumberWithTooltip()}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item hide-1280">
//         <div className="syn-pair-info-right-item-title">{t('common.24HL')} </div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.stats}>
//             {currentPair?.stats?.low24h && currentPair?.stats?.displayLow24h.formatPriceNumberWithTooltip()}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">{t('common.24HV')}</div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.stats}>
//             {currentPair?.volume24hUSD?.formatNumberWithTooltip({
//               isShowTBMK: true,
//               prefix: '$',
//               isShowApproximatelyEqualTo: false,
//             })}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">
//           <LeanMoreToolTip link={LEARN_MORE_LINK.oi} title={t('tooltip.tradePage.openInterest')}>
//             {t('common.oi')}
//           </LeanMoreToolTip>
//         </div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={!currentPair?.openInterests}>
//             {currentPair?.wrapAttribute('openInterests').formatNumberWithTooltip({
//               isShowTBMK: true,
//               suffix: currentPair.rootInstrument?.baseToken?.symbol,
//             })}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">{t('common.longOi')}</div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={!currentPair?.openInterests}>
//             {currentPair?.longOpenInterest?.formatNumberWithTooltip({
//               isShowTBMK: true,
//               suffix: currentPair.rootInstrument?.baseToken?.symbol,
//             })}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">{t('common.ShortOi')}</div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={!currentPair?.openInterests}>
//             {currentPair?.shortOpenInterest?.formatNumberWithTooltip({
//               isShowTBMK: true,
//               suffix: currentPair.rootInstrument?.baseToken?.symbol,
//             })}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">{t('common.tvl')}</div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.fairPriceWad}>
//             {currentPair?.tvlUSD?.formatNumberWithTooltip({
//               isShowTBMK: true,
//               prefix: '$',
//               isShowApproximatelyEqualTo: false,
//             })}
//           </EmptyDataWrap>
//         </div>
//       </div>
//     </>
//   );
// }

// function EarnInfos({
//   currentPair,
//   spotRawPrice,
//   spotState,
//   pairStatsStatus,
// }: {
//   currentPair: WrappedPair | undefined;
//   spotRawPrice: WrappedBigNumber | undefined;
//   spotState: ISpotState | undefined;
//   pairStatsStatus: FETCHING_STATUS;
// }) {
//   const { t } = useTranslation();
//   const spotPriceDisplay = useMemo(() => {
//     // if (!currentPair?.rootInstrument?.spotPrice && !spotRawPrice) return;
//     let price: WrappedBigNumber | undefined;
//     // if (currentPair?.rootInstrument?.spotPrice) {
//     //   price = WrappedBigNumber.from(currentPair?.rootInstrument?.spotPrice);
//     // }
//     if (spotRawPrice && spotRawPrice.gt(0)) {
//       price = spotRawPrice;
//     }

//     if (currentPair?.isInverse && price?.gt(0)) {
//       price = WrappedBigNumber.from(1).div(price);
//     }
//     return price;
//   }, [currentPair?.isInverse, spotRawPrice]);
//   return (
//     <>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">{t('common.tvl')}</div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.fairPriceWad}>
//             {currentPair?.tvlUSD?.formatNumberWithTooltip({
//               isShowTBMK: true,
//               prefix: '$',
//               isShowApproximatelyEqualTo: false,
//             })}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">{t('common.fairP')}</div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.fairPriceWad}>
//             {currentPair?.wrapAttribute('fairPriceWad').formatPriceNumberWithTooltip()}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">{t('common.indexP')}</div>
//         <div className="syn-pair-info-right-item-value">
//           {/* {currentPair?.rootInstrument.market.info.type} */}
//           <EmptyDataWrap isLoading={!spotPriceDisplay || spotPriceDisplay.eq(0)}>
//             <Tooltip
//               title={
//                 <div>
//                   <div>{spotPriceDisplay?.stringValue}</div>
//                   {spotState?.time && (
//                     <div>
//                       {t('common.updated')}: {formatDate(spotState?.time * 1000, 'MM-DD HH:mm:ss')}
//                     </div>
//                   )}
//                 </div>
//               }>
//               <span>{spotPriceDisplay?.formatPriceString()}</span>
//             </Tooltip>
//           </EmptyDataWrap>
//           <small>
//             {' '}
//             <TokenPairOracle marketType={currentPair?.rootInstrument.marketType} />
//           </small>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">
//           <LeanMoreToolTip title={t('tooltip.tradePage.markPrice')}>{t('common.markP')}</LeanMoreToolTip>
//         </div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.markPrice}>
//             {currentPair?.wrapAttribute('markPrice').formatPriceNumberWithTooltip({
//               isShowTBMK: true,
//             })}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item hide-1280">
//         <div className="syn-pair-info-right-item-title">{t('common.24HH')}</div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.stats}>
//             {currentPair?.stats?.high24h && currentPair?.stats?.displayHigh24h.formatPriceNumberWithTooltip()}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item hide-1280">
//         <div className="syn-pair-info-right-item-title">{t('common.24HL')} </div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.stats}>
//             {currentPair?.stats?.low24h && currentPair?.stats?.displayLow24h.formatPriceNumberWithTooltip()}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">{t('common.24HV')}</div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={pairStatsStatus !== FETCHING_STATUS.DONE || !currentPair?.stats}>
//             {currentPair?.volume24hUSD?.formatNumberWithTooltip({
//               isShowTBMK: true,
//               prefix: '$',
//               isShowApproximatelyEqualTo: false,
//             })}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">
//           <LeanMoreToolTip link={LEARN_MORE_LINK.oi} title={t('tooltip.tradePage.openInterest')}>
//             {t('common.oi')}
//           </LeanMoreToolTip>
//         </div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={!currentPair?.openInterests}>
//             {currentPair?.wrapAttribute('openInterests').formatNumberWithTooltip({
//               isShowTBMK: true,
//               suffix: currentPair.rootInstrument?.baseToken?.symbol,
//             })}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">{t('common.longOi')}</div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={!currentPair?.openInterests}>
//             {currentPair?.longOpenInterest?.formatNumberWithTooltip({
//               isShowTBMK: true,
//               suffix: currentPair.rootInstrument?.baseToken?.symbol,
//             })}
//           </EmptyDataWrap>
//         </div>
//       </div>
//       <div className="syn-pair-info-right-item">
//         <div className="syn-pair-info-right-item-title">{t('common.ShortOi')}</div>
//         <div className="syn-pair-info-right-item-value">
//           <EmptyDataWrap isLoading={!currentPair?.openInterests}>
//             {currentPair?.shortOpenInterest?.formatNumberWithTooltip({
//               isShowTBMK: true,
//               suffix: currentPair.rootInstrument?.baseToken?.symbol,
//             })}
//           </EmptyDataWrap>
//         </div>
//       </div>
//     </>
//   );
// }

const PairInfoCollapse: FC<IPropTypes> = function ({ currentPair }) {
  const chainId = useChainId();
  // const spotState = useInstrumentSpotState(chainId, currentPair?.rootInstrument?.id);
  // const spotRawPrice = useInstrumentSpotRawPrice(chainId, currentPair?.rootInstrument?.id);
  const [widthDifference, setWidthDifference] = useState(0);
  const [distanceToLeft, setDistanceToLeft] = useState(0);
  const { run: resize } = useDebounceFn(
    () => {
      const infoRightWidth = document.getElementById('infoRight')?.offsetWidth || 0;
      const infoRightContainerWidth = document.getElementById('infoRightContainer')?.offsetWidth || 0;
      setWidthDifference(infoRightContainerWidth - infoRightWidth);
      setDistanceToLeft(0);
    },
    { wait: 200 },
  );
  const moveRight = useCallback(() => {
    const newDistance = distanceToLeft + widthDifference;
    setDistanceToLeft(newDistance);
  }, [distanceToLeft, widthDifference]);
  const moveLeft = useCallback(() => {
    const newDistance = distanceToLeft - widthDifference;
    setDistanceToLeft(newDistance);
  }, [distanceToLeft, widthDifference]);
  useEffect(() => {
    resize();
    setDistanceToLeft(0);
    setWidthDifference(0);
  }, [currentPair?.id]);
  useEffect(() => {
    window.addEventListener('resize', resize);
  }, [resize]);
  const showLeft = useMemo(() => distanceToLeft > 0, [distanceToLeft]);
  const showRight = useMemo(() => distanceToLeft < widthDifference, [distanceToLeft, widthDifference]);

  return (
    <div className="syn-pair-info-right-wrap">
      {widthDifference > 0 && (
        <>
          <div onClick={moveLeft} className={classNames('syn-pair-info-right-arrow left', { show: showLeft })}>
            {' '}
            <ArrowLeft />
          </div>

          <div onClick={moveRight} className={classNames('syn-pair-info-right-arrow right', { show: showRight })}>
            <ArrowRight />
          </div>
        </>
      )}
      <div
        id="infoRight"
        className={classNames('syn-pair-info-right-container', {
          left: showLeft,
          right: showRight,
        })}>
        <div
          id="infoRightContainer"
          style={{ left: -distanceToLeft }}
          className={classNames('syn-pair-info-right-container-inner')}>
          <PairInfos currentPair={currentPair} chainId={chainId} spotState={undefined} spotRawPrice={undefined} />
        </div>
      </div>
    </div>
  );
};

export default PairInfoCollapse;
