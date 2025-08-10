/**
 * @description Component-AccountHistory
 */
import './index.less';

import classNames from 'classnames';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as RefreshIcon } from '@/assets/svg/icon_refresh_linear.svg';
import { Button } from '@/components/Button';
import CsvExportButton from '@/components/Button/CsvExportButton';
import { HISTORY_TYPE } from '@/constants/history';
import {
  useHistoryRange,
  useInfiniteAccountBalanceHistory,
  useInfiniteFundingHistory,
  useInfiniteLiquidityHistory,
  useInfiniteOrdersHistory,
  useInfiniteTransferHistory,
  useInfiniteVirtualTradeHistory,
} from '@/features/graph/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import { useBackendChainConfig } from '@/features/config/hook';
import HistoryRefreshSimple from './HistoryRefreshSimple';
import HistoryTable from './HistoryTable';
import HistoryTableRangeSelector from './HistoryTable/HistoryTableRangeSelector';

const AccountHistory: FC = function () {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const dappConfig = useBackendChainConfig(chainId);
  const [historyType, setHistoryType] = useState(HISTORY_TYPE.TRADE);
  const timeRange = useHistoryRange();
  const {
    refreshData: refreshTradeHistory,
    histories: tradeHistories,
    queryState: { fetchNextPage: fetchNextTradePage, isLoading: isLoadingTrade },
  } = useInfiniteVirtualTradeHistory({
    chainId,
    userAddr,
    pair: 'all',
    timeRange,
  });
  const {
    refreshData: refreshOrderHistory,
    histories: orderHistories,
    queryState: { fetchNextPage: fetchNextOrderPage, isLoading: isLoadingOrder },
  } = useInfiniteOrdersHistory({ chainId, userAddr });
  const {
    refreshData: refreshLiquidityHistory,
    histories: liquidityHistories,
    queryState: { fetchNextPage: fetchNextLiquidityPage, isLoading: isLoadingLiquidity },
  } = useInfiniteLiquidityHistory({ chainId, userAddr, pair: 'all', timeRange });
  const {
    refreshData: refreshFundingHistory,
    histories: fundingHistories,
    queryState: { fetchNextPage: fetchNextFundingPage, isLoading: isLoadingFunding },
  } = useInfiniteFundingHistory({ chainId, userAddr, pair: 'all', timeRange });
  const {
    refreshData: refreshTransferHistory,
    histories: transferHistories,
    queryState: { fetchNextPage: fetchNextTransferPage, isLoading: isLoadingTransfer },
  } = useInfiniteTransferHistory({ chainId, userAddr, pair: 'all', timeRange });
  const {
    refreshData: refreshAccountBalanceHistory,
    histories: accountBalanceHistories,
    queryState: { fetchNextPage: fetchNextAccountBalancePage, isLoading: isLoadingAccountBalance },
  } = useInfiniteAccountBalanceHistory({ chainId, userAddr, timeRange });
  const [refreshMessageClosed, setRefreshMessageClosed] = useState(false);
  const histories = useMemo(() => {
    switch (historyType) {
      case HISTORY_TYPE.TRADE:
        return tradeHistories;
      case HISTORY_TYPE.ORDERS:
        return orderHistories;
      case HISTORY_TYPE.LIQUIDITY:
        return liquidityHistories;
      case HISTORY_TYPE.FUNDING:
        return fundingHistories;
      case HISTORY_TYPE.TRANSFERS:
        return transferHistories;
      case HISTORY_TYPE.ACCOUNT:
        return accountBalanceHistories;
      default:
        return [];
    }
  }, [
    historyType,
    tradeHistories,
    orderHistories,
    liquidityHistories,
    fundingHistories,
    transferHistories,
    accountBalanceHistories,
  ]);

  const loading = useMemo(() => {
    switch (historyType) {
      case HISTORY_TYPE.TRADE:
        return isLoadingTrade;
      case HISTORY_TYPE.ORDERS:
        return isLoadingOrder;
      case HISTORY_TYPE.LIQUIDITY:
        return isLoadingLiquidity;
      case HISTORY_TYPE.FUNDING:
        return isLoadingFunding;
      case HISTORY_TYPE.TRANSFERS:
        return isLoadingTransfer;
      case HISTORY_TYPE.ACCOUNT:
        return isLoadingAccountBalance;
      default:
        return false;
    }
  }, [
    isLoadingTrade,
    isLoadingOrder,
    isLoadingLiquidity,
    isLoadingFunding,
    isLoadingTransfer,
    isLoadingAccountBalance,
    historyType,
  ]);

  const refreshData = useCallback(() => {
    switch (historyType) {
      case HISTORY_TYPE.TRADE:
        refreshTradeHistory();
        break;
      case HISTORY_TYPE.ORDERS:
        refreshOrderHistory();
        break;
      case HISTORY_TYPE.LIQUIDITY:
        refreshLiquidityHistory();
        break;
      case HISTORY_TYPE.FUNDING:
        refreshFundingHistory();
        break;
      case HISTORY_TYPE.TRANSFERS:
        refreshTransferHistory();
        break;
      case HISTORY_TYPE.ACCOUNT:
        refreshAccountBalanceHistory();
        break;
    }
  }, [
    historyType,
    refreshTradeHistory,
    refreshOrderHistory,
    refreshLiquidityHistory,
    refreshFundingHistory,
    refreshTransferHistory,
    refreshAccountBalanceHistory,
  ]);

  const fetchMoreData = useCallback(() => {
    switch (historyType) {
      case HISTORY_TYPE.TRADE:
        fetchNextTradePage();
        break;
      case HISTORY_TYPE.ORDERS:
        fetchNextOrderPage();
        break;
      case HISTORY_TYPE.LIQUIDITY:
        fetchNextLiquidityPage();
        break;
      case HISTORY_TYPE.FUNDING:
        fetchNextFundingPage();
        break;
      case HISTORY_TYPE.TRANSFERS:
        fetchNextTransferPage();
        break;
      case HISTORY_TYPE.ACCOUNT:
        fetchNextAccountBalancePage();
        break;
      default:
        break;
    }
  }, [
    historyType,
    fetchNextTradePage,
    fetchNextOrderPage,
    fetchNextLiquidityPage,
    fetchNextFundingPage,
    fetchNextTransferPage,
    fetchNextAccountBalancePage,
  ]);

  useEffect(() => {
    setHistoryType(HISTORY_TYPE.TRADE);
  }, [chainId]);

  return (
    <div className={classNames('syn-portfolio-account-history', { lean: refreshMessageClosed })}>
      <div className="syn-portfolio-account-history-header">
        <div className="syn-portfolio-account-history-title">
          <div className="syn-portfolio-account-history-title-left">
            <div className="syn-portfolio-account-history-type-selector">
              <div
                onClick={() => setHistoryType(HISTORY_TYPE.TRADE)}
                className={`syn-portfolio-account-history-type-selector-item ${
                  historyType === HISTORY_TYPE.TRADE ? 'active' : ''
                }`}>
                {t('common.historyC.trade')}
              </div>
              {!dappConfig?.trade?.isDisableLimitOrder && (
                <>
                  <div
                    onClick={() => setHistoryType(HISTORY_TYPE.ORDERS)}
                    className={`syn-portfolio-account-history-type-selector-item ${
                      historyType === HISTORY_TYPE.ORDERS ? 'active' : ''
                    }`}>
                    {t('common.historyC.orders')}
                  </div>
                </>
              )}
              <div
                onClick={() => setHistoryType(HISTORY_TYPE.LIQUIDITY)}
                className={`syn-portfolio-account-history-type-selector-item ${
                  historyType === HISTORY_TYPE.LIQUIDITY ? 'active' : ''
                }`}>
                {t('common.liquidity')}
              </div>
              <div
                onClick={() => setHistoryType(HISTORY_TYPE.FUNDING)}
                className={`syn-portfolio-account-history-type-selector-item ${
                  historyType === HISTORY_TYPE.FUNDING ? 'active' : ''
                }`}>
                {t('common.historyC.funding')}
              </div>
              <div
                onClick={() => setHistoryType(HISTORY_TYPE.TRANSFERS)}
                className={`syn-portfolio-account-history-type-selector-item ${
                  historyType === HISTORY_TYPE.TRANSFERS ? 'active' : ''
                }`}>
                {t('common.historyC.transfers')}
              </div>
              <div
                onClick={() => setHistoryType(HISTORY_TYPE.ACCOUNT)}
                className={`syn-portfolio-account-history-type-selector-item ${
                  historyType === HISTORY_TYPE.ACCOUNT ? 'active' : ''
                }`}>
                {t('common.historyC.account')}
              </div>
            </div>
          </div>
          <div className="syn-portfolio-account-history-title-right">
            <CsvExportButton historyType={historyType} historyTimeRange={timeRange} />
            <Button
              onClick={() => refreshData()}
              icon={<RefreshIcon />}
              disabled={loading}
              className={'syn-HistoryRefresh-btn'}
              type="text">
              {t('common.historyC.refresh')}
            </Button>
            <HistoryTableRangeSelector />
          </div>
        </div>
        <HistoryRefreshSimple onMessageClose={setRefreshMessageClosed} />
      </div>
      <HistoryTable
        historyType={historyType}
        histories={histories}
        fetchMoreData={fetchMoreData}
        loading={loading}
        pageType="portfolio"
        isShowSelector={false}
      />
    </div>
  );
};

export default AccountHistory;
