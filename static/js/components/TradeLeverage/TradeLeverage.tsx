import './TradeLeverage.less';

// import { useDebounceFn } from 'ahooks';
import classNames from 'classnames';
import _ from 'lodash';
import { memo, useCallback, useEffect, useState } from 'react';

import Input from '@/components/Input';
import SynSlider from '@/components/SynSlider';
import { TRADE_FORM_TYPE } from '@/constants';
import { CHAIN_ID } from '@/constants/chain';
import { TRADE_LEVERAGE_THRESHOLDS } from '@/constants/global';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useTradeDefaultLeverage } from '@/features/trade/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import { savePairLeverage } from '@/utils/localstorage';
import { inputNumChecker } from '@/utils/numberUtil';

import { useMediaQueryDevice } from '../MediaQuery';

interface IProps {
  isMobile?: boolean;
  chainId: CHAIN_ID | undefined;
  tradeFormType?: TRADE_FORM_TYPE;
  pairId: string | undefined;
  leverage: string;
  tradeType?: TRADE_TYPE;
  max?: number;
  maxLeverage: number | undefined;
  imr?: number;
  disabled?: boolean;
  leverageChanged: (leverage: string) => void;
  mobileUseDesktopStyle?: boolean;
}

export function TradeLeverageComponent({
  leverageChanged,
  leverage,
  max,
  chainId,
  disabled,
  pairId,
  tradeType,
  maxLeverage,
  mobileUseDesktopStyle = false,
}: IProps): JSX.Element {
  const { isMobile, deviceType } = useMediaQueryDevice();
  const [inputValue, setInputValue] = useState(leverage);
  const userAddr = useUserAddr();
  const [touched, setTouched] = useState(false);
  const defaultLeverage = useTradeDefaultLeverage(maxLeverage);
  const updateLocalLeverage = useCallback(
    (leverage: string) => {
      userAddr && tradeType && chainId && pairId && savePairLeverage(userAddr, chainId, pairId, tradeType, leverage);
    },
    [chainId, pairId, userAddr, tradeType],
  );
  const onSliderChange = useCallback(
    (value: number) => {
      gtag('event', 'adjust_leverage', {
        adjust_leverage: 'drag', // drag, enter
      });
      leverageChanged(value.toString());
      setInputValue(value.toString());
      updateLocalLeverage(value.toString());
    },
    [leverageChanged, updateLocalLeverage],
  );

  useEffect(() => {
    setInputValue(leverage);
  }, [leverage]);
  const sliderMove = useCallback(
    (e: TouchEvent | MouseEvent) => {
      const rect = document.getElementById('leverage-bottom')?.getBoundingClientRect();
      if (rect && maxLeverage) {
        const clientX = _.get(e, ['touches', 0, 'clientX'], _.get(e, ['clientX']));
        const x = clientX - rect?.left;
        let percent = x / rect.width;

        if (percent > 1) {
          percent = 1;
        }
        if (percent < 0) {
          percent = 0;
        }
        const leverageNew = (maxLeverage - TRADE_LEVERAGE_THRESHOLDS.MIN) * percent + 0.1;
        const leverageAdjusted = Number(leverageNew.toFixed(1));

        onSliderChange(leverageAdjusted);
      }
    },
    [maxLeverage, onSliderChange],
  );

  const setVal = useCallback(
    (value: string) => {
      let val = inputNumChecker(value, 1);
      const valBN = WrappedBigNumber.from(val);
      if (val) {
        if (maxLeverage && valBN.gt(maxLeverage)) {
          val = maxLeverage.toString();
        } else if (valBN.lt(TRADE_LEVERAGE_THRESHOLDS.MIN)) {
          val = TRADE_LEVERAGE_THRESHOLDS.MIN.toString();
        }
        if (max && valBN.gt(max)) {
          val = max.toString();
        }
      } else {
        val = defaultLeverage.toString();
      }
      val = WrappedBigNumber.from(val).stringValue;
      setInputValue(val);
      return val;
    },
    [defaultLeverage, max, maxLeverage],
  );

  return (
    <div className={classNames(`trade-leverage`, mobileUseDesktopStyle ? '' : deviceType, { disabled: disabled })}>
      <div
        id="leverage-bottom"
        onClick={(e) => {
          if (!mobileUseDesktopStyle) {
            if (isMobile && !disabled) {
              sliderMove(e as unknown as MouseEvent);
              setTouched(true);
            }
          }
        }}
        onTouchStart={(e) => {
          if (!mobileUseDesktopStyle) {
            if (disabled) {
              return;
            }
            setTouched(true);
            sliderMove(e as unknown as TouchEvent);
          }
        }}
        onTouchMove={(e) => {
          if (!mobileUseDesktopStyle) {
            !disabled && sliderMove(e as unknown as TouchEvent);
          }
        }}
        onTouchEnd={() => {
          if (!mobileUseDesktopStyle) {
            setTouched(false);
          }
        }}
        className="trade-leverage-bottom">
        <SynSlider
          max={maxLeverage}
          disabled={disabled}
          tooltip={{ open: touched }}
          ticks={isMobile ? 2 : 5}
          onChange={(number) => (!isMobile || mobileUseDesktopStyle) && onSliderChange(number)}
          value={Number(leverage)}
        />
        {(!isMobile || mobileUseDesktopStyle) && (
          <div className="trade-leverage-bottom-input">
            <Input
              value={inputValue}
              {...{
                type: 'text',
                pattern: '^[0-9]*[.,]?[0-9]*$',
                inputMode: 'decimal',
                autoComplete: 'off',
                autoCorrect: 'off',
                onKeyDown: (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault(),
                step: 1e18,
              }}
              suffix={'x'}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              disabled={disabled}
              onBlur={(e) => {
                const val = setVal(e.target.value);
                leverageChanged(val);
                gtag('event', 'adjust_leverage', {
                  adjust_leverage: 'enter', // drag, enter
                });
                updateLocalLeverage(val);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export const TradeLeverage = memo(TradeLeverageComponent);
