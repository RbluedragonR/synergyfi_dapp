import { TABLE_TYPES } from '@/constants/global';
import { useTradePortfolioTab } from '@/features/trade/hooks';
import { setTradePortfolioTab } from '@/features/trade/slice';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import EarnHistory from '@/pages/earn/EarnHistory';
import classNames from 'classnames';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Fundings from '../Fundings';
import OrderHistory from '../OrderHistory';
import TradeHistory from '../TradeHistory';
import Transfers from '../Transfers';
import './index.less';

export default function HistoryWrapper() {
  const tabPosition = useTradePortfolioTab();
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const { t } = useTranslation();
  useEffect(() => {
    chainId && dispatch(setTradePortfolioTab({ tab: TABLE_TYPES.TRADE_HISTORY, chainId }));
  }, [chainId, dispatch]);
  return (
    <div className={classNames('syn-history-wrapper')}>
      <div className={classNames('syn-history-wrapper-title')}>{t('common.history')}</div>
      {tabPosition === TABLE_TYPES.TRADE_HISTORY && <TradeHistory />}
      {tabPosition === TABLE_TYPES.ORDER_HISTORY && <OrderHistory />}
      {tabPosition === TABLE_TYPES.FUNDING && <Fundings />}
      {tabPosition === TABLE_TYPES.LIQUIDITY_HISTORY && <EarnHistory />}
      {tabPosition === TABLE_TYPES.TRANSFERS && <Transfers />}
    </div>
  );
}
