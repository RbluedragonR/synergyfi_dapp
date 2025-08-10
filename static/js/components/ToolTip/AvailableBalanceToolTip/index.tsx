import './index.less';

import { ComponentProps, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ExchangeIcon } from '@/assets/svg';
import { ReactComponent as ArrowRight } from '@/assets/svg/arrow-right.svg';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { useCombinedPairFromUrl } from '@/features/pair/hook';
import { useSimulationBalanceChange } from '@/features/trade/hooks';
import { useIsTokenExchangeHidden } from '@/hooks/trade/useTokenExchange';
import { useChainId } from '@/hooks/web3/useChain';
import BalanceMax from '@/pages/components/BalanceMax';
import WrapETHButton from '@/pages/trade/TradeCard/TradeForm/WrapETHButton';
import useClickExchange from './hooks/useClickExchange';
type AvailableBalanceToolTipProps = {
  gateBalanceBeforeNode?: ReactNode;
  gateBalanceAfterNode: ReactNode;
  walletBalanceBeforeNode?: ReactNode;
  walletBalanceAfterNode: ReactNode;
};
const AvailableBalanceToolTip = ({
  gateBalanceBeforeNode,
  gateBalanceAfterNode,
  walletBalanceBeforeNode,
  walletBalanceAfterNode,
}: AvailableBalanceToolTipProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="syn-available-balance-tooltip">
      <div className="syn-available-balance-tooltip-row">
        <span className="syn-available-balance-tooltip-row-left">{t('common.tradePage.accountB')}</span>
        <span className="syn-available-balance-tooltip-row-right">
          {gateBalanceBeforeNode && (
            <>
              <span className="syn-available-balance-tooltip-text-blue">{gateBalanceBeforeNode}</span>
              <ArrowRight />
            </>
          )}

          {gateBalanceAfterNode}
        </span>
      </div>
      <div className="syn-available-balance-tooltip-row">
        <span className="syn-available-balance-tooltip-row-left">{t('common.wb')}</span>
        <span className="syn-available-balance-tooltip-row-right">
          {walletBalanceBeforeNode && (
            <>
              <span className="syn-available-balance-tooltip-text-blue">{walletBalanceBeforeNode}</span>
              <ArrowRight />
            </>
          )}

          {walletBalanceAfterNode}
        </span>
      </div>
    </div>
  );
};
type AvailableBalanceProp = {
  balanceMaxProps?: ComponentProps<typeof BalanceMax>;
  hideBalanceMax?: boolean;
};
export const AvailableBalance = ({ balanceMaxProps, hideBalanceMax }: AvailableBalanceProp): JSX.Element => {
  const { t } = useTranslation();
  const chainId = useChainId();
  // const userAddr = useUserAddr();
  const currentPair = useCombinedPairFromUrl(chainId);
  // useListenGateEvent(chainId, userAddr);
  const {
    gateBalanceBefore,
    gateBalanceAfter,
    walletBalanceBefore,
    walletBalanceAfter,
    totalBalanceBefore,
    totalBalanceAfter,
    isShowTotalBalanceChange,
  } = useSimulationBalanceChange(chainId, currentPair?.rootInstrument?.quoteToken);
  const isTokenExchangeHidden = useIsTokenExchangeHidden(currentPair?.rootInstrument?.quoteToken.symbol);
  const { handleClickExchange } = useClickExchange();
  return (
    <div className="syn-available-balance">
      <div className="syn-available-balance-left">
        {t('common.availableBalanceTile.shortTitle')}
        {balanceMaxProps && <BalanceMax {...balanceMaxProps} />}
      </div>
      <div className="syn-available-balance-right">
        {isShowTotalBalanceChange ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <UnderlineToolTip
              overlayStyle={{ width: '360px', minWidth: '360px' }}
              overlayInnerStyle={{ width: '360px', padding: 16 }}
              title={
                <AvailableBalanceToolTip
                  gateBalanceBeforeNode={gateBalanceBefore?.formatNumberWithTooltip()}
                  gateBalanceAfterNode={gateBalanceAfter?.formatNumberWithTooltip({
                    suffix: currentPair?.rootInstrument.quoteToken.symbol,
                  })}
                  walletBalanceBeforeNode={walletBalanceBefore?.formatNumberWithTooltip()}
                  walletBalanceAfterNode={walletBalanceAfter?.formatNumberWithTooltip({
                    suffix: currentPair?.rootInstrument.quoteToken.symbol,
                  })}
                />
              }>
              {totalBalanceBefore?.formatDisplayNumber()}
            </UnderlineToolTip>
            <ArrowRight />
            <span className="syn-available-balance-text-primary">
              {totalBalanceAfter?.formatDisplayNumber()}
              &nbsp;
              {currentPair?.rootInstrument.quoteToken.symbol}
            </span>
          </div>
        ) : (
          <span className="syn-available-balance-text-primary">
            <UnderlineToolTip
              overlayStyle={{ width: '300px', minWidth: '300px' }}
              overlayInnerStyle={{ width: '300px', padding: 16 }}
              title={
                <AvailableBalanceToolTip
                  gateBalanceAfterNode={gateBalanceAfter?.formatNumberWithTooltip({
                    suffix: currentPair?.rootInstrument.quoteToken.symbol,
                  })}
                  walletBalanceAfterNode={walletBalanceAfter?.formatNumberWithTooltip({
                    suffix: currentPair?.rootInstrument.quoteToken.symbol,
                  })}
                />
              }>
              {totalBalanceAfter?.formatDisplayNumber()}
            </UnderlineToolTip>
            &nbsp;
            {currentPair?.rootInstrument.quoteToken.symbol}
          </span>
        )}
        {!isTokenExchangeHidden && (
          <button className="syn-available-balance-exchange-btn" onClick={handleClickExchange}>
            <ExchangeIcon />
            {t('common.exchange')}
          </button>
        )}
        {!hideBalanceMax && <WrapETHButton quote={currentPair?.rootInstrument?.quoteToken} />}
      </div>
    </div>
  );
};
