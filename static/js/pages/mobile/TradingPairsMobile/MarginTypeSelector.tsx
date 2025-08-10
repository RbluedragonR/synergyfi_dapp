/**
 * @description Component-MarginTypeSelector
 */
import './index.less';

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// import { ReactComponent as MarginIcon } from '@/assets/svg/margin_icon.svg';
import DrawerSelector, { DrawerSelectorOptionProps } from '@/components/Drawer/DrawerSelector';
import { MARKET_FILTERS } from '@/constants/market';
import { setPartialMarginSearchProps } from '@/features/market/actions';
import { useMarginSearch } from '@/features/market/hooks';
import { useAppDispatch } from '@/hooks';
import { ALL_SELECTOR, PAIR_DATE_TYPE, TPairTypeForMobile } from '@/types/global';

import { ReactComponent as FilterIcon } from '../assets/svg/icon_filter.svg';
import { ReactComponent as FilterIconBold } from '../assets/svg/icon_filter_bold.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const MarginTypeSelector: FC<IPropTypes> = function () {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { goToSelectorWithFilter, pairTypeForMobile } = useMarginSearch();
  const marginLabels = useMemo(
    () => ({
      [PAIR_DATE_TYPE.PERPETUAL]: t('common.perpetual'),
      [PAIR_DATE_TYPE.DATED]: t('common.datedFutures'),
    }),
    [t],
  );
  const selectOptions = useMemo(() => {
    const res: DrawerSelectorOptionProps<TPairTypeForMobile>[] = [
      {
        label: t('mobile.all'),
        value: undefined,
        key: 'all',
      },
      {
        label: marginLabels[PAIR_DATE_TYPE.PERPETUAL],
        value: PAIR_DATE_TYPE.PERPETUAL,
        key: PAIR_DATE_TYPE.PERPETUAL,
      },
      {
        label: marginLabels[PAIR_DATE_TYPE.DATED],
        value: PAIR_DATE_TYPE.DATED,
        key: PAIR_DATE_TYPE.DATED,
      },
    ];

    return res;
  }, [marginLabels, t]);

  const marginClick = useCallback(
    (type: TPairTypeForMobile) => {
      // if (Object.values(MARGIN_TYPE).includes(type as MARGIN_TYPE)) {
      //   goToSelectorWithFilter(type as MARGIN_TYPE);
      // }
      if (!type) {
        goToSelectorWithFilter(ALL_SELECTOR.ALL, '', MARKET_FILTERS.ALL);
      }
      if (Object.values(PAIR_DATE_TYPE).includes(type as PAIR_DATE_TYPE)) {
        dispatch(
          setPartialMarginSearchProps({
            filter: type as unknown as MARKET_FILTERS,
          }),
        );
      }
    },
    [dispatch, goToSelectorWithFilter],
  );

  useEffect(() => {
    marginClick(undefined);
  }, []);
  return (
    <DrawerSelector
      className="syn-margin-type-drawer"
      closeIcon={false}
      placement="bottom"
      height={'auto'}
      onClose={() => setOpenDrawer(false)}
      open={openDrawer}
      value={pairTypeForMobile}
      selectOptions={selectOptions}
      onChange={(value: TPairTypeForMobile) => {
        marginClick(value);
      }}>
      <div
        className={`syn-margin-type-selector-label ${pairTypeForMobile ? 'active' : ''}`}
        onClick={() => setOpenDrawer(true)}>
        {!pairTypeForMobile ? t('mobile.tradingPair') : marginLabels[pairTypeForMobile as PAIR_DATE_TYPE]}{' '}
        {pairTypeForMobile ? <FilterIconBold /> : <FilterIcon />}
      </div>
    </DrawerSelector>
  );
};

export default MarginTypeSelector;
