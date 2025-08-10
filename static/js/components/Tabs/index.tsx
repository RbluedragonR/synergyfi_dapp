/**
 * @description Component-Tabs
 */
import './index.less';

import cls from 'classnames';
import React, { CSSProperties, FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface ITabPaneTypes {
  label: React.ReactNode;
  key: string;
  tabClass?: string;
  width?: number;
}
interface IPropTypes {
  className?: string;
  value: string;
  tabList: ITabPaneTypes[];
  showTabBar?: boolean;
  showSegment?: boolean;
  disabled?: boolean;
  onClick: (key: ITabPaneTypes['key'], tabPane: ITabPaneTypes, idx: number) => void;
}
const Tabs: FC<IPropTypes> = function ({ tabList, onClick, value, showTabBar, className, showSegment, disabled }) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [tabItems, setTabItems] = useState<HTMLDivElement[]>([]);
  const [barStyle, setBarStyle] = useState<CSSProperties>({});
  const [changeState, setChangeState] = useState(false);
  const showSegmentAnimate = useMemo(() => {
    return showSegment && changeState;
  }, [changeState, showSegment]);
  const onInnerClick = useCallback(
    (key: ITabPaneTypes['key'], tabPane: ITabPaneTypes, idx: number) => {
      if (disabled) {
        return;
      }
      let extraLeft = 0;
      if (idx === 0) {
        extraLeft = 1;
      }
      if (idx + 1 === tabItems.length) {
        extraLeft = -1;
      }
      setBarStyle({
        left: tabItems[idx].offsetLeft + extraLeft,
        width: tabItems[idx].offsetWidth,
      });
      onClick(key, tabPane, idx);
    },
    [tabItems, onClick, disabled],
  );
  const TabPanels = useMemo(() => {
    return (tabList || []).map((panel, i) => {
      return (
        <div
          className={cls(
            'syn-tabs-item',
            panel.width,
            {
              active: panel.key === value,
              'segment-tab': showSegmentAnimate,
            },
            panel.tabClass,
          )}
          style={{ width: panel.width || '' }}
          key={panel.key}
          onClick={() => onInnerClick(panel.key, panel, i)}>
          {panel.label}
        </div>
      );
    });
  }, [tabList, value, showSegmentAnimate, onInnerClick]);

  const currentTab = useMemo(() => {
    return tabList.findIndex((tab) => tab.key === value);
  }, [tabList, value]);

  useEffect(() => {
    const items: HTMLDivElement[] = [];
    tabsRef.current?.childNodes.forEach((item) => {
      if (item.nodeName === 'DIV') {
        items.push(item as HTMLDivElement);
      }
    });
    let extraLeft = 0;
    if (currentTab === 0) {
      extraLeft = 1;
    }
    if (currentTab + 1 === tabItems.length) {
      extraLeft = -1;
    }
    setTabItems(items);
    if (items.length) {
      const firstItem = items[currentTab || 0];
      setBarStyle({
        left: (firstItem?.offsetLeft || 0) + extraLeft,
        width: firstItem?.offsetWidth || 0,
      });
      setChangeState(true);
    }
    // update for https://app.clickup.com/t/866b16v5c
  }, [value]);

  return (
    <div className={cls('syn-tabs', className, disabled ? 'disabled' : '')} ref={tabsRef}>
      {TabPanels}
      {showTabBar && <section className={'syn-tabs-bar'} style={barStyle} />}
      {showSegmentAnimate && <section className={'syn-tabs-segment'} style={{ ...barStyle }} />}
    </div>
  );
};

export default memo(Tabs);
