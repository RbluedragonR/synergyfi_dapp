/**
 * @description Component-HistoryFilterDropDown
 */
import './index.less';

import { Checkbox } from 'antd';
import { FilterDropdownProps } from 'antd/es/table/interface';
import { FC, Key, useMemo } from 'react';

const HistoryFilterDropDown: FC<FilterDropdownProps> = function ({ filters, confirm, setSelectedKeys }) {
  const options = useMemo(
    () =>
      filters?.map((f) => ({
        label: f.text,
        value: f.value,
      })),
    [filters],
  );
  if (!filters?.length) {
    return <></>;
  }
  return (
    <Checkbox.Group
      onChange={(checkedValues) => {
        setSelectedKeys(checkedValues as Key[]);
        confirm({ closeDropdown: false });
      }}
      options={options || []}
      className="syn-history-filter-drop-down"
    />
  );
};

export default HistoryFilterDropDown;
