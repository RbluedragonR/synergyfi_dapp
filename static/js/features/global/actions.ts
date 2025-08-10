import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Signer } from 'ethers';

import { GlobalModalType, SecondGlobalModalType, TabType, THEME_ENUM, ThirdGlobalModalType } from '@/constants';
import { CoingeckoMapping } from '@/types/coingecko';
import { AnnouncementRes, IGlobalConfig, ISignature } from '@/types/global';

import { DEFAULT_REFERRAL_CHANNEL, DEFAULT_REFERRAL_WALLET } from '@/constants/onChainReferral';
import { isMobile } from 'react-device-detect';
import { AppState } from '../store';
// import { WHITE_LIST_TYPE } from '@/constants/storage';
// import { isStableCoin } from '@/configs';

import { getOnChainReferralConfig } from '@/configs';
import { WalletType } from '@/types/wallet';
import { axiosGet } from '@/utils/axios';

const onChainReferralConfig = getOnChainReferralConfig();

export const setGlobalConfig = createAction<IGlobalConfig>('global/setGlobalConfig');
export const setUserIsBlacklisted = createAction<{
  userAddress: string;
  isBlacklisted: boolean;
}>('global/setUserIsBlacklisted');
export const setOpenModal = createAction<{ type: GlobalModalType | null }>('global/setOpenModal');
export const setOpenSecondModal = createAction<{ type: SecondGlobalModalType | null }>('global/setOpenSecondModal');
export const setOpenThirdModal = createAction<{ type: ThirdGlobalModalType | null }>('global/setOpenThirdModal');
export const setTabType = createAction<{ type: TabType }>('global/setTabType');
export const setTheme = createAction<THEME_ENUM>('global/setTheme');
export const setSignature = createAction<ISignature>('global/setSignature');

/**
 * @description fetch Announcement Config req
 */
export const fetchAnnouncementConfig = createAsyncThunk(
  'global/fetchAnnouncementConfig',
  async (): Promise<AnnouncementRes | undefined> => {
    try {
      const response = await axiosGet({
        url: `https://api.synfutures.com/ipfs/v2-config/${
          process.env.REACT_APP_API_ENV === 'dev' ? 'dev/' : ''
        }v3/announcement.json`,
      });
      if (response) {
        return response.data;
      }
    } catch (error) {
      console.error(`fetch global/fetchAnnouncementConfig error:  ${error}`);
      return undefined;
    }
  },
);

export const fetchCoingeckoSymbolMappingConfig = createAsyncThunk(
  'global/fetchCoingeckoSymbolMappingConfig',
  async (): Promise<CoingeckoMapping[]> => {
    try {
      const response = await axiosGet({ url: `https://api.synfutures.com/ipfs/v2-config/coingecko/symbol.json` });
      const res = await response.data;
      if (res) {
        return res;
      }
    } catch (error) {
      console.error(`fetch global/fetchCoingeckoSymbolMappingConfig error:  ${error}`);
      return [];
    }
    return [];
  },
);

export const fetchIpIsBlocked = createAsyncThunk('global/fetchIpIsBlocked', async (): Promise<boolean> => {
  try {
    if (process.env.REACT_APP_ENABLE_BLOCK_IP === 'true') {
      const response = await axiosGet({ url: `https://api.synfutures.com/v3/public/checkIp` });
      if (response) {
        return response.data.data.forbidden;
      }
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
});

export const getSignature = createAsyncThunk(
  'global/getSignature',
  async ({}: { userAddr: string }): Promise<ISignature> => {
    return {
      timestamp: new Date().toISOString(),
      signature: 'test',
    };
  },
);
export const signAgreement = createAsyncThunk(
  'global/signAgreement',
  async ({ message, signer }: { message: string; signer: Signer }): Promise<ISignature> => {
    const signature = await signer.signMessage(message);
    const address = await signer.getAddress();
    return {
      timestamp: new Date().toISOString(),
      signature,
      address,
    };
  },
);

export const setOnChainReferralCode = createAsyncThunk(
  'global/setOnChainReferralCode',
  async (
    {
      channel,
      platform,
      walletType,
    }: {
      channel?: string;
      platform?: number;
      walletType?: WalletType;
    },
    { getState },
  ): Promise<
    | {
        channel: string;
        referralCode: string;
      }
    | undefined
  > => {
    channel = channel?.toLowerCase()?.trim();
    if (!channel) {
      const {
        global: { onChainReferralCode },
      } = getState() as AppState;
      channel = onChainReferralCode?.channel;
    }
    //
    if (!channel || !/^([a-z]|[0-9]){6}$/g.test(channel)) {
      channel = DEFAULT_REFERRAL_CHANNEL;
    }

    if (!platform) {
      isMobile ? (platform = 2) : (platform = 1); // default platform: 1 as desktop, 2 as mobile
    }

    let walletNum = DEFAULT_REFERRAL_WALLET;
    if (walletType) {
      walletNum = onChainReferralConfig.wallet[walletType] || DEFAULT_REFERRAL_WALLET;
    }
    const referralCode = String.fromCharCode(platform) + String.fromCharCode(walletNum) + channel;
    // const referralCode = String.fromCharCode(Platform.SDK) + String.fromCharCode(Wallet.OKX_WALLET) + 'BNBNBN';
    return {
      channel,
      referralCode,
    };
  },
);
