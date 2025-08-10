/**
 * @description Component-SpotRoute
 */
import './index.less';

import Loading from '@/components/Loading';
import TokenLogo from '@/components/TokenLogo';
import { spotDexInfos } from '@/constants/spot';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useSimulateBestAmount } from '@/features/spot/hooks';
import { useSimulateSwap, useSpotTokens } from '@/features/spot/query';
import { useSpotState } from '@/features/spot/store';
import { useChainId } from '@/hooks/web3/useChain';
import { Route } from '@synfutures/sdks-aggregator';
import classNames from 'classnames';
import _ from 'lodash';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import useMsgIds, { MsgInfo } from '@/spot/useMsg';
import { bothNative } from '@/utils/spot';
import BN from 'bignumber.js';
import { ReactComponent as IconEmpty } from './assets/icon_empty.svg';
import { ReactComponent as IconEmptyDash } from './assets/icon_empty_dash.svg';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  middleTokenAddr?: string;
  routesArray?: Route[][];
}
const SpotRoute: FC<IPropTypes> = function () {
  const { data: simulation, isLoading } = useSimulateSwap();
  const middleTokenAddr =
    simulation?.data?.tokens && simulation?.data?.tokens?.length > 1 ? simulation?.data?.tokens[1] : undefined;
  const routesArray = useMemo(() => simulation?.data?.route || [], [simulation]);
  const { sellAmount, token1: buyToken, token0: sellToken } = useSpotState();
  const chainId = useChainId();
  const { bestAmount: simulatedBuyAmount, isFetched } = useSimulateBestAmount();
  const amountBn = useMemo(() => WrappedBigNumber.from(sellAmount || 0), [sellAmount]);
  const buyAmountBn = useMemo(() => WrappedBigNumber.from(simulatedBuyAmount || 0), [simulatedBuyAmount]);
  const { data: fullTokens } = useSpotTokens({ chainId });
  const nativeWrappedNativePair = useMemo(() => bothNative(sellToken, buyToken), [buyToken, sellToken]);
  const middleToken = useMemo(() => {
    return routesArray.length > 1
      ? fullTokens?.find((t) => t.address.toLowerCase() === middleTokenAddr?.toLowerCase())
      : undefined;
  }, [fullTokens, middleTokenAddr, routesArray]);
  const msgIds = useMsgIds();
  const msgIdsShownInRoute = useMemo(() => msgIds.filter((id) => MsgInfo[id].shownInRoute), [msgIds]);
  const hasSplitRoute = useMemo(() => routesArray?.some((a) => a.length > 1), [routesArray]);

  const { t } = useTranslation();

  return (
    // <Modal
    //   width={860}
    //   centered={true}
    //   title={t('common.spot.route')}
    //   closeIcon={<CloseIcon />}
    //   className="syn-spot-route"
    //   onCancel={() => setSimulationModalOpen(false)}
    //   onClose={() => setSim0ulationModalOpen(false)}
    //   open={open}>
    <div className="syn-spot-route">
      <div className="syn-spot-route-title">{t('common.spot.route')}</div>
      <div
        className={classNames('syn-spot-route-content', { 'two-hop': routesArray.length > 1, split: hasSplitRoute })}>
        <div className="syn-spot-route-content-token in">
          {sellToken && <TokenLogo isSpot={true} token={sellToken} size={32} />}
          <div className="syn-spot-route-content-token-right ">
            {!amountBn.eq(0) && <span>{amountBn.formatNumberWithTooltip({ isShowTBMK: true })}</span>}
            {sellToken?.symbol}
          </div>
        </div>
        {/* <SpotLoadingRoute /> */}
        {routesArray?.map((routes, index) => {
          const formatRoutes = routes
            .map((route) => ({
              ...route,
              formatRatio: WrappedBigNumber.from(route.ratio).formatNormalNumberString(2, true, BN.ROUND_HALF_UP),
            }))
            .sort((a, b) => WrappedBigNumber.from(b.formatRatio).comparedTo(WrappedBigNumber.from(a.formatRatio)));
          const totalRatio = _.reduce(
            formatRoutes,
            (current, route) => WrappedBigNumber.from(route.formatRatio).add(current),
            WrappedBigNumber.from(0),
          );

          // if total ratio is not 1, add the difference to the last route
          if (totalRatio.notEq(1)) {
            const difference = WrappedBigNumber.from(1).min(totalRatio);
            formatRoutes[0].formatRatio = WrappedBigNumber.from(formatRoutes[0].formatRatio)
              .add(difference)
              .formatNormalNumberString(2, true, BN.ROUND_HALF_UP);
          }

          // if there is a route with 0 value, set it to 1 and the max value to the min of 1
          const zeroValueIndex = formatRoutes.findIndex((route) => WrappedBigNumber.from(route.formatRatio).eq(0));
          if (zeroValueIndex !== -1) {
            // const newRoutes = _.cloneDeep(formatRoutes);
            const maxValueIndex = formatRoutes.reduce(
              (maxIndex, route, currentIndex, array) =>
                WrappedBigNumber.from(route.formatRatio).gt(WrappedBigNumber.from(array[maxIndex].formatRatio))
                  ? currentIndex
                  : maxIndex,
              0,
            );
            formatRoutes[maxValueIndex].formatRatio = WrappedBigNumber.from(formatRoutes[maxValueIndex].formatRatio)
              .min(0.01)
              .formatNormalNumberString(2, true, BN.ROUND_HALF_UP);
            formatRoutes[zeroValueIndex].formatRatio = WrappedBigNumber.from(0.01).formatNormalNumberString(
              2,
              true,
              BN.ROUND_HALF_UP,
            );
          }

          return (
            <div
              className={classNames('syn-spot-route-content-inner', { 'one-only': routes?.length === 1 })}
              style={{ height: (routes.length - 1) * 48 }}
              key={`routes_${index}`}>
              {formatRoutes.map((route, index) => (
                <div key={`route_${index}`}>
                  <div
                    style={{
                      top: `${(100 / (routes.length - 1)) * index}%`,
                      borderColor: spotDexInfos[route.poolType]?.color,
                    }}
                    className={classNames('syn-spot-route-content-inner-route')}>
                    <span className="ratio">
                      {WrappedBigNumber.from(route.formatRatio).formatPercentageString(true, 0)}
                    </span>
                    <div className="pool-info">
                      <img
                        key={route.poolType}
                        width={14}
                        height={14}
                        src={_.get(spotDexInfos, [route.poolType, 'imageSrc'])}
                      />
                      {_.get(spotDexInfos, [route.poolType])?.name}(
                      {WrappedBigNumber.from(route.fee).formatPercentageString()})
                    </div>
                  </div>
                  {((index !== 0 && index !== routes.length - 1) || routes?.length === 1) && (
                    <div
                      style={{ top: `${(100 / (routes.length - 1)) * index}%` }}
                      className="syn-spot-route-content-inner-route-line"
                    />
                  )}
                </div>
              ))}
            </div>
          );
        })}
        {isLoading ? (
          <div className="syn-spot-route-content-empty">
            <div className="syn-spot-route-content-empty-line" />
            <div className="syn-spot-route-content-empty-loader">
              <Loading size="large" spinning={true} />
            </div>
          </div>
        ) : (
          WrappedBigNumber.from(sellAmount || 0).eq(0) && (
            <div className="syn-spot-route-content-empty">
              {/* <WarningIcon /> */}
              <IconEmptyDash />
              <IconEmpty />
              <IconEmptyDash />
            </div>
          )
        )}
        {nativeWrappedNativePair && simulation?.nativeSwap && <div className="syn-spot-route-content-line" />}
        {msgIdsShownInRoute.length > 0 &&
          msgIdsShownInRoute.map((id) => {
            const { i18nId, i18nIdInRoute } = MsgInfo[id];
            return (
              <div className="syn-spot-route-content-not-found" key={id}>
                {t(i18nIdInRoute || i18nId)}
              </div>
            );
          })}
        {middleToken && routesArray?.length > 1 && (
          <div className="syn-spot-route-content-token middle">
            <TokenLogo isSpot={true} token={middleToken} size={32} />
            {middleToken?.symbol}
          </div>
        )}
        <div className="syn-spot-route-content-token out">
          {buyToken && <TokenLogo isSpot={true} token={buyToken} size={32} />}
          <div className="syn-spot-route-content-token-right">
            {!buyAmountBn.eq(0) && isFetched && (
              <span>{buyAmountBn?.formatNumberWithTooltip({ isShowTBMK: true })}</span>
            )}
            {buyToken?.symbol}
          </div>
        </div>
      </div>
    </div>
    // </Modal>
  );
};

export default SpotRoute;
