/**
 * @description Component-WithdrawButton
 */
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { IButtonProps } from '@/types/button';

import './index.less';

const WithdrawButton: FC<IButtonProps> = function (props) {
  const { t } = useTranslation();
  return (
    <Button size="small" className={'syn-account-withdraw-button'} type="primary" {...props}>
      {t('common.withdraw')}
    </Button>
  );
};

export default WithdrawButton;
