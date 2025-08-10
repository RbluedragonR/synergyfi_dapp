/**
 * @description Component-DepositLeverageSelector
 */
import './index.less';

import { FC, useMemo } from 'react';

import ButtonSegments from '@/components/ButtonSegments';
interface IPropTypes {
  value: number | undefined;
  onChange: (value: number) => void;
  disabled?: boolean;
}
const PercentageSelector: FC<IPropTypes> = function ({ value, onChange, disabled }) {
  const percentageData = useMemo(() => {
    return [
      { value: 25, label: <span className="font-number">{'25%'}</span> },
      { value: 50, label: <span className="font-number">{'50%'}</span> },
      { value: 75, label: <span className="font-number">{'75%'}</span> },
      { value: 100, label: <span className="font-number">{'100%'}</span> },
    ];
  }, []);
  return (
    <div className="syn-percentage-selector">
      <ButtonSegments
        disabled={disabled}
        options={percentageData}
        // defaultValue=""
        onChange={(value) => {
          onChange(Number(value));
        }}
        value={value}
      />
    </div>
  );
};

export default PercentageSelector;
