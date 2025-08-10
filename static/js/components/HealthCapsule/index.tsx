/**
 * @description Component-HealthCapsule
 */
import './index.less';

import { FC, useMemo } from 'react';

import { IHealthCapsulePropTypes } from '@/types/health';

const itemBgMap = {
  low: ['#FF4D5B'],
  mid: ['#FFAA00', '#FFD500'],
  high: ['#A1F200', '#6CD900', '#00BF00'],
};
const HealthCapsule: FC<IHealthCapsulePropTypes> = function ({ level = 'low', className = '' }) {
  const items = useMemo(() => {
    return itemBgMap[level].map((itemColor) => {
      return <div className="syn-health_capsule-item" style={{ backgroundColor: itemColor }} key={itemColor}></div>;
    });
  }, [level]);
  return <div className={`syn-health_capsule ${className}`}>{items}</div>;
};

export default HealthCapsule;
