/**
 * @description Component-LeverageAdjust
 */
import FormInput from '@/components/FormInput';
import './index.less';

import Alert from '@/components/Alert';
import Tabs from '@/components/Tabs';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { TradeLeverage } from '@/components/TradeLeverage/TradeLeverage';
import { ERROR_MSG_IMR } from '@/constants/simulation';
import { LEVERAGE_ADJUST_TYPE, TRADE_TYPE } from '@/constants/trade';
import { WrappedPair } from '@/entities/WrappedPair';
import { clearMarketTradeSimulation, setTradeFormAmount } from '@/features/trade/actions';
import { useSimulationBalanceChange } from '@/features/trade/hooks';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { LEVERAGE_ADJUST } from '@/types/storage';
import { TokenInfo } from '@/types/token';
import { savePairLeverage } from '@/utils/localstorage';
import { inputNumChecker } from '@/utils/numberUtil';
import { FC, memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  tradeType: TRADE_TYPE;
  showLeverageSwitch?: boolean;
  pair: WrappedPair | undefined;
  leverage: string;
  leverageInputAmountStrChanged: (leverage: string) => void;
  marginInputAmountStrChanged?: (amount: string) => void;
  adjustTypeChanged?: () => void;
  disabled?: boolean;
  maxLeverage: number;
  quoteToken: TokenInfo | undefined;
  marginAmount?: string;
  leverageAdjustType: LEVERAGE_ADJUST_TYPE;
  simulationMessage?: string;
  simulationErrorData?: string;
}
const LeverageAdjust: FC<IPropTypes> = function ({
  tradeType,
  showLeverageSwitch,
  pair,
  leverage,
  leverageAdjustType,
  leverageInputAmountStrChanged,
  marginInputAmountStrChanged,
  disabled,
  maxLeverage,
  quoteToken,
  marginAmount,
  adjustTypeChanged,
  simulationMessage,
  simulationErrorData,
}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  const tabList = useMemo(
    () => [
      {
        label: t('common.byLeverage'),
        key: LEVERAGE_ADJUST_TYPE.BY_LEVERAGE,
      },
      {
        label: t('common.byAmount'),
        key: LEVERAGE_ADJUST_TYPE.BY_AMOUNT,
      },
    ],
    [t],
  );
  const { totalBalanceBefore } = useSimulationBalanceChange(chainId, pair?.rootInstrument?.quoteToken);
  useEffect(() => {
    if (leverageAdjustType === LEVERAGE_ADJUST_TYPE.BY_AMOUNT) {
      // set margin to 0 when amount initiated
      marginInputAmountStrChanged && marginInputAmountStrChanged('0');
    }
  }, [leverageAdjustType]);
  return (
    <div className="syn-leverage-adjust">
      <div className="syn-leverage-adjust-title">
        <UnderlineToolTip
          title={
            tradeType === TRADE_TYPE.MARKET
              ? leverageAdjustType === LEVERAGE_ADJUST_TYPE.BY_LEVERAGE
                ? t('tooltip.tradePage.leverage')
                : t('tooltip.tradePage.margin')
              : undefined
          }>
          {showLeverageSwitch ? t('common.adjustM') : t('common.adjustLeverage')}
        </UnderlineToolTip>
        {showLeverageSwitch && (
          <div className="syn-leverage-adjust-title-right">
            {t('common.by')}
            <Tabs
              value={leverageAdjustType || LEVERAGE_ADJUST_TYPE.BY_LEVERAGE}
              tabList={tabList}
              onClick={(value) => {
                chainId && dispatch(setTradeFormAmount({ chainId, leverageAdjustType: value as LEVERAGE_ADJUST_TYPE }));
                if (pair && userAddr && chainId) {
                  savePairLeverage(userAddr, chainId, pair?.id, LEVERAGE_ADJUST, value);
                }
                chainId && dispatch(clearMarketTradeSimulation({ chainId }));
                if (value === LEVERAGE_ADJUST_TYPE.BY_LEVERAGE) {
                  adjustTypeChanged && adjustTypeChanged();
                  marginInputAmountStrChanged && marginInputAmountStrChanged('');
                }
              }}
            />
          </div>
        )}
      </div>
      {leverageAdjustType === LEVERAGE_ADJUST_TYPE.BY_LEVERAGE && (
        <TradeLeverage
          leverage={leverage}
          leverageChanged={leverageInputAmountStrChanged}
          chainId={chainId}
          disabled={disabled}
          maxLeverage={maxLeverage}
          tradeType={tradeType}
          pairId={pair?.id}
        />
      )}
      {leverageAdjustType === LEVERAGE_ADJUST_TYPE.BY_AMOUNT && (
        <FormInput
          inputProps={{
            type: 'text',
            pattern: '^[0-9]*[.,]?[0-9]*$',
            inputMode: 'decimal',
            autoComplete: 'off',
            autoCorrect: 'off',
            step: 1e18,
            onKeyDown: (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault(),
          }}
          max={inputNumChecker(totalBalanceBefore?.stringValue || '', quoteToken?.decimals)}
          disabled={disabled}
          tokenInfo={quoteToken}
          suffix={quoteToken?.symbol}
          inputAmountStr={marginAmount || ''}
          inputAmountStrChanged={(value: string) => marginInputAmountStrChanged && marginInputAmountStrChanged(value)}
        />
      )}
      {simulationErrorData === ERROR_MSG_IMR && (
        <Alert
          message={
            <div className="syn-trade-market-form-alert">
              <span>
                {t(simulationErrorData || simulationMessage || '')}
                {'. '}
              </span>
              {/* <a
                    onClick={() => {
                      leverageInputAmountStrChanged(maxLeverage.toString());
                      setLeverageAdjustType(true);
                      setLeverageSwitchChecked(true);
                      if (userAddr && chainId && pair) {
                        savePairLeverage(
                          userAddr,
                          chainId,
                          pair?.id,
                          tradeType,
                          TRADE_LEVERAGE_THRESHOLDS.MAX.toString(),
                        );
                        savePairLeverage(userAddr, chainId, pair?.id, DYNAMIC, '');
                      }
                    }}>
                    {t('common.tradePage.enableLeverage')}
                  </a> */}
            </div>
          }
          type="error"
          showIcon
        />
      )}
    </div>
  );
};

export default memo(LeverageAdjust);
