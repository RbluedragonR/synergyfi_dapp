/**
 * @description Component-DepositButton
 */
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { IButtonProps } from '@/types/button';

import './index.less';

const DepositButton: FC<IButtonProps> = function (props) {
  const { t } = useTranslation();
  return (
    <Button size="small" className={'syn-account-deposit-button'} type="primary" {...props}>
      {t('common.deposit')}
    </Button>
  );
};

export default DepositButton;
