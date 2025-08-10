/**
 * @description Component-PortfolioPageConnectionCheck
 */
import { useDebounceEffect } from 'ahooks';
import React, { FC, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { GlobalModalType } from '@/constants';
import { useAccountWrap, useIsIpBlocked, useToggleModal } from '@/features/global/hooks';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PortfolioPageConnectionCheck: FC<IPropTypes> = function ({}) {
  const { pathname, state } = useLocation();
  const userWrap = useAccountWrap();

  const navigate = useNavigate();
  const isIpBlocked = useIsIpBlocked();
  const toggleWalletModal = useToggleModal(GlobalModalType.Wallet);
  useDebounceEffect(
    () => {
      if (pathname.startsWith('/portfolio')) {
        if (!userWrap) {
          navigate('/trade', { replace: true, state: { from: pathname, openWalletModal: true } });
        }
      }
    },
    [pathname, userWrap],
    { wait: 100 },
  );

  useEffect(() => {
    if (!isIpBlocked && state && state?.from == '/portfolio' && state?.openWalletModal) {
      toggleWalletModal(true);
    }
  }, [state, isIpBlocked]);

  return null;
};

export default PortfolioPageConnectionCheck;
