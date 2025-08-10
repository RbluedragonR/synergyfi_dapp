import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedVault } from '@/entities/WrappedVault';
import {
  useShouldRequestWithdraw,
  useVaultOperations,
  useVaultUserPendingWithdrawInfo,
  useWithdrawInputAmount,
} from '@/features/vault/hook';
import { setWithdrawAmount } from '@/features/vault/slice';
import { useDebounce } from 'ahooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '..';
import { useChainId } from '../web3/useChain';
import { useVaultMarginToken } from './useVaultMarginToken';

export default function useVaultWithdrawInput(vault: WrappedVault, userAddr: string) {
  const { setMarginTokenAddr, marginToken, isVaultCanBeNative } = useVaultMarginToken(vault);
  const chainId = useChainId();
  const withdrawInputAmount = useWithdrawInputAmount();
  const debouncedWithdrawInputAmount = useDebounce(withdrawInputAmount, { wait: 500 });
  const [isRequestWithdraw, setIsRequestWithdraw] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const { onWithdrawFromVault } = useVaultOperations(chainId, vault.vaultAddress, marginToken);
  const userPendingWithdrawInfo = useVaultUserPendingWithdrawInfo(
    vault.quoteToken.chainId,
    userAddr,
    vault.vaultAddress,
  );
  const haveArrear = useMemo(() => userPendingWithdrawInfo?.quantity.gt(0), [userPendingWithdrawInfo?.quantity]);
  const { checkShouldRequestWithdraw } = useShouldRequestWithdraw(chainId, vault.vaultAddress);
  const dispatch = useAppDispatch();

  const updateWithdrawInputAmount = useCallback(
    (amount: string) => {
      dispatch(setWithdrawAmount(amount));
    },
    [dispatch],
  );

  const updateIsRequestWithdraw = useCallback(async () => {
    const debouncedWithdrawInputAmountBN = new WrappedBigNumber(debouncedWithdrawInputAmount);
    if (debouncedWithdrawInputAmountBN.gt(0) && !haveArrear) {
      setIsRequestWithdraw(await checkShouldRequestWithdraw(new WrappedBigNumber(debouncedWithdrawInputAmount)));
    }
  }, [checkShouldRequestWithdraw, debouncedWithdrawInputAmount, haveArrear]);

  const handleClickMax = useCallback(() => {
    const maxValue = vault.getUserDeposit(userAddr);
    updateWithdrawInputAmount(maxValue.toString());
  }, [updateWithdrawInputAmount, userAddr, vault]);

  const handleWithdraw = useCallback(
    async (withdrawValue?: WrappedBigNumber) => {
      setIsWithdrawing(true);
      const withdrawInputAmountBN = withdrawValue || new WrappedBigNumber(withdrawInputAmount);
      if (withdrawInputAmountBN.gt(0)) {
        try {
          await onWithdrawFromVault(withdrawInputAmountBN, isRequestWithdraw);
        } catch (error) {
          updateWithdrawInputAmount('0');
          setIsWithdrawing(false);
          throw error;
        }
      }
      updateWithdrawInputAmount('0');
      setIsWithdrawing(false);
    },
    [isRequestWithdraw, onWithdrawFromVault, updateWithdrawInputAmount, withdrawInputAmount],
  );

  useEffect(() => {
    updateIsRequestWithdraw();
  }, [updateIsRequestWithdraw]);
  useEffect(() => {
    updateWithdrawInputAmount('');
  }, [updateWithdrawInputAmount, marginToken]);
  return {
    withdrawInputAmount,
    updateWithdrawInputAmount,
    debouncedWithdrawInputAmount,
    isRequestWithdraw,
    handleClickMax,
    isWithdrawing,
    handleWithdraw,
    setMarginTokenAddr,
    isVaultCanBeNative,
    marginToken,
    haveArrear,
  };
}
