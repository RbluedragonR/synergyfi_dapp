import './index.less';

import { Link } from 'react-router-dom';

import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { EARN_TYPE } from '@/constants/earn';
import { TRADE_TYPE } from '@/constants/trade';
import { resetLiquidityFormByChainId, setEarnFormType } from '@/features/earn/action';
import { resetFormByChainId, setTradeFormType } from '@/features/trade/actions';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
type TradeEarnTabsProps = ComponentProps<'div'> & {
  isTrade: boolean;
  pairSymbol?: string;
  disableTrade?: boolean;
};
export default function TradeEarnTabs({ isTrade, pairSymbol, disableTrade = false }: TradeEarnTabsProps) {
  const chainId = useChainId();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  return (
    <div className={classNames('syn-trade-earn-tabs', isTrade ? 'trade' : 'earn')}>
      <Link
        style={{
          pointerEvents: disableTrade ? 'none' : 'auto',
        }}
        onClick={() => {
          chainId && dispatch(resetLiquidityFormByChainId({ chainId }));
          chainId && dispatch(setTradeFormType({ chainId, tradeType: TRADE_TYPE.MARKET }));
        }}
        className={classNames('syn-trade-earn-tab', 'syn-trade-earn-tabs-trade', isTrade ? 'active' : 'inactive')}
        to={(chainId && pairSymbol && `/trade/${DAPP_CHAIN_CONFIGS[chainId]?.network?.shortName}/${pairSymbol}`) || ''}>
        {t('common.trade')}
      </Link>
      <Link
        onClick={() => {
          chainId && dispatch(resetFormByChainId({ chainId }));
          chainId && dispatch(setEarnFormType({ chainId, formType: EARN_TYPE.ADD_LIQ }));
        }}
        className={classNames('syn-trade-earn-tab', 'syn-trade-earn-tabs-earn', !isTrade ? 'active' : 'inactive')}
        to={(chainId && pairSymbol && `/earn/${DAPP_CHAIN_CONFIGS[chainId]?.network?.shortName}/${pairSymbol}`) || ''}>
        {t('common.liquidity')}
      </Link>
    </div>
  );
}
