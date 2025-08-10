import { ZERO } from '@synfutures/sdks-perp';
import _ from 'lodash';
import { useEffect, useMemo } from 'react';

import { useAppSelector } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { TokenInfo } from '@/types/token';
import { ITokenAllowanceInfo } from '@/types/user';
import { isNativeTokenAddr } from '@/utils/token';

import * as Sentry from '@sentry/react';
import { selectIsBlacklisted } from '../global/globalSlice';
import {
  IUserState,
  selectChainTokenAllowanceMap,
  selectCurrentUserAddr,
  selectImpostorAddress,
  selectSpenderChainTokenAllowanceMap,
  selectUserState,
} from './userSlice';

export function useUserState(): IUserState {
  const userState = useAppSelector(selectUserState);
  return userState;
}

export function useUserAddrState(): string | undefined {
  // adapt cosplay mode
  const impostorAddress = useAppSelector(selectImpostorAddress) || process.env.REACT_APP_IMPOSTOR?.toLocaleLowerCase();
  const account = useAppSelector(selectCurrentUserAddr);
  return useMemo(() => {
    if (impostorAddress) return impostorAddress;
    return account;
  }, [account, impostorAddress]);
}

export function useChainTokenAllowance(
  marginToken: TokenInfo | undefined,
  spenderAddress?: string | undefined,
): ITokenAllowanceInfo {
  const chainId = useChainId();
  const account = useUserAddr();
  const chainTokenAllowance = useAppSelector(selectChainTokenAllowanceMap);
  const spenderChainTokenAllowance = useAppSelector(selectSpenderChainTokenAllowanceMap);

  const approval: ITokenAllowanceInfo = useMemo(() => {
    if (marginToken?.address && isNativeTokenAddr(marginToken.address)) {
      return {
        block: 0,
        allowance: ZERO,
      };
    }
    if (spenderAddress) {
      const approvalObj = _.get(
        spenderChainTokenAllowance,
        [chainId || '', account || '', marginToken?.address || '', spenderAddress],
        {
          block: 0,
          allowance: ZERO,
          checking: !isNativeTokenAddr(marginToken?.address || ''),
        },
      );
      return approvalObj;
    } else {
      const approvalObj = _.get(chainTokenAllowance, [chainId || '', account || '', marginToken?.address || ''], {
        block: 0,
        allowance: ZERO,
        checking: !isNativeTokenAddr(marginToken?.address || ''),
      });
      return approvalObj;
    }
  }, [marginToken?.address, spenderAddress, spenderChainTokenAllowance, chainId, account, chainTokenAllowance]);
  if (!account) {
    return {
      block: 0,
      allowance: ZERO,
      checking: false,
    };
  }
  return approval;
}
export function useChainTokenAllowanceApproved(
  marginToken: TokenInfo | undefined,
  spenderAddress?: string | undefined,
  amount = ZERO,
): boolean {
  const tokenAllowance = useChainTokenAllowance(marginToken, spenderAddress);
  const allowanceTooLow = useMemo(() => {
    if (marginToken?.address && isNativeTokenAddr(marginToken.address)) {
      return false;
    }
    return tokenAllowance.allowance && tokenAllowance.allowance.lt(amount);
  }, [marginToken?.address, tokenAllowance, amount]);
  return allowanceTooLow;
}

export const useIsBlacklistedFromStore = (): boolean | undefined => {
  const userAddress = useUserAddr();
  const isBlacklisted = useAppSelector(selectIsBlacklisted(userAddress));
  return isBlacklisted;
};

export const useSetSentryUser = (): void => {
  const userAddress = useUserAddr();
  const chainId = useChainId();
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' && process.env.REACT_APP_AWS_ENV !== 'dev') {
      Sentry.setUser({ userAddress, chainId });
    }
  }, [userAddress, chainId]);
};
