import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';

import { coingeckoSymbolMap } from '@/configs';
import {
  FETCHING_STATUS,
  GlobalModalType,
  SecondGlobalModalType,
  SystemPrefersColorScheme,
  TabType,
  ThirdGlobalModalType,
} from '@/constants';
import { CoingeckoSymbolMap } from '@/types/coingecko';
import { AnnouncementRes, IGlobalConfig, ISignature } from '@/types/global';

import { getDefaultTheme } from '@/utils';
import { AppState } from '../store';
import {
  fetchAnnouncementConfig,
  fetchCoingeckoSymbolMappingConfig,
  fetchIpIsBlocked,
  getSignature,
  setGlobalConfig,
  setOnChainReferralCode,
  setOpenModal,
  setOpenSecondModal,
  setOpenThirdModal,
  setSignature,
  setTabType,
  setTheme,
  setUserIsBlacklisted,
  signAgreement,
} from './actions';
export type WalletModalType = 'Account' | 'Wallet';

const defaultTheme = getDefaultTheme();

const localTheme = defaultTheme;
export enum MockDevToolProps {
  isMockVaultShowWithdrawlRequest = 'isMockVaultShowWithdrawlRequest',
  isMockSkeleton = 'isMockSkeleton',
  isMockNumber = 'isMockNumber',
  isMockNetworkError = 'isMockNetworkError',
}

export interface IGlobalState {
  chainGlobalConfig: {
    [chainId: number]: IGlobalConfig;
  };
  openModal: GlobalModalType | null;
  openSecondModal: SecondGlobalModalType | null;
  openThirdModal: ThirdGlobalModalType | null;
  tabType: TabType;
  mockDevToolProps: {
    [id in MockDevToolProps]: boolean;
  };
  announcementConfig?: AnnouncementRes;
  dataTheme: SystemPrefersColorScheme;
  coingecko: {
    symbolMap: CoingeckoSymbolMap;
  };

  userSignature: {
    [userAddr: string]: ISignature;
  };
  userIsBlacklisted: {
    [userAddr: string]: boolean;
  };
  onChainReferralCode?: {
    channel: string;
    referralCode: string;
  };
  ipBlocked: boolean;
}
const initialState: IGlobalState = {
  chainGlobalConfig: {},
  openModal: null,
  openSecondModal: null,
  openThirdModal: null,
  mockDevToolProps: {
    [MockDevToolProps.isMockVaultShowWithdrawlRequest]: false,
    [MockDevToolProps.isMockSkeleton]: false,
    [MockDevToolProps.isMockNumber]: false,
    [MockDevToolProps.isMockNetworkError]: false,
  },
  tabType: TabType.Trade,
  userIsBlacklisted: {},
  announcementConfig: {
    nonce: 0,
    isShow: false,
    desc: '',
    link: '',
    linkName: '',
    isOpenNewWindow: false,
  },
  dataTheme: localTheme,
  coingecko: {
    symbolMap: coingeckoSymbolMap,
  },
  userSignature: {},
  onChainReferralCode: undefined,
  ipBlocked: false,
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    toggleMockDevTool: (state, action: PayloadAction<MockDevToolProps>) => {
      if (process.env.REACT_APP_API_ENV === 'dev') {
        state.mockDevToolProps[action.payload] = !state.mockDevToolProps[action.payload];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setUserIsBlacklisted, (state, { payload: { userAddress, isBlacklisted } }) => {
        _.set(state.userIsBlacklisted, [userAddress], isBlacklisted);
      })
      .addCase(setTheme, (state, { payload }) => {
        state.dataTheme = payload;
      })
      .addCase(setGlobalConfig, (state, { payload }) => {
        _.set(state.chainGlobalConfig, [payload.chainId], payload);
      })
      .addCase(setOpenModal, (state, { payload: { type } }) => {
        state.openModal = type;
      })
      .addCase(setOpenSecondModal, (state, { payload: { type } }) => {
        state.openSecondModal = type;
      })
      .addCase(setOpenThirdModal, (state, { payload: { type } }) => {
        state.openThirdModal = type;
      })
      .addCase(setTabType, (state, { payload: { type } }) => {
        state.tabType = type;
      })
      .addCase(setSignature, (state, { payload }) => {
        _.set(state, [payload.address || ''], payload);
      })
      .addCase(getSignature.pending, (state, { meta }) => {
        _.set(state, [meta.arg.userAddr, 'status'], FETCHING_STATUS.FETCHING);
      })
      .addCase(getSignature.fulfilled, (state, { meta, payload }) => {
        _.set(state, [meta.arg.userAddr], {
          ...payload,
          status: FETCHING_STATUS.DONE,
        });
      })
      .addCase(getSignature.rejected, (state, { meta }) => {
        _.set(state, [meta.arg.userAddr, 'status'], FETCHING_STATUS.DONE);
      })
      .addCase(signAgreement.fulfilled, (state, { payload }) => {
        _.set(state, [payload.address || ''], {
          ...payload,
          status: FETCHING_STATUS.DONE,
        });
      })
      .addCase(fetchAnnouncementConfig.fulfilled, (state, { payload }) => {
        if (payload) {
          state.announcementConfig = payload;
        }
      })
      .addCase(fetchCoingeckoSymbolMappingConfig.fulfilled, (state, { payload }) => {
        if (payload) {
          const configs = _.keyBy(payload, 'symbol');
          state.coingecko.symbolMap = _.merge({}, state.coingecko.symbolMap, configs);
        }
      })
      .addCase(setOnChainReferralCode.fulfilled, (state, { payload }) => {
        state.onChainReferralCode = payload;
      })
      .addCase(fetchIpIsBlocked.fulfilled, (state, { payload }) => {
        state.ipBlocked = payload;
      });
  },
});

export const selectIpIsBlocked = (state: AppState): boolean => state.global.ipBlocked;

export const selectIsBlacklisted =
  (userAddress?: string) =>
  (state: AppState): boolean | undefined =>
    userAddress ? state.global.userIsBlacklisted[userAddress] : undefined;
export const selectGlobalState = (state: AppState): IGlobalState => state.global;
export const selectTabType = (state: AppState): TabType => state.global.tabType;

export const selectGlobalConfig = (
  state: AppState,
): {
  [chainId: number]: IGlobalConfig;
} => state.global.chainGlobalConfig;
export const selectModalOpen = (state: AppState): GlobalModalType | null => state.global.openModal;
export const selectSecondModalOpen = (state: AppState): SecondGlobalModalType | null => state.global.openSecondModal;
export const selectThirdModalOpen = (state: AppState): ThirdGlobalModalType | null => state.global.openThirdModal;

export const selectAnnouncementConfig = (state: AppState): AnnouncementRes | undefined =>
  state.global.announcementConfig;

export const selectDataTheme = (state: AppState): SystemPrefersColorScheme => state.global.dataTheme;

export const selectOnChainReferralCode = (
  state: AppState,
):
  | {
      channel: string;
      referralCode: string;
    }
  | undefined => state.global.onChainReferralCode;

export default globalSlice.reducer;
export const { toggleMockDevTool } = globalSlice.actions;
