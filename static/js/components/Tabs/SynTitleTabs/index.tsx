import classNames from 'classnames';
import { CSSProperties, ReactNode } from 'react';
import './index.less';
interface IPropTypes {
  className?: string;
  onClick?: (key: string) => void;
  items: { key: string; label: ReactNode }[];
  activeKey?: string;
  varient?: 'default' | 'solid';
  wrapStyle?: CSSProperties | undefined;
  tabsStyle?: CSSProperties | undefined;
}
export default function SynTitleTabs({
  varient = 'default',
  className,
  onClick,
  items,
  activeKey,
  wrapStyle,
  tabsStyle,
}: IPropTypes) {
  return (
    <>
      {' '}
      <div style={{ ...wrapStyle }} className="syn-title-tabs-wrap">
        <div style={{ ...tabsStyle }} className={classNames('syn-title-tabs', `syn-title-tabs-${varient}`, className)}>
          {items.map((item, i) => (
            <div
              key={`${item.key}_${i}`}
              onClick={() => {
                onClick?.(item.key);
              }}
              className={classNames('syn-title-tabs-item', activeKey === item.key && 'active')}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
