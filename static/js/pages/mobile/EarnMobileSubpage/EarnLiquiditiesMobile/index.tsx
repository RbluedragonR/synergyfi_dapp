/**
 * @description Component-EarnLiquiditiesMobile
 */
import { useWrappedRangeList } from '@/features/account/rangeHook';
import { usePairFromUrl } from '@/features/pair/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import './index.less';

import { Button } from '@/components/Button';
import Drawer from '@/components/Drawer';
import Empty from '@/components/Empty';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { Skeleton } from '@/components/Skeleton';
import { Tooltip } from '@/components/ToolTip';
import { EARN_TYPE } from '@/constants/earn';
import { setCurrentRange, setEarnFormType } from '@/features/earn/action';
import { useIsIpBlocked } from '@/features/global/hooks';
import { useIsFetchedSinglePortfolio } from '@/features/portfolio/hook';
import { useAppDispatch } from '@/hooks';
import LiquidationPrices from '@/pages/components/LiquidationPrices';
import EarnForm from '@/pages/earn/EarnCard/EarnForm';
import PriceRange from '@/pages/earn/EarnLiquidities/PriceRange';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const EarnLiquiditiesMobile: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const ipBlocked = useIsIpBlocked();
  const currentPair = usePairFromUrl(chainId);
  const rangeList = useWrappedRangeList(chainId, userAddr, currentPair?.id);
  const isFetchedPortfolio = useIsFetchedSinglePortfolio(
    chainId,
    userAddr,
    currentPair?.instrumentAddr,
    currentPair?.expiry,
  );

  const [openDrawer, setOpenDrawer] = useState(false);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  if (!isFetchedPortfolio) {
    return (
      <div className="syn-earn-liquidities-mobile-skeleton">
        <div className="syn-earn-liquidities-mobile-skeleton-top">
          <Skeleton active={true} paragraph={false} />
          <Skeleton active={true} paragraph={false} />
        </div>
        <div className="syn-earn-liquidities-mobile-skeleton-row">
          <Skeleton active={true} paragraph={false} />
          <Skeleton active={true} paragraph={false} />
          <Skeleton active={true} paragraph={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="syn-earn-liquidities-mobile">
      {rangeList?.map((range) => (
        <div key={range.id} className="syn-earn-liquidities-mobile-item">
          <div className="syn-earn-liquidities-mobile-item-top">
            <PriceRange
              minPrice={range.wrapAttribute('lowerPrice')}
              maxPrice={range.wrapAttribute('upperPrice')}
              pairId={range.rootPair.id}
              isInverse={range.rootInstrument.isInverse}
              fairPrice={range.rootPair.wrapAttribute('fairPrice')}
            />
            <Tooltip showOnMobile={true} title={ipBlocked ? t('common.ipBlocker.tooltip') : undefined}>
              <Button
                ghost
                disabled={ipBlocked}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDrawer(true);
                  if (chainId) {
                    chainId &&
                      dispatch(
                        setCurrentRange({
                          chainId,
                          rangeId: range.id,
                        }),
                      );
                    dispatch(setEarnFormType({ chainId, formType: EARN_TYPE.REMOVE_LIQ }));
                  }
                }}
                className="syn-trade-open-orders-cancel-btn">
                {t('common.remove')}
              </Button>
            </Tooltip>
          </div>
          <div className="syn-earn-liquidities-mobile-item-bottom">
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
      {!rangeList?.length && <Empty type="vertical" />}
      <Drawer
        destroyOnClose={true}
        onClose={() => {
          setOpenDrawer(false);
          if (chainId) {
            dispatch(setEarnFormType({ chainId, formType: EARN_TYPE.ADD_LIQ }));
            dispatch(
              setCurrentRange({
                chainId,
                rangeId: '',
              }),
            );
          }
        }}
        open={openDrawer}
        styles={{ header: { display: 'none' } }}
        className="syn-earn-liquidities-mobile-drawer reverse-header">
        <EarnForm
          isRemove={true}
          onClose={() => {
            setOpenDrawer(false);
          }}
        />
      </Drawer>
    </div>
  );
};

export default EarnLiquiditiesMobile;
