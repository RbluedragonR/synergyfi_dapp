/**
 * @description Component-SpotSwapDetail
 */
import { useSpotState } from '@/features/spot/store';
import './index.less';

import LoaderIcon from '@/assets/images/loader-s.png';
// import { ReactComponent as ArrowIcon } from '@/assets/svg/icon_arrow.svg';
import { ReactComponent as SwapIcon } from '@/assets/svg/icon_swap.svg';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useSimulateBestAmount } from '@/features/spot/hooks';
import { useSimulateSwap } from '@/features/spot/query';
import { formatUnits } from 'ethers/lib/utils';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import Aero from '../assets/icon_aerodrome.png';
// import ALB from '../assets/icon_crypto_alb.png';
// import Uni from '../assets/icon_oracle_dexv2_uni.svg';
// import Pancake from '../assets/icon_pancakeswap.svg';
// import Sushi from '../assets/icon_sushiswap.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const SpotSwapDetail: FC<IPropTypes> = function ({}) {
  const { sellAmount: amount, token1: buyToken, token0: sellToken } = useSpotState();
  const { t } = useTranslation();
  const [
    showContent,
    // setShowContent
  ] = useState(true);
  const [priceSwap, setPriceSwap] = useState(false);
  // const routeMap = {
  //   [PoolType.AERODROME_V2]: Aero,
  //   [PoolType.PANCAKE_V3]: Pancake,
  //   [PoolType.UNISWAP_V2]: Uni,
  //   [PoolType.AERODROME_V3]: Aero,
  //   [PoolType.UNISWAP_V3]: Uni,
  //   [PoolType.SUSHISWAP_V3]: Sushi,
  //   [PoolType.ALB_V3]: ALB,
  // };
  // const { data: price } = useSpotPairPrice(chainId, sellToken?.address, buyToken?.address);
  const { bestAmount, isFetched } = useSimulateBestAmount();
  const price = useMemo(() => {
    return WrappedBigNumber.from(bestAmount || 0).div(amount);
  }, [amount, bestAmount]);

  const priceInverse = useMemo(
    () => (!priceSwap ? price : WrappedBigNumber.from(1).div(price || 1)),
    [price, priceSwap],
  );
  const { data: simulation } = useSimulateSwap();
  const detail = useMemo(() => simulation?.data || simulation?.nativeSwap, [simulation?.data, simulation?.nativeSwap]);

  // const uniquePools = useMemo(() => _.uniqBy(simulation?.route.flat(), 'poolType'), [simulation?.route]);
  if (WrappedBigNumber.from(amount || 0).eq(0) || simulation?.data?.route.length === 0) {
    return null;
  }
  if (!simulation) {
    return (
      <div className="syn-spot-swap-detail-loading">
        <img src={LoaderIcon} />
      </div>
    );
  }
  if (!detail) {
    return null;
  }

  return (
    <div className="syn-spot-swap-detail">
      {/* <PreLoad images={[Uni, Aero, ALB, Sushi, Pancake]} /> */}
      <div className="syn-spot-swap-detail-top">
        <div className="syn-spot-swap-detail-top-left">
          1 {!priceSwap ? sellToken?.symbol : buyToken?.symbol} ≈{' '}
          {isFetched ? priceInverse?.formatPriceNumberWithTooltip() : '-'}{' '}
          {!priceSwap ? buyToken?.symbol : sellToken?.symbol}
          <SwapIcon className="swap" onClick={() => setPriceSwap(!priceSwap)} />
        </div>
        {/* <ArrowIcon
          className={classNames('arrow', { rotate: !showContent })}
          onClick={() => setShowContent(!showContent)}
        /> */}
      </div>
      <div className="syn-spot-swap-detail-content" style={{ display: showContent ? 'flex' : 'none' }}>
        <dl>
          <dt>{t('common.tradeFormDetails.pi')}</dt>
          <div className="syn-spot-swap-detail-content-divider" />
          <dd> {WrappedBigNumber.from(detail?.priceImpact || 0).formatPercentage()}</dd>
        </dl>
        <dl>
          <dt>{t('common.spot.minReceived')}</dt>
          <div className="syn-spot-swap-detail-content-divider" />
          <dd>
            {' '}
            {WrappedBigNumber.from(
              formatUnits(detail?.minReceivedAmount || '', buyToken.decimals),
            ).formatNumberWithTooltip({
              isShowTBMK: true,
            })}
          </dd>
        </dl>
        {/* <dl>
          <dt>{t('common.spot.eGF')}</dt>
          <div className="syn-spot-swap-detail-content-divider" />
          <dd> {WrappedBigNumber.from(simulation.estimateGasFee).formatNumberWithTooltip({ isShowTBMK: true })}</dd>
        </dl> */}
        {/* <dl>
          <dt>{t('common.spot.route')}</dt>
          <div className="syn-spot-swap-detail-content-divider" />
          <dd>
            {uniquePools.length} {uniquePools.length > 1 ? t('common.spot.steams') : t('common.spot.steam')}
            <span className="zoom">
              {_.uniqBy(uniquePools, 'poolType')?.map((r) => (
                <img key={r.poolType} width={16} height={16} src={_.get(routeMap, [r.poolType])} />
              ))}
            </span>
          </dd>
        </dl> */}
      </div>
      {/* <SpotRoute
        middleTokenAddr={simulation?.tokens.length > 1 ? simulation.tokens[1] : undefined}
        routesArray={simulation.route || []}
      /> */}
    </div>
  );
};

export default SpotSwapDetail;
