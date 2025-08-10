/**
 * @description Component-HistoryTableRangeSelector
 */
import './index.less';

import React, { FC, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { HISTORY_RANGE } from '@/constants/history';
import { setHistoryRange } from '@/features/graph/actions';
import { useHistoryRange } from '@/features/graph/hooks';
import { useAppDispatch } from '@/hooks';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const HistoryTableRangeSelector: FC<IPropTypes> = function () {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const timeRange = useHistoryRange();
  const selectorRef = useRef<HTMLDivElement>(null);

  const setTimeRange = useCallback(
    (type: HISTORY_RANGE) => {
      dispatch(setHistoryRange(type));
    },
    [dispatch],
  );
  return (
    <div className="syn-history-table-range-selector-wrap">
      <div className="syn-history-table-range-selector" ref={selectorRef}>
        <div
          onClick={() => setTimeRange(HISTORY_RANGE.D_1)}
          className={`syn-history-table-range-selector-item ${timeRange === HISTORY_RANGE.D_1 ? 'active' : ''}`}>
          {t('common.historyC.1d')}
        </div>
        <div
          onClick={() => setTimeRange(HISTORY_RANGE.D_7)}
          className={`syn-history-table-range-selector-item ${timeRange === HISTORY_RANGE.D_7 ? 'active' : ''}`}>
          {t('common.historyC.7d')}
        </div>
        <div
          onClick={() => setTimeRange(HISTORY_RANGE.M_1)}
          className={`syn-history-table-range-selector-item ${timeRange === HISTORY_RANGE.M_1 ? 'active' : ''}`}>
          {t('common.historyC.1m')}
        </div>
        {/* <div
          onClick={() => setTimeRange(HISTORY_RANGE.M_3)}
          className={`syn-history-table-range-selector-item ${timeRange === HISTORY_RANGE.M_3 ? 'active' : ''}`}>
          {t('common.historyC.3m')}
        </div> */}
        <div
          onClick={() => setTimeRange(HISTORY_RANGE.ALL)}
          className={`syn-history-table-range-selector-item ${timeRange === HISTORY_RANGE.ALL ? 'active' : ''}`}>
          {t('common.historyC.all')}
        </div>
      </div>
    </div>
  );
};

export default HistoryTableRangeSelector;
