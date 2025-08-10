/**
 * @description Component-HistoryTableRangeSelector
 */
import classNames from 'classnames';
import './index.less';

import { FC, ReactNode } from 'react';

interface IPropTypes {
  className?: string;
  onClick?: (key: string) => void;
  items: { key: string; label: ReactNode }[];
  activeKey?: string;
  varient?: 'default' | 'solid';
}
const SynCircleTabs: FC<IPropTypes> = function ({ items, onClick, className, activeKey, varient = 'default' }) {
  return (
    <div className="syn-circle-tabs-wrap">
      <div className={classNames('syn-circle-tabs', `syn-circle-tabs-${varient}`, className)}>
        {items.map((item, i) => (
          <div
            key={`${item.key}_${i}`}
            onClick={() => {
              onClick?.(item.key);
            }}
            className={classNames('syn-circle-tabs-item', activeKey === item.key && 'active')}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SynCircleTabs;
