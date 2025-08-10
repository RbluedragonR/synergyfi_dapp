import { MANAGE_SIDE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import useMarginAdjustByAmount from '@/hooks/trade/MarginAdjust/useMarginAdjustByAmount';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import WrapETHButton from '../../WrapETHButton';

import Input from '@/components/Input';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import SynTab from '@/components/SynTab';
import { FETCHING_STATUS } from '@/constants';
import BalanceMax from '@/pages/components/BalanceMax';
import PercentageSelector from '@/pages/components/PercentageSelector/PercentageSelector';
import { inputNumChecker } from '@/utils/numberUtil';

import useMarginAdjustInputChanged from '@/hooks/trade/MarginAdjust/useMarginAdjustSimulate';
import { MarginAdjustMethod } from '@/types/trade';

export default function MarginAdjustByAmount() {
  const {
    currentPair,
    manageSide,
    adjustFormStatus,
    onSideChange,
    percentageChange,
    isWrappedNative,
    manageSides,
    displayBalance,
    adustMarginFormState,
    percentage,
    inputRef,
    portfolio,
  } = useMarginAdjustByAmount();
  const { inputAmountStrChanged } = useMarginAdjustInputChanged(MarginAdjustMethod.Amount);
  const { isMobile } = useMediaQueryDevice();
  const { t } = useTranslation();

  return (
    <>
      <SynTab
        disabled={adjustFormStatus === FETCHING_STATUS.FETCHING}
        activeKey={manageSide}
        items={manageSides}
        onChange={onSideChange}
      />
      <div ref={inputRef} className="syn-trade-adjust-content">
        <div className="syn-trade-adjust-content-form-item">
          <Input
            onChange={(e) => {
              const value = inputNumChecker(e.target.value, portfolio?.rootInstrument.marginToken.decimals);
              if (WrappedBigNumber.from(value).gt(displayBalance)) {
                inputAmountStrChanged(
                  inputNumChecker(displayBalance.stringValue, currentPair?.rootInstrument.marginToken.decimals),
                );
              } else {
                inputAmountStrChanged(value);
              }
            }}
            {...{
              type: 'text',
              pattern: '^[0-9]*[.,]?[0-9]*$',
              inputMode: 'decimal',
              autoComplete: 'off',
              autoCorrect: 'off',
              step: 1e18,
              autoFocus: true,
              onKeyDown: (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault(),
            }}
            id="manage-input"
            disabled={adjustFormStatus === FETCHING_STATUS.FETCHING}
            placeholder="0.0"
            autoFocus={true}
            max={displayBalance.stringValue}
            value={adustMarginFormState.amount}
            className={classNames('syn-form-input')}
            suffix={currentPair?.rootInstrument.marginToken.symbol}
          />
          <div className="syn-trade-adjust-content-form-title">
            <span>{t('common.availableBalanceTile.av')}</span>
            <BalanceMax
              marginToken={currentPair?.rootInstrument.marginToken}
              isShowBalance={true}
              isShowTitle={false}
              title={t('common.available')}
              showMax={false}
              max={displayBalance}
            />
          </div>
        </div>
        <PercentageSelector
          disabled={adjustFormStatus === FETCHING_STATUS.FETCHING}
          value={Number(percentage || 0)}
          onChange={percentageChange}
        />
        {isWrappedNative && manageSide === MANAGE_SIDE.IN && (
          <div className="syn-trade-adjust-wrap">
            {!isMobile && <WrapETHButton quote={currentPair?.rootInstrument?.quoteToken} />}
          </div>
        )}
      </div>
    </>
  );
}
