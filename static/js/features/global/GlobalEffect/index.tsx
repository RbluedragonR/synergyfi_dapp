import { CHAIN_ID } from '@derivation-tech/context';
import { useLocalStorageState } from 'ahooks';
import localforage from 'localforage';
import _ from 'lodash';
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { DEFAULT_THEME, THEME_ENUM } from '@/constants';
import { DEADLINE_THRESHOLDS, SLIPPAGE_THRESHOLDS } from '@/constants/global';
import { GLOBAL_CONFIG, LOCAL_SIGNED_UP, LOCAL_THEME, PAIRS_FAVORITES_KEY, WALLET_TYPE } from '@/constants/storage';
import { resetHistory } from '@/features/graph/actions';
import { setChainPairFavorites } from '@/features/pair/actions';
import { resetAdjustMarginForm, resetClosePositionForm } from '@/features/trade/actions';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { IChainPairsFavorites } from '@/types/pair';
import { getSignatureToLocalForage } from '@/utils/storage';

import { useLoginInOrOutPrivyWallet } from '@/connectors/privy/usePrivyWallet';
import { IP_POLLING_INTERVAL } from '@/constants/polling';
import { resetLiquidityFormByChainId } from '@/features/earn/action';
import { useWalletType } from '@/features/wallet/hook';
import useIsBlacklisted from '@/hooks/contract/useIsBlacklisted';
import { useOnChainReferralCodeChecker } from '@/hooks/useOnChainReferralCodeChecker';
import { useWagmiDisconnect } from '@/hooks/web3/useWagami';
import { useWalletAccount } from '@/hooks/web3/useWalletNetwork';
import { WalletType } from '@/types/wallet';
import { pollingFunc } from '@/utils';
import {
  // fetchEarnWhitelistConfig,
  fetchCoingeckoSymbolMappingConfig,
  fetchIpIsBlocked,
  setGlobalConfig,
  setOpenModal,
  setSignature,
  setTheme,
  setUserIsBlacklisted,
} from '../actions';
import { useIsIpBlocked } from '../hooks';
import { useTokenPrices } from '../query';

function useSetDefaultConfig(chainId: CHAIN_ID | undefined) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // TODO: set by user
    chainId &&
      dispatch(
        setGlobalConfig({
          slippage: SLIPPAGE_THRESHOLDS.DEFAULT.toString(),
          deadline: DEADLINE_THRESHOLDS.DEFAULT.toString(),
          gasPrice: '39',
          chainId,
        }),
      );
  }, [dispatch, chainId]);
}

export function useAutoSetDarkTheme(chainId: CHAIN_ID | undefined) {
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(setTheme((localStorage.getItem(LOCAL_THEME) as THEME_ENUM) || DEFAULT_THEME));
  }, [dispatch, chainId, location.pathname]);
}

function useWhitelistConfig() {
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const sdkContext = useSDK(chainId);
  useEffect(() => {
    // chainId &&
    //   userAddr &&
    //   sdkContext &&
    //   dispatch(
    //     fetchEarnWhitelistConfig({
    //       chainId,
    //       userAddr,
    //       sdkContext,
    //     }),
    //   );
  }, [chainId, dispatch, userAddr, sdkContext]);
  const navigate = useNavigate();
  const { search } = useLocation();
  const [, setLocalSignedUp] = useLocalStorageState<boolean>(LOCAL_SIGNED_UP, {
    defaultValue: false,
  });
  useEffect(() => {
    const signUpSuccess = new URLSearchParams(search).get('signUpSuccess');
    if (!!signUpSuccess) {
      setLocalSignedUp(true);
      navigate('/', { replace: true });
    }

    // should not depend on localWhitetList
  }, [search, setLocalSignedUp, navigate]);
}

function useFetchCoingeckoConfig() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchCoingeckoSymbolMappingConfig());
  }, [dispatch]);
}

function useCloseModalsOnSwitching() {
  // const chainId = useChainId();
  // const account = useUserAddr();
  const dispatch = useAppDispatch();
  const location = useLocation();
  useEffect(() => {
    dispatch(setOpenModal({ type: null }));
    // only check the pathname
  }, [dispatch, location.pathname]);
}

function useSetUpPairsFavoriteFromLocal() {
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  useEffect(() => {
    chainId &&
      localforage.getItem(PAIRS_FAVORITES_KEY).then((val) => {
        if (val) {
          dispatch(setChainPairFavorites(val as IChainPairsFavorites));
        }
      });
  }, [chainId, dispatch]);
}

function useSetUpGlobalConfigFromLocal() {
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  useEffect(() => {
    chainId &&
      localforage.getItem(GLOBAL_CONFIG).then((val) => {
        const globalConfig = _.get(val, [chainId]);
        if (globalConfig) {
          dispatch(setGlobalConfig(globalConfig));
        }
      });
  }, [chainId, dispatch]);
}

function useResetStateGlobal() {
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { pathname } = useLocation();
  useEffect(() => {
    if (chainId) {
      dispatch(resetLiquidityFormByChainId({ chainId }));
    }
  }, [chainId, userAddr, dispatch]);
  useEffect(() => {
    if (chainId) {
      dispatch(resetHistory({ chainId }));
      dispatch(resetClosePositionForm({ chainId }));
      dispatch(resetAdjustMarginForm({ chainId }));
    }
  }, [chainId, userAddr, dispatch, pathname]);
}

export function useInitSignature(): void {
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  const getSignature = useCallback(async () => {
    if (userAddr) {
      const signature = await getSignatureToLocalForage(userAddr);
      if (signature) {
        dispatch(setSignature(signature));
      }
    }
  }, [dispatch, userAddr]);
  useEffect(() => {
    if (userAddr) {
      getSignature();
    }
  }, [getSignature, userAddr]);
}

const useInitIsBlacklisted = (): void => {
  const { isBlacklisted } = useIsBlacklisted();
  const userAddress = useUserAddr();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (userAddress) {
      dispatch(setUserIsBlacklisted({ userAddress, isBlacklisted }));
    }
  }, [dispatch, isBlacklisted, userAddress]);
};
let ipPolling: NodeJS.Timer;
const useCheckIpIsBlocked = (): void => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (ipPolling) {
      clearInterval(ipPolling);
    }
    if (process.env.REACT_APP_ENABLE_BLOCK_IP === 'true') {
      ipPolling = pollingFunc(() => {
        dispatch(fetchIpIsBlocked());
      }, IP_POLLING_INTERVAL);
    }
    return () => ipPolling && clearInterval(ipPolling);
  }, [dispatch]);

  const walletType = useWalletType();
  const disconnect = useWagmiDisconnect();
  const { logout } = useLoginInOrOutPrivyWallet();
  const isIpBlocked = useIsIpBlocked();
  const userAddr = useWalletAccount();

  // auto logout when ip is blocked
  useEffect(() => {
    if (userAddr && isIpBlocked) {
      // disconnect wallet
      if (walletType === WalletType.PRIVY) {
        logout();
      }
      localStorage.removeItem(WALLET_TYPE);
      disconnect();
    }
  }, [disconnect, dispatch, isIpBlocked, logout, userAddr, walletType]);
};

export default function GlobalGlobalEffect(): null {
  const chainId = useChainId();
  useTokenPrices({ chainId });
  useSetDefaultConfig(chainId);
  useAutoSetDarkTheme(chainId);
  useWhitelistConfig();
  useCloseModalsOnSwitching();
  useFetchCoingeckoConfig();
  useCheckIpIsBlocked();
  useSetUpPairsFavoriteFromLocal();
  useSetUpGlobalConfigFromLocal();
  useResetStateGlobal();
  useOnChainReferralCodeChecker();
  useInitIsBlacklisted();
  // useInitSignature();
  return null;
}
