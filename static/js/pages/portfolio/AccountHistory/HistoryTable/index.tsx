/**
 * @description Component-DayTable
 */
import './index.less';

import { useDebounceFn } from 'ahooks';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as RefreshIcon } from '@/assets/svg/icon_refresh_linear.svg';
import { Button } from '@/components/Button';
import CsvExportButton from '@/components/Button/CsvExportButton';
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/SkeletonTable';
import type { TableSticky } from '@/components/Table';
import Table from '@/components/Table';
import { DEFAULT_HISTORY_PAGE_SIZE_LOCAL, HISTORY_RANGE, HISTORY_TYPE } from '@/constants/history';
import { WrappedPair } from '@/entities/WrappedPair';
import { useHistoryRange } from '@/features/graph/hooks';
import { useStickyObserver } from '@/hooks/useStickyPin';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import {
  IAccountBalanceHistory,
  IFundingHistory,
  ILiquidityHistory,
  IOrderHistory,
  ITradeHistory,
  ITransferHistory,
} from '@/types/graph';

import TradeHistoryTabs from '@/pages/trade/TradePortfolio/common';
import HistoryRefreshSimple from '../HistoryRefreshSimple';
import { useHistoryTableColumns } from '../tableConfigs';
import HistoryTableRangeSelector from './HistoryTableRangeSelector';

interface IPropTypes {
  pair?: WrappedPair;
  historyType: HISTORY_TYPE;
  histories:
    | ITradeHistory[]
    | IOrderHistory[]
    | IFundingHistory[]
    | ITransferHistory[]
    | ILiquidityHistory[]
    | IAccountBalanceHistory[];
  showPair?: boolean;
  loading: boolean;
  rowCount?: number;
  pageType?: 'portfolio' | 'trade';
  isShowSelector?: boolean;
  refresh?: () => void;
  showTradeHistoryTabs?: boolean;
  sticky?: boolean | TableSticky;
  fetchMoreData?: () => void;
}
const HistoryTable: FC<IPropTypes> = function ({
  pair,
  historyType,
  histories,
  showPair = true,
  rowCount = 2,
  loading,
  pageType = 'trade',
  isShowSelector = true,
  refresh,
  sticky,
  fetchMoreData,
  showTradeHistoryTabs = false,
}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const [messageClosed, setMessageClosed] = useState(false);
  const timeRange = useHistoryRange();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(300);
  const [scrollX, setScrollX] = useState(600);
  const [page, setPage] = useState(1);

  const filteredHistories = useMemo(() => {
    const current = moment.utc();
    const currentTime = current.valueOf() / 1000;
    return _.filter(
      histories,
      (
        h:
          | ITradeHistory
          | IOrderHistory
          | IFundingHistory
          | ITransferHistory
          | ILiquidityHistory
          | IAccountBalanceHistory,
      ) => {
        const time = moment((h?.timestamp || 0) * 1000);
        switch (timeRange) {
          case HISTORY_RANGE.ALL:
            return true;
          case HISTORY_RANGE.D_1:
            return currentTime - (h.timestamp || 0) <= 60 * 60 * 24;
          case HISTORY_RANGE.D_7:
            return currentTime - (h.timestamp || 0) <= 60 * 60 * 24 * 7;
          case HISTORY_RANGE.M_1:
            return current.month() - time.month() <= 1;
          case HISTORY_RANGE.M_3:
            return current.month() - time.month() <= 3;
          default:
            return true;
        }
      },
    );
  }, [histories, timeRange]);

  const localHistories = useMemo(
    () => filteredHistories.slice(0, page * DEFAULT_HISTORY_PAGE_SIZE_LOCAL),
    [filteredHistories, page],
  );

  const pairs = useMemo(
    () => _.uniq(filteredHistories.map((history) => history?.pair).filter((h) => h !== undefined)),
    [filteredHistories],
  );

  const quotes = useMemo(() => {
    const quotes = _.uniqBy(
      filteredHistories.map((history) => (history as IAccountBalanceHistory)?.quote).filter((h) => h !== undefined),
      'address',
    );
    return quotes;
  }, [filteredHistories]);

  useStickyObserver('.syn-history-table-header', 48);
  const columnDefs = useHistoryTableColumns(historyType, pairs, quotes, showPair);
  const setTableParams = useCallback(() => {
    if (containerRef.current) {
      const scrollY =
        containerRef.current.offsetHeight - (selectorRef.current ? selectorRef.current.offsetHeight + 49 : 0);
      setScrollY(scrollY > 1000 ? 1000 : scrollY < 300 ? 300 : scrollY);
      setScrollX(containerRef.current.offsetWidth);
    }
  }, [setScrollX, setScrollY]);

  const { run: fetchMoreDataDebounce } = useDebounceFn(
    () => {
      fetchMoreData && fetchMoreData();
    },
    { wait: 100 },
  );

  useEffect(() => {
    let timeOut: NodeJS.Timeout;
    if (!loading) {
      timeOut = setTimeout(() => setTableParams(), 0);
      window.onresize = setTableParams;
    }
    return () => timeOut && clearTimeout(timeOut);
    //  must depend on historyType
  }, [loading, historyType]);
  const { run: onScroll } = useDebounceFn(
    (e: Event) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLTableSectionElement;
      if (scrollTop + clientHeight === scrollHeight) {
        fetchMoreDataDebounce();
        setPage((pre) => pre + 1);
      }
    },
    { wait: 20 },
  );
  useEffect(() => {
    if (!loading && !!filteredHistories.length) {
      const el = document.querySelector('#historyTable .ant-table-tbody-virtual-holder') as HTMLTableSectionElement;
      if (el) {
        el.addEventListener('scroll', onScroll);
      }
    }
  }, [loading, fetchMoreDataDebounce]);

  useEffect(() => {
    setPage(1);
  }, [chainId, historyType, timeRange, userAddr]);
  const emptyDescProps = useMemo(() => {
    if (pageType === 'portfolio' && historyType === HISTORY_TYPE.LIQUIDITY) {
      return {
        emptyDesc: t('common.empty.EarnNow'),
        emptyDescLink: '/#/earn',
      };
    }
    return {
      emptyDesc: pageType === 'portfolio' ? t('common.empty.TradeNow') : undefined,
      emptyDescLink: pageType === 'portfolio' ? '/#/trade' : undefined,
    };
  }, [historyType, pageType, t]);
  return (
    <div
      className={classNames('syn-history-table', {
        lean: messageClosed,
        'syn-show-trade-history-tabs': showTradeHistoryTabs,
      })}
      ref={containerRef}>
      {isShowSelector && (
        <div ref={selectorRef} className="syn-history-table-header">
          <div className="syn-history-table-header-top">
            {showTradeHistoryTabs && <TradeHistoryTabs />}

            {!showTradeHistoryTabs && <HistoryTableRangeSelector />}
            <div className="syn-history-table-header-top-right">
              <CsvExportButton historyType={historyType} historyTimeRange={timeRange} pair={pair} />

              <Button icon={<RefreshIcon />} type="text" onClick={refresh}>
                {t('common.historyC.refresh')}{' '}
              </Button>
              {showTradeHistoryTabs && <HistoryTableRangeSelector />}
            </div>
          </div>
          <HistoryRefreshSimple onMessageClose={setMessageClosed} />
        </div>
      )}
      <SkeletonTable rowCount={rowCount} loading={loading} columns={columnDefs as SkeletonTableColumnsType[]}>
        <Table
          columns={columnDefs}
          pagination={false}
          id="historyTable"
          dataSource={localHistories}
          showUnconnected={false}
          sticky={sticky}
          rowKey={(
            record:
              | ITradeHistory
              | IOrderHistory
              | IFundingHistory
              | ITransferHistory
              | ILiquidityHistory
              | IAccountBalanceHistory,
          ) => record.txHash + record.logIndex}
          virtual={!!localHistories.length}
          scroll={localHistories.length ? { x: scrollX, y: scrollY } : undefined}
          {...emptyDescProps}
        />
      </SkeletonTable>
    </div>
  );
};

export default HistoryTable;
