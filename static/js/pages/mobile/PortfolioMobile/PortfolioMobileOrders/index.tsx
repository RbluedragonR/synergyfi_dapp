/**
 * @description Component-PortfolioMobileOrders
 */
import './index.less';

import { MarketType } from '@synfutures/sdks-perp';
import classNames from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Empty from '@/components/Empty';
import TokenPair from '@/components/TokenPair';
import { GlobalModalType } from '@/constants';
import { OPEN_ORDER_QUERY_KEY } from '@/constants/trade';
import { useWrappedOrderListByUser } from '@/features/account/orderHook';
import { clickOpenSettledPairModal } from '@/features/portfolio/actions';
import { useAppDispatch } from '@/hooks';
import { useChainId, useChainShortName, useUserAddr } from '@/hooks/web3/useChain';
import TradeSide from '@/pages/components/TradeSide';

import { useToggleModal } from '@/features/global/hooks';
import { useIsFetchedPortfolioList } from '@/features/portfolio/hook';
import { useNavigate } from 'react-router-dom';
import PortfolioMobilePositionsSkeleton from '../PortfolioMobilePositions/PortfolioMobilePositionsSkeleton';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PortfolioMobileOrders: FC<IPropTypes> = function () {
  const chainId = useChainId();
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  const chainName = useChainShortName(chainId);
  const orders = useWrappedOrderListByUser(chainId, userAddr, false);
  const isFetchedPortfolio = useIsFetchedPortfolioList(chainId, userAddr);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toggleModal = useToggleModal(GlobalModalType.MOBILE_TRADE);
  return (
    <div className="syn-portfolio-mobile-orders">
      {!isFetchedPortfolio && !orders?.length && <PortfolioMobilePositionsSkeleton />}
      {orders?.map((order) => (
        <div
          onClick={() => {
            if (!order.rootPair.isNormalPair) {
              chainId &&
                userAddr &&
                dispatch(clickOpenSettledPairModal({ chainId, userAddr, portfolio: order.rootPortfolio }));
              return;
            }
            toggleModal(true);
            navigate(`/trade/${chainName}/${order.rootPair.symbol}`);
            localStorage.setItem(OPEN_ORDER_QUERY_KEY, 'true');
          }}
          key={order.id}
          className={classNames(
            'syn-portfolio-mobile-orders-order',
            order.rootInstrument.isNormalInstrument ? '' : 'emergency',
          )}>
          <div className="syn-portfolio-mobile-orders-order-top">
            <TokenPair
              baseToken={order.rootInstrument.baseToken}
              quoteToken={order.rootInstrument.quoteToken}
              instrumentAddr={order.rootInstrument.instrumentAddr}
              marketType={order.rootInstrument.market.info.type as MarketType}
              isInverse={order.rootInstrument?.isInverse}
              isShowExpiryTag={true}
              showLeverage={true}
              verticalMode
              leverage={order.rootPair.maxLeverage}
              expiry={order.rootPair.expiry}
              tokenSize={32}
            />
            {!order.rootPair?.isNormalPair && <>{order.rootInstrument.isNormalInstrument ? <>💰</> : <>🚧 </>}</>}
            <TradeSide side={order.wrappedSide} />
          </div>
          <div className="syn-portfolio-mobile-orders-order-bottom">
            <dl>
              <dt>
                {t('mobile.filledSize')} ({order.rootInstrument.baseToken.symbol})
              </dt>
              <dd>
                {order.wrapAttribute('taken').abs().formatNumberWithTooltip()}
                <div>{` / `}</div>
                {order.wrapAttribute('size').abs().formatNumberWithTooltip({ isShowTBMK: true })}
              </dd>
            </dl>
            <dl>
              <dt>{t('mobile.price')}</dt>
              <dd>{order.wrapAttribute('limitPrice').formatPriceNumberWithTooltip()}</dd>
            </dl>
            <dl>
              <dt>{t('mobile.leverage')}</dt>
              <dd>{order.wrapAttribute('leverageWad').formatLeverageWithTooltip()}</dd>
            </dl>
          </div>
        </div>
      ))}
      {isFetchedPortfolio && !orders?.length && <Empty type="vertical" />}
    </div>
  );
};

export default PortfolioMobileOrders;
