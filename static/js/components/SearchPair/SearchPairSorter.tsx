/**
 * @description Component-SearchPairSorter
 */
import './index.less';

import { Radio } from 'antd';
import { FC, memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PAIR_PAGE_TYPE, SEARCH_PAIR_DIRECTION, SEARCH_PAIR_SORTERS } from '@/constants/global';

import { SEARCH_PAIR_SORTER, SEARCH_PAIR_SORTER_DIRECTION } from '@/constants/storage';
import Dropdown from '../Dropdown';
import { ReactComponent as RadioOff } from './assets/icon_radio_off.svg';
import { ReactComponent as RadioOn } from './assets/icon_radio_on.svg';
import { ReactComponent as SortAscendingLight } from './assets/icon_sort_ascending.svg';
interface IPropTypes {
  className?: string;
  value: { sorter: SEARCH_PAIR_SORTERS; direction: SEARCH_PAIR_DIRECTION };
  type: PAIR_PAGE_TYPE;
  onChange: (vale: { sorter: SEARCH_PAIR_SORTERS; direction: SEARCH_PAIR_DIRECTION }) => void;
}
const SearchPairSorter: FC<IPropTypes> = function ({ onChange, value }) {
  const { t } = useTranslation();
  const { sorter, direction } = value;
  const [showSorter, setShowSorter] = useState(false);
  const dropDownRef = useRef<HTMLDivElement>(null);
  const dropdownRenderer = () => (
    <div className="syn-search_pair-header-sorter-renderer" onMouseLeave={() => setShowSorter(false)}>
      <div className="syn-search_pair-header-sorter-renderer-section">
        <div className="syn-search_pair-header-sorter-renderer-section-title">{t('common.searchPair.sortBy')} </div>
        <div className="syn-search_pair-header-sorter-renderer-section-content">
          <Radio.Group
            value={value.sorter}
            size="small"
            onChange={(e) => {
              onChange({ sorter: e.target.value, direction });
              localStorage.setItem(SEARCH_PAIR_SORTER, e.target.value);
              dropDownRef.current?.click();
            }}>
            <Radio.Button value={SEARCH_PAIR_SORTERS.FAVORITE}>
              {sorter === SEARCH_PAIR_SORTERS.FAVORITE ? <RadioOn /> : <RadioOff />} {t('common.favorite')}
            </Radio.Button>
            <Radio.Button value={SEARCH_PAIR_SORTERS.VOLUME_24H}>
              {sorter === SEARCH_PAIR_SORTERS.VOLUME_24H ? <RadioOn /> : <RadioOff />} {t('common.24HV')}
            </Radio.Button>
            <Radio.Button value={SEARCH_PAIR_SORTERS.CHANGE_24H}>
              {sorter === SEARCH_PAIR_SORTERS.CHANGE_24H ? <RadioOn /> : <RadioOff />} {t('common.24HC')}
            </Radio.Button>
            <Radio.Button value={SEARCH_PAIR_SORTERS.BOOSTED_LIQUIDITY}>
              {sorter === SEARCH_PAIR_SORTERS.BOOSTED_LIQUIDITY ? <RadioOn /> : <RadioOff />} {t('common.effectLiq')}
            </Radio.Button>
            <Radio.Button value={SEARCH_PAIR_SORTERS.TVL}>
              {sorter === SEARCH_PAIR_SORTERS.TVL ? <RadioOn /> : <RadioOff />} {t('common.tvl')}
            </Radio.Button>
            <Radio.Button value={SEARCH_PAIR_SORTERS.APY}>
              {sorter === SEARCH_PAIR_SORTERS.APY ? <RadioOn /> : <RadioOff />} {t('common.table.liqApy')}
            </Radio.Button>
          </Radio.Group>
        </div>
      </div>
      <div className="syn-search_pair-header-sorter-renderer-section">
        <div className="syn-search_pair-header-sorter-renderer-section-title">{t('common.searchPair.direction')} </div>
        <div className="syn-search_pair-header-sorter-renderer-section-content">
          <Radio.Group
            value={value.direction}
            size="small"
            onChange={(e) => {
              onChange({ sorter, direction: e.target.value });
              localStorage.setItem(SEARCH_PAIR_SORTER_DIRECTION, e.target.value);
              dropDownRef.current?.click();
            }}>
            <Radio.Button value={SEARCH_PAIR_DIRECTION.ASC}>
              {' '}
              {direction === SEARCH_PAIR_DIRECTION.ASC ? <RadioOn /> : <RadioOff />} {t('common.searchPair.asc')}
            </Radio.Button>
            <Radio.Button value={SEARCH_PAIR_DIRECTION.DSC}>
              {direction === SEARCH_PAIR_DIRECTION.DSC ? <RadioOn /> : <RadioOff />} {t('common.searchPair.desc')}
            </Radio.Button>
          </Radio.Group>
        </div>
      </div>
    </div>
  );

  return (
    <Dropdown
      withPadding={false}
      placement="bottomRight"
      onOpenChange={(open) => setShowSorter(open)}
      dropdownRender={dropdownRenderer}>
      <div ref={dropDownRef} className={`syn-search_pair-header-sorter ${showSorter ? 'active' : ''}`}>
        <SortAscendingLight />
      </div>
    </Dropdown>
  );
};

export default memo(SearchPairSorter);
