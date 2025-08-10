import { useMediaQueryDevice } from '@/components/MediaQuery';
import { AvailableBalance } from '@/components/ToolTip/AvailableBalanceToolTip';
import { TradeLeverage } from '@/components/TradeLeverage/TradeLeverage';
import { MANAGE_SIDE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { useAppSelector } from '@/hooks';
import useMarginAdjustByLeverage from '@/hooks/trade/MarginAdjust/useMarginAdjustByLeverage';
import { useChainId } from '@/hooks/web3/useChain';
import { MarginAdjustMethod } from '@/types/trade';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import './index.less';
type IProps = {
  pair: WrappedPair;
};
export default function TradeMarginAdjustLeverage({ pair }: IProps) {
  const chainId = useChainId();
  const manageSide = useAppSelector(
    (state) => state.trade.adjustMarginControlState.manageSides[MarginAdjustMethod.Leverage],
  );

  const { isMobile } = useMediaQueryDevice();
  const { leverageInput, setLeverageInput, debouncedInputAmountStr } = useMarginAdjustByLeverage();
  const { t } = useTranslation();
  return (
    <div className={classNames('syn-trade-adjust-leverage')}>
      {leverageInput && (
        <TradeLeverage
          mobileUseDesktopStyle
          chainId={chainId}
          pairId={pair.id}
          leverage={leverageInput}
          maxLeverage={pair?.maxLeverage}
          leverageChanged={function (leverage: string): void {
            setLeverageInput(leverage);
          }}
        />
      )}

      <AvailableBalance
        balanceMaxProps={{
          isShowBalance: false,
          max: WrappedBigNumber.from(100),
          marginToken: pair?.rootInstrument?.quoteToken,
          showMax: false,
        }}
        hideBalanceMax={isMobile || manageSide !== MANAGE_SIDE.IN}
      />

      {debouncedInputAmountStr && (
        <div className="syn-trade-adjust-leverage-amount">
          <span className="syn-trade-adjust-leverage-amount-title">
            {manageSide === MANAGE_SIDE.IN ? t('common.marginRequired') : t('common.marginReleased')}
          </span>
          <div className="syn-trade-adjust-leverage-amount-spliter" />
          <span className="syn-trade-adjust-leverage-amount-qoute">
            {WrappedBigNumber.from(debouncedInputAmountStr).formatNumberWithTooltip({
              isShowTBMK: true,
              suffix: pair.rootInstrument.marginToken.symbol,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
