/**
 * @description Component-StepRatioSelector
 */
import './index.less';

import { FC, useEffect, useMemo, useState } from 'react';

import { Select } from '@/components/Select';
import { DEFAULT_STEP_RATIO } from '@/constants/trade';
import { usePairStepRatios } from '@/features/trade/hooks';

import { ReactComponent as DownIcon } from '@/assets/svg/dropdown.svg';
import { SelectProps } from 'antd/es/select';
interface IPropTypes {
  className?: string;
  imr: number | undefined;
  onChange: (value: number) => void;
  withBaseBPs?: boolean;
  numbersOverride?: number[];
  defaultStepRatioOverride?: number;
}
// base 10000
const StepRatioSelector: FC<IPropTypes & SelectProps> = function ({
  imr,
  dropdownStyle,
  onChange,
  dropdownAlign,
  withBaseBPs,
  numbersOverride,
  defaultStepRatioOverride,
}) {
  const defaultStepRatio = defaultStepRatioOverride || DEFAULT_STEP_RATIO;
  const [value, setValue] = useState(defaultStepRatio);
  const numbers = usePairStepRatios(imr, withBaseBPs);
  const options = useMemo(() => {
    if (numbersOverride) {
      return numbersOverride.map((n: number) => ({ value: n, label: `${n / 100}%` }));
    }
    if (numbers) {
      return numbers.map((n: number) => ({ value: n, label: `${n / 100}%` }));
    }
    return [];
  }, [numbers, numbersOverride]);
  useEffect(() => {
    setValue(defaultStepRatio);
    onChange(defaultStepRatio);
    // only this
  }, [imr]);
  return (
    <Select
      suffixIcon={<DownIcon className="syn-step-ratio-selector-icon" />}
      options={options}
      value={value}
      popupClassName="syn-step-ratio-selector-popup"
      onChange={(value) => {
        onChange(value);
        setValue(value);
      }}
      dropdownStyle={dropdownStyle}
      dropdownAlign={dropdownAlign}
      className="syn-step-ratio-selector"
    />
  );
};

export default StepRatioSelector;
