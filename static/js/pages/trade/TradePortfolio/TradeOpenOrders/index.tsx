/**
 * @description Component-TradeOpenOrders
 */
import './index.less';

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import _ from 'lodash';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import Table from '@/components/Table';
import { useTableColumns } from '@/components/TableCard/tableConfigs';
import { FETCHING_STATUS } from '@/constants';
import { TABLE_TYPES } from '@/constants/global';
import { WrappedOrder } from '@/entities/WrappedOrder';
import { useWrappedPortfolioByPairId } from '@/features/account/portfolioHook';
import { useGlobalConfig, useIsIpBlocked } from '@/features/global/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { cancelTradeOrders, fillLimitOrder, selectOrderToCancel, setIsChosenOrder } from '@/features/trade/actions';
import { useBulkCancelStatus, useCancelFormStatus, useCancelItems, useIsChosenOrder } from '@/features/trade/hooks';
import { useAppProvider, useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useDappChainConfig, useUserAddr } from '@/hooks/web3/useChain';

import { ReactComponent as ChevronRight } from '@/assets/svg/icon_chevron_right.svg';
import { useMockDevTool } from '@/components/Mock';
import { Tooltip } from '@/components/ToolTip';
import { PORTFOLIO_TAB_ITEMS } from '@/constants/portfolio';
import { tableWidthMap } from '@/constants/table';

import LeanMoreToolTip from '@/components/ToolTip/LeanMoreToolTip';
import { useWrappedOrderList } from '@/features/account/orderHook';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import useOpenOrderListWithCreateTime from '@/hooks/portfolio/useOpenOrderListWithCreateTime';
import { useSwitchNetwork } from '@/hooks/web3/useSwitchConnectorNetwork';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as CheckboxOff } from './assets/icon_checkbox_off.svg';
import { ReactComponent as CheckboxOn } from './assets/icon_checkbox_on.svg';
interface IPropTypes {
  isEditing?: boolean;
}
const TradeOpenOrders: FC<IPropTypes> = function ({}) {
  const columnDefs = useTableColumns(TABLE_TYPES.OPEN_ORDERS);
  const ipBlocked = useIsIpBlocked();
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  const isChosenOrder = useIsChosenOrder();
  const currentPair = useCurrentPairFromUrl(chainId);
  const openOrders = useWrappedOrderList(chainId, userAddr, currentPair?.id);
  const openOrdersWithCreateTime = useOpenOrderListWithCreateTime(openOrders);
  const sdkContext = useSDK(chainId);
  const provider = useAppProvider();
  const { deadline } = useGlobalConfig(chainId);
  const signer = useWalletSigner();
  const portfolio = useWrappedPortfolioByPairId(chainId, userAddr, currentPair?.id);
  const cancelItems = useCancelItems(chainId, userAddr, currentPair?.id);
  const cancelStatuses = useCancelFormStatus(chainId);
  const walletStatus = useWalletConnectStatus();
  const { switchWalletNetwork } = useSwitchNetwork();
  const bulkCancelling = useBulkCancelStatus(chainId);
  const navigate = useNavigate();
  const dappConfig = useDappChainConfig(chainId);
  const allSelected = useMemo(
    () => cancelItems?.length && cancelItems?.length === openOrdersWithCreateTime?.length,
    [cancelItems, openOrdersWithCreateTime],
  );
  const goToOrders = useCallback(() => {
    navigate(`/portfolio/${PORTFOLIO_TAB_ITEMS.PORTFOLIO}`);
  }, [navigate]);
  const cancelOrders = useCallback(
    async (orders: WrappedOrder[], bulkCancelling?: boolean) => {
      if (chainId && userAddr && orders && sdkContext && signer && portfolio && deadline && provider) {
        if (walletStatus === WALLET_CONNECT_STATUS.WRONG_NETWORK) {
          await switchWalletNetwork(chainId);
          return;
        }
        dispatch(
          cancelTradeOrders({
            chainId,
            userAddr,
            sdkContext,
            signer,
            portfolio,
            orders: orders,
            deadline: Number(deadline),
            provider,
            bulkCancel: bulkCancelling,
          }),
        );
      }
    },
    [chainId, deadline, dispatch, portfolio, provider, sdkContext, signer, switchWalletNetwork, userAddr, walletStatus],
  );

  const fillOrder = useCallback(
    async (order: WrappedOrder) => {
      if (chainId && userAddr && sdkContext && signer && portfolio && deadline && provider) {
        if (walletStatus === WALLET_CONNECT_STATUS.WRONG_NETWORK) {
          await switchWalletNetwork(chainId);
          return;
        }
        dispatch(
          fillLimitOrder({
            chainId,
            userAddr,
            sdkContext,
            signer,
            portfolio,
            order: order,
            deadline: Number(deadline),
            provider,
          }),
        );
      }
    },
    [chainId, deadline, dispatch, portfolio, provider, sdkContext, signer, switchWalletNetwork, userAddr, walletStatus],
  );

  const selectRow = useCallback(
    (checked: boolean, id: string) => {
      const currentIds = cancelItems?.map((i) => i.id) || [];
      if (chainId && userAddr) {
        dispatch(
          selectOrderToCancel({
            chainId,
            userAddr,
            ids: checked ? [...currentIds, id] : _.without(currentIds, id),
          }),
        );
      }
    },
    [cancelItems, chainId, dispatch, userAddr],
  );
  const selectAll = useCallback(
    (checked: boolean) => {
      const currentIds = openOrdersWithCreateTime?.map((i) => i.id) || [];
      if (chainId && userAddr) {
        dispatch(
          selectOrderToCancel({
            chainId,
            userAddr,
            ids: checked ? currentIds : [],
          }),
        );
      }
    },
    [chainId, dispatch, openOrdersWithCreateTime, userAddr],
  );
  const colDefs = useMemo(() => {
    const orderAction = {
      title: t('common.action'),
      key: 'action',
      align: 'right' as const,
      width: tableWidthMap[TABLE_TYPES.OPEN_ORDERS].action,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (value: any, record: WrappedOrder): JSX.Element | undefined => {
        const cancelStatus = _.get(cancelStatuses, [record.id]);
        const isShowFill = record.size.abs().eq(record.taken.abs());
        return (
          <div className="syn-trade-open-orders-action">
            <Tooltip showOnMobile={true} title={ipBlocked ? t('common.ipBlocker.tooltip') : undefined}>
              <Button
                chainIconProps={
                  chainId && {
                    chainId,
                    width: 13,
                    marginRight: '0px',
                  }
                }
                ghost
                loading={cancelStatus === FETCHING_STATUS.FETCHING}
                disabled={cancelStatus === FETCHING_STATUS.FETCHING || ipBlocked}
                className="syn-trade-open-orders-cancel-btn"
                onClick={() => {
                  isShowFill ? fillOrder(record) : cancelOrders([record]);
                }}>
                {t(
                  walletStatus === WALLET_CONNECT_STATUS.WRONG_NETWORK
                    ? 'common.switchToChain'
                    : isShowFill
                    ? 'common.fill'
                    : 'common.cancel',
                  {
                    chainName: dappConfig?.network?.name || '',
                  },
                )}
              </Button>
            </Tooltip>
          </div>
        );
      },
    };

    const checkboxCol = {
      title: (
        <div className={`syn-trade-open-orders-checkbox-header ${bulkCancelling ? 'disabled' : ''}`}>
          {allSelected ? (
            <CheckboxOn onClick={() => !bulkCancelling && selectAll(false)} />
          ) : (
            <CheckboxOff onClick={() => !bulkCancelling && selectAll(true)} />
          )}{' '}
          {t('common.tradePage.no')}
        </div>
      ),
      key: 'checkbox',
      width: tableWidthMap[TABLE_TYPES.OPEN_ORDERS].checkboxCol,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (value: any, record: WrappedOrder, index: number): JSX.Element | undefined => {
        const cancelStatus = _.get(cancelStatuses, [record.id]);
        const checked = cancelItems?.some((item) => item.id === record.id);
        return (
          <div className="syn-trade-open-orders-checkbox-row">
            {cancelStatus === FETCHING_STATUS.FETCHING ? (
              <Spin size="small" indicator={<LoadingOutlined spin color="#00BFBF" />} />
            ) : (
              <>
                {' '}
                {checked ? (
                  <CheckboxOn onClick={() => selectRow(false, record.id)} />
                ) : (
                  <CheckboxOff
                    className={bulkCancelling ? 'disabled' : ''}
                    onClick={() => !bulkCancelling && selectRow(true, record.id)}
                  />
                )}
              </>
            )}
            {index + 1}
          </div>
        );
      },
    };
    if (isChosenOrder) {
      return [checkboxCol, ...columnDefs];
    } else {
      return [...columnDefs, orderAction];
    }
  }, [
    t,
    bulkCancelling,
    allSelected,
    isChosenOrder,
    cancelStatuses,
    ipBlocked,
    chainId,
    walletStatus,
    dappConfig?.network?.name,
    fillOrder,
    cancelOrders,
    selectAll,
    cancelItems,
    selectRow,
    columnDefs,
  ]);
  const rowClicked = useCallback(() => {
    //TODO
  }, []);
  const { isMockSkeleton } = useMockDevTool();
  useEffect(() => {
    if (chainId) {
      dispatch(setIsChosenOrder({ isChosenOrder: false, chainId }));
    }
    // only depend on these
  }, [dispatch, chainId]);
  if (!openOrdersWithCreateTime?.length) {
    return null;
  }
  return (
    <div className="syn-trade-open-orders-wrap">
      <div className="syn-trade-open-orders-wrap-title">
        {t('common.tradePage.openO')}
        <div className="syn-trade-open-orders-wrap-title-right">
          {isChosenOrder && openOrders?.length ? (
            <>
              <Tooltip showOnMobile={true} title={ipBlocked ? t('common.ipBlocker.tooltip') : undefined}>
                <Button
                  loading={bulkCancelling}
                  size="small"
                  onClick={() => cancelItems && cancelOrders(cancelItems, true)}
                  type="primary"
                  disabled={ipBlocked}
                  chainIconProps={
                    chainId && {
                      chainId,
                      width: 13,
                      marginRight: '0px',
                    }
                  }>
                  {t(walletStatus === WALLET_CONNECT_STATUS.WRONG_NETWORK ? 'common.switchToChain' : 'common.confirm', {
                    chainName: dappConfig?.network?.name || '',
                  })}
                </Button>
              </Tooltip>
              {!bulkCancelling && (
                <Button
                  onClick={() => {
                    chainId && dispatch(setIsChosenOrder({ isChosenOrder: false, chainId }));
                    chainId &&
                      userAddr &&
                      dispatch(
                        selectOrderToCancel({
                          chainId,
                          userAddr,
                          ids: [],
                        }),
                      );
                  }}
                  size="small"
                  ghost>
                  {t('common.exit')}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button size="small" onClick={goToOrders} type="text">
                {' '}
                {t('common.tradePage.allO')}
                <ChevronRight />
              </Button>
              {!!openOrders?.length && (
                <Tooltip showOnMobile={true} title={ipBlocked ? t('common.ipBlocker.tooltip') : undefined}>
                  <Button
                    disabled={ipBlocked}
                    chainIconProps={
                      chainId && {
                        chainId,
                        width: 13,
                        marginRight: '0px',
                      }
                    }
                    size="small"
                    onClick={() => {
                      chainId && dispatch(setIsChosenOrder({ isChosenOrder: true, chainId }));
                      chainId &&
                        userAddr &&
                        dispatch(
                          selectOrderToCancel({
                            chainId,
                            userAddr,
                            ids: openOrders.map((o) => o.id),
                          }),
                        );
                    }}
                    ghost>
                    {t('common.tradePage.bulkC')}
                    <LeanMoreToolTip
                      overlayStyle={{ width: 128 }}
                      title={t('common.tradePage.bulkInfo')}></LeanMoreToolTip>
                  </Button>
                </Tooltip>
              )}
            </>
          )}
        </div>
      </div>
      <Table
        requiredSkeleton
        loading={isMockSkeleton || openOrdersWithCreateTime === undefined}
        className="syn-trade-open-orders"
        sticky={{ offsetHeader: 64 }}
        columns={colDefs}
        dataSource={openOrdersWithCreateTime}
        // rowSelection={isEditing ? rowSelection : undefined}
        pagination={false}
        // emptyDesc={t('common.empty.TradeNow')}
        // emptyDescLink={'/#/trade'}
        rowKey={(record) => record.id}
        onRow={() => ({
          onClick: rowClicked,
        })}
      />
    </div>
  );
};

export default TradeOpenOrders;
