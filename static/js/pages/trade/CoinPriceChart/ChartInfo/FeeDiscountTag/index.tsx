/**
 * @description Component-FeeDiscountTag
 */
import { useTranslation } from 'react-i18next';
import './index.less';

import Tag from '@/components/Tag';
import { WrappedPair } from '@/entities/WrappedPair';
import { useBackendChainConfig } from '@/features/config/hook';
import { useTheme } from '@/features/global/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import classNames from 'classnames';
import { FC } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  currentPair: WrappedPair | undefined;
}
const FeeDiscountTag: FC<IPropTypes> = function ({ currentPair }) {
  const chainId = useChainId();
  const { t } = useTranslation();
  const dappConfig = useBackendChainConfig(chainId);
  const { dataTheme } = useTheme();

  if (!dappConfig?.feeDiscountInstruments || !currentPair) {
    return null;
  }
  if (dappConfig?.feeDiscountInstruments.includes(currentPair.rootInstrument.symbol))
    return (
      <Tag bordered={true} className={classNames('syn-fee-discount-tag', dataTheme)}>
        {t('common.feeDiscount')}
      </Tag>
    );

  return null;
};

export default FeeDiscountTag;
