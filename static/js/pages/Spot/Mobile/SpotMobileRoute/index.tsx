/**
 * @description Component-SpotRoute
 */
import './index.less';

import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useSimulateBestAmount } from '@/features/spot/hooks';
import { useSimulateSwap, useSpotTokens } from '@/features/spot/query';
import { useSpotState } from '@/features/spot/store';
import { useChainId } from '@/hooks/web3/useChain';
import useMsgIds, { MsgInfo } from '@/spot/useMsg';
import { bothNative } from '@/utils/spot';
import { Route } from '@synfutures/sdks-aggregator';
import { Flex } from 'antd';
import classNames from 'classnames';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SpotMobilePool from './SpotPool';
import SpotToken from './SpotToken';
import routeArrow from './assets/icon_empty.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  middleTokenAddr?: string;
  routesArray?: Route[][];
}
const SpotMobileRoute: FC<IPropTypes> = function () {
  const { data: simulation } = useSimulateSwap();
  const { t } = useTranslation();
  const middleTokenAddr =
    simulation?.data?.tokens && simulation?.data?.tokens?.length > 1 ? simulation?.data?.tokens[1] : undefined;
  const routesArray = useMemo(() => simulation?.data?.route || [], [simulation]);
  const { sellAmount, token1: buyToken, token0: sellToken } = useSpotState();
  const chainId = useChainId();
  const { bestAmount: simulatedBuyAmount } = useSimulateBestAmount();
  const fromAmountBn = useMemo(() => WrappedBigNumber.from(sellAmount || 0), [sellAmount]);
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
  return (
    <div className="syn-spot-mobile-route">
      <div className="syn-spot-mobile-route-tokens">
        <SpotToken token={sellToken} amountBn={fromAmountBn} type="from" />
        {nativeWrappedNativePair && <div className="syn-spot-mobile-route-wrapping-line" />}
        <SpotToken token={buyToken} amountBn={buyAmountBn} type="to" />
      </div>
      {msgIdsShownInRoute.length > 0 ? (
        msgIdsShownInRoute.map((id) => {
          const { i18nIdInRoute, i18nId } = MsgInfo[id];
          return (
            <div className="syn-spot-mobile-route-message" key={id}>
              {t(i18nIdInRoute || i18nId)}
            </div>
          );
        })
      ) : (
        <>
          {routesArray?.length === 0 && !nativeWrappedNativePair && (
            <div className="syn-spot-mobile-route-empty-line">
              <img className="syn-spot-mobile-route-empty-line-arrow" src={routeArrow} alt="route-arrow" />
            </div>
          )}
          {/* sigle route */}
          {routesArray?.length === 1 && (
            <div
              style={{
                transform: `translateY(-10px)`,
                marginBottom: `-${10 + routesArray.length * 20}px`,
              }}
              className="syn-spot-mobile-route-pools-1">
              {routesArray?.[0]?.map((route, index) => (
                <div
                  style={{
                    transform: `translateY(-${(index + 1) * 20}px)`,
                  }}
                  className="syn-spot-mobile-route-pool-1-line"
                  key={`route_${index}`}>
                  <SpotMobilePool route={route} />
                </div>
              ))}
            </div>
          )}
          {/* two route */}
          {/* && routesArray?.length === 2 */}
          {middleToken && routesArray?.length === 2 && (
            <div
              style={{
                marginBottom: `7px`,
              }}
              className="syn-spot-mobile-route-pools-2">
              <Flex justify="space-between" className="syn-spot-mobile-route-pools-2-top">
                <div className={classNames('syn-spot-mobile-route-pools-2-item', 'left')}>
                  {routesArray[0]?.map((route, index) => (
                    <div className="syn-spot-mobile-route-pool-2" key={`route_${index}`}>
                      <SpotMobilePool route={route} />
                    </div>
                  ))}
                </div>
                <div className={classNames('syn-spot-mobile-route-pools-2-item', 'right')}>
                  {routesArray[1]?.map((route, index) => (
                    <div className="syn-spot-mobile-route-pool-2" key={`route_${index}`}>
                      <SpotMobilePool route={route} />
                    </div>
                  ))}
                </div>
              </Flex>
              <div className="syn-spot-mobile-route-pools-2-bottom">
                <SpotToken token={middleToken} type="middle" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SpotMobileRoute;
