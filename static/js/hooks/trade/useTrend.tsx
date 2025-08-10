import { usePrevious } from 'ahooks';
import { useEffect, useState } from 'react';

export const useTrend = (value: number | undefined) => {
  const [_value, set_Value] = useState<number | undefined>(undefined);

  const prevValue = usePrevious(_value);
  useEffect(() => {
    if (_value !== value) {
      set_Value(value);
    }
  }, [_value, value]);
  if (prevValue === undefined || value === undefined) {
    return 'up';
  }
  return value > prevValue ? 'up' : 'down';
};
