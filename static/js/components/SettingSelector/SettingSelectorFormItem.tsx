import classNames from 'classnames';
import { memo, ReactNode, useMemo } from 'react';

import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { SettingSelectorProps } from '@/types/global';
import { inputNumChecker, toBN } from '@/utils/numberUtil';

import ButtonSegments from '../ButtonSegments';
import Input from '../Input';
import { useMediaQueryDevice } from '../MediaQuery';
import './settingSelectorFormItem.less';

interface ISettingSelectorFormItemProps extends SettingSelectorProps {
  label: ReactNode;
  formClassName?: string;
  value: string;
  customInputLabel?: string;
  keyChanged: (value: string) => void;
  checkThreshold?: boolean;
  threshold?: {
    max: string;
    min: string;
    default: string;
    low?: number;
    high?: number;
  };
}
function SettingSelectorFormItem({
  label,
  formClassName,
  className,
  value,
  customInputLabel,
  datas,
  keyChanged,
  checkThreshold,
  threshold,
}: ISettingSelectorFormItemProps): JSX.Element {
  const { deviceType } = useMediaQueryDevice();
  const transformSegmentedOptions = useMemo(() => {
    if (!Array.isArray(datas)) return [];
    return datas.map((d) => ({ label: d.value, value: d.key }));
  }, [datas]);
  return (
    <div className={`settings_form ${formClassName} ${deviceType}`}>
      <div className="settings_form-label">{label}</div>
      <div className={classNames('settings_form-selector_wrap', customInputLabel ? 'with-custom' : '')}>
        <ButtonSegments
          options={transformSegmentedOptions}
          onChange={(value) => {
            keyChanged(value as string);
          }}
          value={value}
        />
        {customInputLabel ? (
          <Input
            {...{
              type: 'text',
              pattern: '^[0-9]*[.,]?[0-9]*$',
              // universal input options
              inputMode: 'decimal',
              autoComplete: 'off',
              autoCorrect: 'off',
              onKeyDown: (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault(),
              step: 1e18,
            }}
            value={value}
            onChange={(e) => {
              keyChanged(inputNumChecker(e.target.value));
            }}
            onBlur={(e) => {
              const val = inputNumChecker(e.target.value);
              if (checkThreshold && threshold) {
                if (val) {
                  if (toBN(val).gt(threshold.max)) {
                    keyChanged(inputNumChecker(threshold.max));
                  } else if (toBN(val).lt(threshold.min)) {
                    keyChanged(inputNumChecker(threshold.min));
                  }
                } else {
                  keyChanged(inputNumChecker(threshold.default));
                }
              }
            }}
            className={classNames(
              'syn-form-input',
              className,
              WrappedBigNumber.from(value).lte(threshold?.low || 0) && 'settings_form-selector_wrap-warning',
              WrappedBigNumber.from(value).gte(threshold?.high || Infinity) && 'settings_form-selector_wrap-warning',
            )}
            suffix={customInputLabel}
          />
        ) : (
          ''
        )}
      </div>
    </div>
  );
}
export default memo(SettingSelectorFormItem);
