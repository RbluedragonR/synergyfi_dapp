/**
 * @description Component-ButtonGroupSelector
 */
import './index.less';

import cls from 'classnames';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { IButtonGroupSelectorItemProps, IButtonGroupSelectorProps } from '@/types/button';

import Button from '../Button';
import { ReactComponent as CheckIcon } from './assets/icon_btn_check.svg';
interface ICurrItemProps extends Omit<IButtonGroupSelectorItemProps, 'label' | 'value'> {
  value: Set<IButtonGroupSelectorItemProps['value']>;
}
type IItemClickParams = (
  value: IButtonGroupSelectorItemProps['value'],
  group: IButtonGroupSelectorItemProps['group'],
) => void;

const ButtonGroupSelector: FC<IButtonGroupSelectorProps> = function ({
  value,
  items = [],
  onClick,
  valueSelected,
  ...props
}) {
  const [currItem, setCurrItem] = useState<ICurrItemProps>({
    group: undefined,
    value: new Set(),
  });
  useEffect(() => {
    if (value !== undefined) {
      setCurrItem({
        group: value.group,
        value: new Set(value.value),
      });
    }
    // onInnerClick(value.value, value.group)
  }, [value]);
  const onInnerClick: IItemClickParams = useCallback(
    (value, group) => {
      let curr = currItem;
      if (curr === undefined) return curr;
      if (curr.group !== group) {
        // * change group, reset value
        curr.value.clear();
        curr.value.add(value);
        curr = {
          group,
          value: curr.value,
        };
        valueSelected && valueSelected(value);
      } else if (curr.value.has(value)) {
        curr.value.delete(value);
      } else {
        curr.value.add(value);
        valueSelected && valueSelected(value);
      }
      onClick && onClick(Array.from(curr.value), curr.value.size === 0 ? undefined : curr.group);
    },

    [currItem, onClick, valueSelected],
  );
  const renderButtons = useMemo(() => {
    return items.map((item, idx) => {
      return (
        <Button
          key={`${idx + item.value}`}
          onClick={() => onInnerClick(item.value, item.group)}
          ghost
          shape="round"
          className={cls('syn-button_group_selector-item', {
            ['active']: item.group === currItem.group && currItem.value.has(item.value),
          })}>
          <CheckIcon />
          {item.label}
        </Button>
      );
    });
  }, [items, currItem, onInnerClick]);
  return <div className={cls('syn-button_group_selector', props.className)}>{renderButtons}</div>;
};

export default ButtonGroupSelector;
