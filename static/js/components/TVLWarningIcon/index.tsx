/**
 * @description Component-TVLWarningIcon
 */
import { useChainId } from '@/hooks/web3/useChain';
import './index.less';

import { ReactComponent as WarningIcon } from '@/assets/svg/icon_warning_yellow.svg';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useBackendChainConfig } from '@/features/config/hook';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '../ToolTip';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  tvl?: WrappedBigNumber;
}
const TVLWarningIcon: FC<IPropTypes> = function ({ tvl }) {
  const chainId = useChainId();
  const backendChainConfig = useBackendChainConfig(chainId);
  const { t } = useTranslation();
  const showWarning = useMemo(
    () => tvl?.lt(backendChainConfig?.tvlWarningAmount || 0),
    [backendChainConfig?.tvlWarningAmount, tvl],
  );
  if (!showWarning) {
    return null;
  }
  return (
    <Tooltip title={t('common.market.tvlWarning')} className="syn-t-vLWarning-icon">
      <WarningIcon width={16} height={16} />
    </Tooltip>
  );
};

export default TVLWarningIcon;
