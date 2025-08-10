/**
 * @description Component-WrapNativeDrawer
 */
import './index.less';

import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import Drawer from '@/components/Drawer';
import { useNativeToken } from '@/features/chain/hook';
import { useChainId } from '@/hooks/web3/useChain';
import DepositNativeCard from '@/pages/components/Portfolio/Vault/AccountButtons/Deposit/DepositModal/DepositNativeCard';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const WrapNativeDrawer: FC<IPropTypes> = function () {
  const chainId = useChainId();
  const nativeToken = useNativeToken(chainId);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="syn-wrap-native-drawer-btn" onClick={() => setOpen(true)} type="text">
        {t('common.depositForm.wrapTo', { symbol: nativeToken?.symbol })}
      </Button>
      <Drawer
        onClose={() => setOpen(false)}
        title={t('common.deposit')}
        open={open}
        className="syn-wrap-native-drawer reverse-header">
        <DepositNativeCard onDepositSuccess={() => setOpen(false)} />
      </Drawer>
    </>
  );
};

export default WrapNativeDrawer;
