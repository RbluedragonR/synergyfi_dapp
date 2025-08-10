/**
 * @description Component-ScaleSizeDistribution
 */
import { useTranslation } from 'react-i18next';
import './index.less';

import { THEME_ENUM } from '@/constants';
import { useTheme } from '@/features/global/hooks';
import { setScaleFormAmount } from '@/features/trade/actions';
import { useScaleFormState } from '@/features/trade/hooks';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import { BatchOrderSizeDistribution } from '@synfutures/sdks-perp';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { ReactComponent as FlatIcon } from './assets/dist_img_01.svg';
import { ReactComponent as FlatIconD } from './assets/dist_img_01_d.svg';
import { ReactComponent as UpperIocn } from './assets/dist_img_02.svg';
import { ReactComponent as UpperIocnD } from './assets/dist_img_02_d.svg';
import { ReactComponent as LowerIocn } from './assets/dist_img_03.svg';
import { ReactComponent as LowerIocnD } from './assets/dist_img_03_d.svg';
import { ReactComponent as RandomIocn } from './assets/dist_img_04.svg';
import { ReactComponent as RandomIocnD } from './assets/dist_img_04_d.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const ScaleSizeDistribution: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const scaleFormState = useScaleFormState(chainId);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const items = useMemo(() => [0, 1, 2, 3], []);
  const setSizeDistribution = useCallback(
    (sizeDistribution: BatchOrderSizeDistribution) => {
      chainId &&
        dispatch(
          setScaleFormAmount({
            chainId,
            sizeDistribution,
          }),
        );
    },
    [chainId, dispatch],
  );
  const ICON_MAP = useMemo(
    () =>
      theme.dataTheme === THEME_ENUM.DARK
        ? {
            [BatchOrderSizeDistribution.FLAT]: <FlatIconD />,
            [BatchOrderSizeDistribution.UPPER]: <UpperIocnD />,
            [BatchOrderSizeDistribution.LOWER]: <LowerIocnD />,
            [BatchOrderSizeDistribution.RANDOM]: <RandomIocnD />,
          }
        : {
            [BatchOrderSizeDistribution.FLAT]: <FlatIcon />,
            [BatchOrderSizeDistribution.UPPER]: <UpperIocn />,
            [BatchOrderSizeDistribution.LOWER]: <LowerIocn />,
            [BatchOrderSizeDistribution.RANDOM]: <RandomIocn />,
          },
    [theme.dataTheme],
  );
  useEffect(() => {
    setSizeDistribution(BatchOrderSizeDistribution.FLAT);
  }, [chainId]);
  return (
    <div className="syn-scale-limit-form-section">
      <div className="syn-scale-limit-form-section-title">{t('common.tradePage.sizeD')}</div>
      <div className="syn-scale-limit-form-section-distributions">
        {items.map((item) => (
          <div
            key={item}
            onClick={() => {
              setSizeDistribution(item);
            }}
            className={classNames('syn-scale-limit-form-section-distributions-item', {
              selected: item === scaleFormState.sizeDistribution,
            })}>
            {ICON_MAP[item as BatchOrderSizeDistribution]}
            <div key={item} className="syn-scale-limit-form-section-distributions-item-bottom">
              {t(`common.tradePage.sizeDistribution.${item}`)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScaleSizeDistribution;
