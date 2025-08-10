/**
 * @description Component-BalanceMax
 */
import './index.less';

import classNames from 'classnames';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { IconToolTip } from '@/components/ToolTip';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { TokenInfo } from '@/types/token';
interface IPropTypes {
  className?: string;
  isShowTitle?: boolean;
  title?: string;
  isShowBalance?: boolean;
  max: WrappedBigNumber | undefined;
  marginToken?: TokenInfo;
  onClickMax?: (maxBalance: WrappedBigNumber) => void;
  showMax?: boolean;
  tooltip?: string;
}
const BalanceMax: FC<IPropTypes> = function ({
  title,
  isShowTitle,
  isShowBalance = true,
  className,
  onClickMax,
  max,
  showMax = true,
  tooltip,
}) {
  const { t } = useTranslation();
  const onClickMaxLink = useCallback(
    (balance: WrappedBigNumber) => {
      onClickMax && onClickMax(balance);
    },
    [onClickMax],
  );

  return (
    <div className={classNames('balance-max', className)}>
      {isShowTitle && <span>{title}</span>}
      {isShowBalance && max?.formatDisplayNumber()}
      {showMax && (
        <a
          onClick={() => {
            max && onClickMaxLink(max);
          }}>
          <span style={{ fontSize: 14 }}>{t('common.max')}</span>
        </a>
      )}
      {tooltip && <IconToolTip title={tooltip} />}
    </div>
  );
};

export default BalanceMax;
