/**
 * @description Component-TradeOrdersMobile
 */
import './index.less';

import _ from 'lodash';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import Drawer from '@/components/Drawer';
import Empty from '@/components/Empty';
import { Skeleton } from '@/components/Skeleton';
import { Tooltip } from '@/components/ToolTip';
import { FETCHING_STATUS } from '@/constants';
import { WrappedOrder } from '@/entities/WrappedOrder';
import { useWrappedOrderList } from '@/features/account/orderHook';
import { useWrappedPortfolioByPairId } from '@/features/account/portfolioHook';
import { useGlobalConfig, useIsIpBlocked } from '@/features/global/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useIsFetchedPortfolioList } from '@/features/portfolio/hook';
import { cancelTradeOrders } from '@/features/trade/actions';
import { useCancelFormStatus } from '@/features/trade/hooks';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useAppProvider, useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useDappChainConfig, useUserAddr } from '@/hooks/web3/useChain';
import { useSwitchNetwork } from '@/hooks/web3/useSwitchConnectorNetwork';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import TradeSide from '@/pages/components/TradeSide';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TradeOrdersMobile: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  const currentPair = useCurrentPairFromUrl(chainId);
  const sdkContext = useSDK(chainId);
  const provider = useAppProvider();
  const ipBlocked = useIsIpBlocked();
  const { deadline } = useGlobalConfig(chainId);
  const signer = useWalletSigner();
  const portfolio = useWrappedPortfolioByPairId(chainId, userAddr, currentPair?.id);
  const openOrders = useWrappedOrderList(chainId, userAddr, currentPair?.id);
  const isFetchedPortfolio = useIsFetchedPortfolioList(chainId, userAddr);

  const cancelStatuses = useCancelFormStatus(chainId);
  const [selectedOrder, setSelectedOrder] = useState<WrappedOrder | undefined>(undefined);
  const status = useMemo(() => _.get(cancelStatuses, [selectedOrder?.id || '']), [selectedOrder, cancelStatuses]);
  const walletStatus = useWalletConnectStatus();
  const { switchWalletNetwork } = useSwitchNetwork();
  const dappConfig = useDappChainConfig(chainId);
  const cancelOrders = useCallback(
    async (orders: WrappedOrder[]) => {
      if (chainId && userAddr && sdkContext && signer && portfolio && deadline && provider) {
        try {
          if (walletStatus === WALLET_CONNECT_STATUS.WRONG_NETWORK) {
            await switchWalletNetwork(chainId);
            return;
          }
          const result = await dispatch(
            cancelTradeOrders({
              chainId,
              userAddr,
              sdkContext,
              signer,
              portfolio,
              orders: orders,
              deadline: Number(deadline),
              provider,
            }),
          ).unwrap();
          if (result) {
            setSelectedOrder(undefined);
          }
        } catch (e) {}
      }
    },
    [chainId, deadline, dispatch, portfolio, provider, sdkContext, signer, switchWalletNetwork, userAddr, walletStatus],
  );
  if (!isFetchedPortfolio) {
    return (
      <div className="syn-trade-orders-mobile-skeleton">
        <div className="syn-trade-orders-mobile-skeleton-top">
          <Skeleton active={true} paragraph={false} />
          <Skeleton active={true} paragraph={false} />
        </div>
        <div className="syn-trade-orders-mobile-skeleton-row">
          <Skeleton active={true} paragraph={false} />
          <Skeleton active={true} paragraph={false} />
          <Skeleton active={true} paragraph={false} />
        </div>
      </div>
    );
  }
  return (
    <div className="syn-trade-orders-mobile">
      {openOrders?.map((order) => {
        const cancelStatus = _.get(cancelStatuses, [order?.id || '']);
        return (
          <div onClick={() => setSelectedOrder(order)} key={order.id} className="syn-trade-orders-mobile-order">
            <div className="syn-trade-orders-mobile-order-top">
              <TradeSide side={order.wrappedSide} />
              <Tooltip showOnMobile={true} title={ipBlocked ? t('') : undefined}>
                <Button
                  ghost
                  disabled={ipBlocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelOrders([order]);
                  }}
                  loading={cancelStatus === FETCHING_STATUS.FETCHING}
                  className="syn-trade-open-orders-cancel-btn">
                  {t(walletStatus === WALLET_CONNECT_STATUS.WRONG_NETWORK ? 'common.switchToChain' : 'common.cancel', {
                    chainName: dappConfig?.network?.name || '',
                  })}
                </Button>
              </Tooltip>
            </div>
            <div className="syn-trade-orders-mobile-order-bottom">
              <dl>
                <dt>
                  {t('common.table.filledOrSize')} ({order.rootPair.rootInstrument.baseToken.symbol})
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
        );
      })}
      {!openOrders?.length && <Empty type="vertical" />}
      <Drawer
        onClose={() => setSelectedOrder(undefined)}
        title={t('mobile.details')}
        open={!!selectedOrder}
        className="syn-trade-orders-mobile-drawer reverse-header">
        {selectedOrder && (
          <>
            <div className="syn-trade-orders-mobile-drawer-details">
              <dl>
                <dt>{t('mobile.side')}</dt>
                <dd>
                  <TradeSide side={selectedOrder?.wrappedSide} />
                </dd>
              </dl>
              <dl>
                <dt>{t('mobile.price')}</dt>
                <dd className="bold"> {selectedOrder?.wrapAttribute('limitPrice').formatPriceNumberWithTooltip()}</dd>
              </dl>
              <dl>
                <dt>{t('mobile.filledSize')}</dt>
                <dd className="bold">
                  {selectedOrder.wrapAttribute('taken').abs().formatNumberWithTooltip()}
                  <div>{` / `}</div>
                  {selectedOrder.wrapAttribute('size').abs().formatNumberWithTooltip({ isShowTBMK: true })}
                  {selectedOrder.rootInstrument.baseToken.symbol}
                </dd>
              </dl>
              <dl>
                <dt>{t('mobile.margin')}</dt>
                <dd>
                  {selectedOrder.wrapAttribute('balance').formatNumberWithTooltip({
                    suffix: selectedOrder.rootInstrument.marginToken.symbol,
                  })}
                </dd>
              </dl>
              <dl>
                <dt>{t('mobile.leverage')}</dt>
                <dd>{selectedOrder.wrapAttribute('leverageWad').formatLeverageWithTooltip()}</dd>
              </dl>
              <dl>
                <dt>{t('mobile.closeP.tradeVal')}</dt>
                <dd>
                  {selectedOrder.tradeValue.formatNumberWithTooltip({
                    suffix: selectedOrder.rootInstrument.marginToken.symbol,
                  })}
                </dd>
              </dl>
              <dl>
                <dt>{t('mobile.closeP.feeRebate')}</dt>
                <dd className="bold">
                  {selectedOrder.rebateFee.formatNumberWithTooltip()}
                  {selectedOrder.rootInstrument.marginToken.symbol}
                </dd>
              </dl>
            </div>
            <Button
              type="outline"
              onClick={() => cancelOrders([selectedOrder])}
              loading={status === FETCHING_STATUS.FETCHING}
              disabled={status === FETCHING_STATUS.FETCHING}
              className="syn-trade-orders-mobile-drawer-cancel-btn">
              {t('mobile.closeP.cancelOrder')}
            </Button>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default TradeOrdersMobile;
