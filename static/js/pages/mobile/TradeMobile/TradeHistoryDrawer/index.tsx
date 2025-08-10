/**
 * @description Component-TradeHistoryDrawer
 */
import './index.less';

import React, { FC, useCallback, useEffect, useState } from 'react';

import SubPageWrap from '@/components/SubPage';
import { HISTORY_TYPE } from '@/constants/history';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import { useBackendChainConfig } from '@/features/config/hook';
import {
  useInfiniteFundingHistory,
  useInfiniteOrdersHistory,
  useInfiniteVirtualTradeHistory,
} from '@/features/graph/hooks';
import HistoryDrawerHeader from '../../components/HistoryDrawerHeader';
import FundingHistoryMobile from './FundingHistoryMobile';
import OrderHistoryMobile from './OrderHistoryMobile';
import TradeHistoryDrawerTabs from './TradeHistoryDrawerTabs';
import TradeHistoryMobile from './TradeHistoryMobile';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  open: boolean;
  historyType: HISTORY_TYPE;
  onClose: () => void;
}
const TradeHistoryDrawer: FC<IPropTypes> = function ({ open, onClose, historyType }) {
  const [tab, setTab] = useState(HISTORY_TYPE.TRADE);
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const currentPair = useCurrentPairFromUrl(chainId);
  const dappConfig = useBackendChainConfig(chainId);
  const { refreshData: refreshTradeHistory } = useInfiniteVirtualTradeHistory({ chainId, userAddr, pair: currentPair });
  const { refreshData: refreshOrderHistory } = useInfiniteOrdersHistory({ chainId, userAddr, pair: currentPair });
  const { refreshData: refreshFundingHistory } = useInfiniteFundingHistory({ chainId, userAddr, pair: currentPair });

  const refreshData = useCallback(() => {
    if (tab === HISTORY_TYPE.TRADE) {
      refreshTradeHistory();
    }
    if (tab === HISTORY_TYPE.ORDERS) {
      refreshOrderHistory();
    }
    if (tab === HISTORY_TYPE.FUNDING) {
      refreshFundingHistory();
    }
  }, [tab, refreshFundingHistory, refreshOrderHistory, refreshTradeHistory]);

  useEffect(() => {
    setTab(historyType);
  }, [historyType]);
  return (
    <SubPageWrap
      className="syn-trade-history-drawer"
      isShowSubPage={open}
      header={<HistoryDrawerHeader onRefresh={refreshData} onClose={onClose} />}
      onClose={() => {
        console.log('');
      }}>
      <div className="syn-trade-history-drawer-container">
        {!(!currentPair?.isPerpetual && dappConfig?.trade.isDisableLimitOrder) && (
          <div className="syn-trade-history-drawer-top">
            <TradeHistoryDrawerTabs tab={tab} onTabChange={setTab} />
          </div>
        )}
        <div className="syn-trade-history-drawer-bottom">
          {tab === HISTORY_TYPE.TRADE && <TradeHistoryMobile />}
          {tab === HISTORY_TYPE.ORDERS && <OrderHistoryMobile />}
          {tab === HISTORY_TYPE.FUNDING && <FundingHistoryMobile />}
        </div>
      </div>
    </SubPageWrap>
  );
};

export default TradeHistoryDrawer;
