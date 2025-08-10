import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedVault } from '@/entities/WrappedVault';
import { useDepositInputAmount, useVaultOperations } from '@/features/vault/hook';
import { setDepositAmount } from '@/features/vault/slice';
import { useAssetsBalanceMap } from '@/pages/portfolio/Assets/hooks/assetsHook';
import { useMutation } from '@tanstack/react-query';
import { useDebounce } from 'ahooks';
import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch } from '..';
import { useChainId, useUserAddr } from '../web3/useChain';
import { useVaultMarginToken } from './useVaultMarginToken';

export default function useVaultDepositInput(vault: WrappedVault) {
  const chainId = useChainId();
  const { tokenBalance, setMarginTokenAddr, marginToken, isMarginTokenNative, isVaultCanBeNative } =
    useVaultMarginToken(vault);
  const userAddr = useUserAddr();
  const depositInputAmount = useDepositInputAmount();
  const debouncedDepositInputAmount = useDebounce(depositInputAmount, { wait: 500 });
  const { onDepositToVault } = useVaultOperations(chainId, vault.vaultAddress, marginToken);
  const dispatch = useAppDispatch();
  const accountBalanceMap = useAssetsBalanceMap(chainId, userAddr);
  const updateDepositInputAmount = useCallback(
    (amount: string) => {
      dispatch(setDepositAmount(amount));
    },
    [dispatch],
  );
  const handleDepositMutation = useMutation({
    mutationFn: async () => {
      const depositInputAmountBN = new WrappedBigNumber(depositInputAmount);
      if (depositInputAmountBN.gt(0)) {
        await onDepositToVault(depositInputAmountBN);
      }
      updateDepositInputAmount('0');
    },
    onMutate: () => {
      console.log('onMutate: before mutationFn');
    },
    onError: (error) => {
      throw error;
    },
    onSettled: () => {
      updateDepositInputAmount('0');
    },
  });

  const handleClickMax = useCallback(() => {
    updateDepositInputAmount(tokenBalance.toString());
  }, [tokenBalance, updateDepositInputAmount]);

  useEffect(() => {
    updateDepositInputAmount('');
  }, [updateDepositInputAmount, marginToken]);

  const isTokenBalanceLessThanMinDeposit = useMemo(() => {
    return tokenBalance.wadValue.lt(vault.minQuoteAmount.wadValue);
  }, [tokenBalance.wadValue, vault]);
  const isInputLessThanMinDeposit = useMemo(() => {
    return (
      depositInputAmount &&
      WrappedBigNumber.from(depositInputAmount)
        .add(vault.getUserDeposit(userAddr))
        .wadValue.lt(vault.minQuoteAmount.wadValue)
    );
  }, [depositInputAmount, userAddr, vault]);
  const isTokenPlusAccountBalanceGreaterMinDeposit = useMemo(() => {
    const accountBalance = accountBalanceMap[vault.quoteToken?.address]?.gateBalance;
    if (accountBalance) {
      const totalBalance = tokenBalance.add(accountBalance);
      return totalBalance.wadValue.gte(vault.minQuoteAmount.wadValue);
    } else {
      return false;
    }
  }, [accountBalanceMap, tokenBalance, vault.quoteToken?.address, vault?.minQuoteAmount]);

  return {
    depositInputAmount,
    updateDepositInputAmount,
    debouncedDepositInputAmount,
    handleClickMax,
    handleDeposit: () => handleDepositMutation.mutate(),
    isDepositing: handleDepositMutation.isPending,
    isVaultCanBeNative,
    setMarginTokenAddr,
    availableValue: tokenBalance,
    marginToken,
    isMarginTokenNative,
    isInputLessThanMinDeposit,
    isTokenBalanceLessThanMinDeposit,
    isTokenPlusAccountBalanceGreaterMinDeposit,
  };
}
