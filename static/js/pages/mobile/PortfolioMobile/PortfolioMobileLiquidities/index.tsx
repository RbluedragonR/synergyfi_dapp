/**
 * @description Component-PortfolioMobileLiquidities
 */
import { useChainId, useChainShortName, useUserAddr } from '@/hooks/web3/useChain';
import './index.less';

import Empty from '@/components/Empty';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { Skeleton } from '@/components/Skeleton';
import TokenPair from '@/components/TokenPair';
import { GlobalModalType } from '@/constants';
import { useWrappedRangeListByUser } from '@/features/account/rangeHook';
import { useToggleModal } from '@/features/global/hooks';
import { clickOpenSettledPairModal } from '@/features/portfolio/actions';
import { useIsFetchedPortfolioList } from '@/features/portfolio/hook';
import { useAppDispatch } from '@/hooks';
import LiquidationPrices from '@/pages/components/LiquidationPrices';
import PriceRange from '@/pages/earn/EarnLiquidities/PriceRange';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PortfolioMobileLiquidities: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const chainName = useChainShortName(chainId);
  const ranges = useWrappedRangeListByUser(chainId, userAddr, false);
  const isFetchedPortfolio = useIsFetchedPortfolioList(chainId, userAddr);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const items = useMemo(() => new Array(12).fill(0), []);
  const toggleModal = useToggleModal(GlobalModalType.MOBILE_EARN);
  if (!isFetchedPortfolio && !ranges?.length) {
    return (
      <>
        {items.map((i) => (
          <div key={i} className="syn-portfolio-mobile-liquidities-skeleton">
            <div className="syn-portfolio-mobile-liquidities-skeleton-top">
              <Skeleton active={true} paragraph={false} />
              <Skeleton active={true} paragraph={false} />
            </div>
            <div className="syn-portfolio-mobile-liquidities-skeleton-row">
              <Skeleton active={true} paragraph={false} />
              <Skeleton active={true} paragraph={false} />
              <Skeleton active={true} paragraph={false} />
            </div>
          </div>
        ))}
      </>
    );
  }
  return (
    <div className="syn-portfolio-mobile-liquidities">
      {ranges?.map((range) => (
        <div
          onClick={() => {
            if (!range.rootPair.isNormalPair) {
              chainId &&
                userAddr &&
                dispatch(clickOpenSettledPairModal({ chainId, userAddr, portfolio: range.rootPortfolio }));
              return;
            }
            toggleModal(true);
            navigate(`/trade/${chainName}/${range.rootPair.symbol}`);
          }}
          key={range.id}
          className="syn-portfolio-mobile-liquidities-item">
          <div key={range.id} className="syn-portfolio-mobile-liquidities-item-top">
            <TokenPair
              tokenSize={32}
              baseToken={range?.rootInstrument.baseToken}
              quoteToken={range?.rootInstrument.quoteToken}
              isInverse={range?.rootInstrument.isInverse || false}
              expiry={range.rootPair?.expiry}
              showShortPerp={true}
              showOracle={true}
              marketType={range?.rootInstrument.marketType}
              verticalMode
              showLeverage
              leverage={range.rootPair?.maxLeverage}
              isMobile
            />
            <PriceRange
              minPrice={range.wrapAttribute('lowerPrice')}
              maxPrice={range.wrapAttribute('upperPrice')}
              pairId={range.rootPair.id}
              isInverse={range.rootInstrument.isInverse}
              fairPrice={range.rootPair?.wrapAttribute('fairPrice')}
            />
          </div>
          <div key={range.id} className="syn-portfolio-mobile-liquidities-item-bottom">
            <dl>
              <dt>{t('common.earn.valueLocked')}</dt>
              <dd>
                <EmptyDataWrap isLoading={!range}>
                  {range.wrapAttribute('valueLocked').formatNumberWithTooltip({
                    suffix: range.rootInstrument.marginToken.symbol,
                    showToolTip: true,
                  })}
                </EmptyDataWrap>
              </dd>
            </dl>
            <dl>
              <dt>{t('common.earn.feesE')}</dt>
              <dd>
                <EmptyDataWrap isLoading={!range?.feeEarned}>
                  {range.wrapAttribute('feeEarned').formatNumberWithTooltip({
                    suffix: range.rootInstrument.marginToken.symbol,
                  })}
                </EmptyDataWrap>
              </dd>
            </dl>
            <dl>
              <dt>{t('common.liqPrice')}</dt>
              <dd>
                <LiquidationPrices
                  lowerLiqPrice={range.wrappedLowerLiqPrice}
                  upperLiqPrice={range.wrappedUpperLiqPrice}
                />
              </dd>
            </dl>
          </div>
        </div>
      ))}
      {!ranges?.length && <Empty type="vertical" />}
    </div>
  );
};

export default PortfolioMobileLiquidities;
