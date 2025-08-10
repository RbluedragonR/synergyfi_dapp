import { CHAIN_ID } from '@derivation-tech/context';
import { useLocalStorageState } from 'ahooks';
import _ from 'lodash';
import moment from 'moment';
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import {
  DEFAULT_THEME,
  GlobalModalType,
  PERP,
  SecondGlobalModalType,
  TabType,
  THEME_ENUM,
  ThirdGlobalModalType,
} from '@/constants';
import { PAIR_PAGE_TYPE } from '@/constants/global';
import { SYN_AGREE_TERM } from '@/constants/storage';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useSystemPrefersColor } from '@/hooks/useSystemPrefersColor';
import { AnnouncementRes, IGlobalConfig } from '@/types/global';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { useUserAddr } from '@/hooks/web3/useChain';
import { useWalletAccount } from '@/hooks/web3/useWalletNetwork';
import { useYear2024SummaryStore } from '@/pages/Year2024Summary/store';
import { SetState } from 'ahooks/lib/createUseStorageState';
import { useSpotState } from '../spot/store';
import { useUserState } from '../user/hooks';
import { setOpenModal, setOpenSecondModal, setOpenThirdModal, setTheme } from './actions';
import {
  selectAnnouncementConfig,
  selectDataTheme,
  selectGlobalConfig,
  selectIpIsBlocked,
  selectModalOpen,
  selectOnChainReferralCode,
  selectSecondModalOpen,
  selectTabType,
  selectThirdModalOpen,
} from './globalSlice';
import { useConfigStoreWithChainId } from './store';
import { useGlobalStore } from './stores';
import { PollingHistoryId } from './type';
interface IUseThemeReturnTypes {
  dataTheme: THEME_ENUM;
  setDataTheme: (theme: THEME_ENUM) => void;
  isDark: boolean;
}
export const useTheme = (): IUseThemeReturnTypes => {
  const dataTheme = useAppSelector(selectDataTheme);
  const systemColor = useSystemPrefersColor();
  const dispatch = useAppDispatch();
  const setDataTheme = useCallback(
    (theme: THEME_ENUM) => {
      dispatch(setTheme(theme));
    },
    [dispatch],
  );

  const theme = useMemo(() => {
    if (dataTheme === 'auto') {
      return DEFAULT_THEME;
      return systemColor;
    } else {
      //document?.documentElement?.setAttribute('data-theme', dataTheme);
      document?.documentElement?.setAttribute('data-theme', dataTheme);
    }
    return dataTheme;
  }, [dataTheme, systemColor]);

  const isDark = useMemo(() => {
    return dataTheme === THEME_ENUM.DARK;
  }, [dataTheme]);

  return {
    dataTheme: theme,
    setDataTheme,
    isDark,
  };
};

// export function useGlobalState(): GlobalState {
//   const globalState = useAppSelector(selectGlobalState);
//   return globalState;
// }

export function useGlobalConfig(chainId: CHAIN_ID | undefined): IGlobalConfig {
  const chainGlobalConfig = useAppSelector(selectGlobalConfig);
  return useMemo(
    () => _.get(chainGlobalConfig, [chainId as number], {} as IGlobalConfig),
    [chainId, chainGlobalConfig],
  );
}
export function useResetTempGlobalConfig(chainId: CHAIN_ID | undefined) {
  const globalConfig = useGlobalConfig(chainId);
  const { setConfigTempByChainId } = useConfigStoreWithChainId(chainId);
  const { poolsToExclude, setPoolsToExcludeTemp } = useSpotState();
  const resetConfig = useCallback(() => {
    setConfigTempByChainId(globalConfig);
    setPoolsToExcludeTemp(poolsToExclude);
  }, [setConfigTempByChainId, globalConfig, setPoolsToExcludeTemp, poolsToExclude]);
  return resetConfig;
}

export function useGlobalModalType(): GlobalModalType | null {
  const openModal = useAppSelector(selectModalOpen);
  return openModal;
}

export function useModalOpen(modal: GlobalModalType): boolean {
  const openModal = useAppSelector(selectModalOpen);
  return openModal === modal;
}

export function useToggleModal(modal: GlobalModalType): (isOpen?: boolean) => void {
  const open = useModalOpen(modal);
  const dispatch = useAppDispatch();
  return useCallback(
    (isOpen?: boolean) => {
      let type = open ? null : modal;
      if (isOpen !== undefined) {
        type = isOpen ? modal : null;
      }
      dispatch(setOpenModal({ type: type }));
    },
    [dispatch, modal, open],
  );
}

export function useSecondGlobalModalType(): SecondGlobalModalType | null {
  const openModal = useAppSelector(selectSecondModalOpen);
  return openModal;
}

export function useSecondModalOpen(modal: SecondGlobalModalType): boolean {
  const openModal = useAppSelector(selectSecondModalOpen);
  return openModal === modal;
}

export function useThirdGlobalModalType(): ThirdGlobalModalType | null {
  const openModal = useAppSelector(selectThirdModalOpen);
  return openModal;
}

export function useThirdModalOpen(modal: ThirdGlobalModalType): boolean {
  const openModal = useAppSelector(selectThirdModalOpen);
  return openModal === modal;
}

export function useToggleSecondModal(modal: SecondGlobalModalType): (isOpen?: boolean) => void {
  const open = useSecondModalOpen(modal);
  const dispatch = useAppDispatch();
  return useCallback(
    (isOpen?: boolean) => {
      let type = open ? null : modal;
      if (isOpen !== undefined) {
        type = isOpen ? modal : null;
      }
      dispatch(setOpenSecondModal({ type }));
    },
    [dispatch, modal, open],
  );
}

export function useToggleThirdModal(modal: ThirdGlobalModalType): (isOpen?: boolean) => void {
  const open = useThirdModalOpen(modal);
  const dispatch = useAppDispatch();
  return useCallback(
    (isOpen?: boolean) => {
      let type = open ? null : modal;
      if (isOpen !== undefined) {
        type = isOpen ? modal : null;
      }
      dispatch(setOpenThirdModal({ type }));
    },
    [dispatch, modal, open],
  );
}

export function useTabType(): TabType {
  const tabType = useAppSelector(selectTabType);
  return tabType;
}

export function useAnnouncementConfig(): AnnouncementRes | undefined {
  const announcementConfig = useAppSelector(selectAnnouncementConfig);
  return useMemo(() => {
    return announcementConfig;
  }, [announcementConfig]);
}

export function useAccountWrap(): string | undefined | null {
  const account = useWalletAccount();
  const { impostorAddress } = useUserState();
  return useMemo(() => {
    if (impostorAddress) {
      return impostorAddress;
    }
    return account;
  }, [account, impostorAddress]);
}

export function useTitle(title: string | undefined): void {
  useEffect(() => {
    if (!title) {
      return;
    }
    const prevTitle = document.title;
    document.title = title;
    return () => {
      document.title = prevTitle;
    };
  });
}

export function usePage(): string {
  const location = useLocation();
  return useMemo(() => {
    return _.get(location.pathname?.split('/'), [1]);
  }, [location.pathname]);
}

export function useShowTermModal(): [boolean, boolean | undefined, (value?: SetState<boolean> | undefined) => void] {
  const [agree, setAgree] = useLocalStorageState<boolean>(SYN_AGREE_TERM, {
    defaultValue: false,
  });
  const isOpenModal = useModalOpen(GlobalModalType.Term);

  return [isOpenModal, agree, setAgree];
}

export function useInitialChainSwitchModal(): {
  isOpenModal: boolean;
} {
  const isOpenModal = useModalOpen(GlobalModalType.INITIAL_CHAIN_SWITCH);

  return {
    isOpenModal,
  };
}
export function useInitialSynScore2024Modal() {
  const { modalOpen, setModalOpen } = useYear2024SummaryStore();
  const { pathname } = useLocation();
  const userAddr = useWalletAccount();
  const onClose = useCallback(() => {
    setModalOpen(false);
    const storeKey = `initial-syn-score2024-modal-${userAddr}`;
    localStorage.setItem(storeKey, 'closed');
  }, [setModalOpen, userAddr]);

  useEffect(() => {
    if (userAddr) {
      const storeKey = `initial-syn-score2024-modal-${userAddr}`;
      if (localStorage.getItem(storeKey) !== 'closed') setModalOpen(true);
    }
  }, [setModalOpen, userAddr]);
  return {
    isOpenModal: pathname.includes('market') && modalOpen,
    onClose,
  };
}

export function usePnlShareModal(type = SecondGlobalModalType.PNL_SHARE) {
  const userAddr = useUserAddr();
  const isOpenModal = useSecondModalOpen(type);
  const togglePnlShareModal = useToggleSecondModal(type);
  const { isNotMobile } = useMediaQueryDevice();
  useEffect(() => {
    // close modal when change media size
    togglePnlShareModal(false);
  }, [isNotMobile, userAddr]);
  return {
    isOpenModal,
    togglePnlShareModal,
  };
}

export function useSecondModal(type: SecondGlobalModalType) {
  const isOpenModal = useSecondModalOpen(type);
  const toggleModal = useToggleSecondModal(type);

  return {
    isOpenModal,
    toggleModal,
  };
}

export function useExpiryFromParams(): number | undefined {
  const { expiry } = useParams();
  if (expiry === PERP.toLowerCase()) {
    return 0;
  }
  if (expiry) {
    return moment.utc(expiry).hour(8).unix();
  }
  return undefined;
}

export function useCurrentMarketType(): PAIR_PAGE_TYPE | null {
  const location = useLocation();
  const currentLocation = _.get(location.pathname.split('/'), [1]);
  if (currentLocation === PAIR_PAGE_TYPE.TRADE) {
    return PAIR_PAGE_TYPE.TRADE;
  }
  if (currentLocation === PAIR_PAGE_TYPE.EARN) {
    return PAIR_PAGE_TYPE.EARN;
  }
  return null;
}

export function useOnChainReferralCode():
  | {
      channel: string;
      referralCode: string;
    }
  | undefined {
  const onChainReferralCode = useAppSelector(selectOnChainReferralCode);
  return onChainReferralCode;
}

export function useIsIpBlocked(): boolean {
  return useAppSelector(selectIpIsBlocked);
}

export function usePollingHistoryTx(pollingHistoryId: PollingHistoryId, chainId?: number, userAddr?: string) {
  const { pollingHistoryTx } = useGlobalStore();
  return useMemo(() => {
    return userAddr && chainId && _.get(pollingHistoryTx, [chainId, userAddr, pollingHistoryId], undefined);
  }, [pollingHistoryTx, userAddr, chainId, pollingHistoryId]);
}
