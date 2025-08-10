import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { IVaultInfo, IVaultStats } from '@/types/vault';
import { axiosGet } from '@/utils/axios';
import { getTokenInfo } from '@/utils/token';
import { Stage } from '@synfutures/sdks-perp-launchpad';
import _ from 'lodash';

export const fetchVaultInfos = async ({
  chainId,
  userAddr,
}: {
  chainId: number;
  userAddr: string | undefined;
}): Promise<Record<string, IVaultInfo> | undefined> => {
  const res = await axiosGet({
    url: `/v3/public/vault`,
    config: {
      params: userAddr
        ? {
            chainId,
            address: userAddr,
          }
        : {
            chainId,
          },
    },
  });

  const data = res?.data?.data?.map((v: IVaultInfo) => ({
    ...v,
    vaultAddr: v.vaultAddress,
    tokenInfo: getTokenInfo(v.tokenInfo, chainId),
    minQuoteAmount: WrappedBigNumber.from(v.minQuoteAmount),
    liveThreshold: WrappedBigNumber.from(v.liveThreshold),
    tokenTvl: WrappedBigNumber.from(v.tokenTvl),
    tokenUsdTvl: WrappedBigNumber.from(v.tokenUsdTvl),
    ooPoints: WrappedBigNumber.from(v.ooPoints),
    stageForUi:
      WrappedBigNumber.from(v.tokenTvl).gte(v.liveThreshold) && v.status === Stage.UPCOMING ? Stage.LIVE : v.status,
  }));
  // ?.filter((v: IVaultInfo) => v.status !== Stage.INVALID && v.status !== Stage.SUSPENDED)
  return _.keyBy(data, 'vaultAddress');
};

export const fetchVaultSummary = async ({ chainId }: { chainId: number }): Promise<IVaultStats | undefined> => {
  const res = await axiosGet({
    url: `/v3/public/vault/summary`,
    config: {
      params: {
        chainid: chainId,
      },
    },
  });

  if (res?.data?.data) {
    return {
      ...res.data.data,
      totalTvlUsd: WrappedBigNumber.from(res.data.data.totalTvlUsd),
      totalVolumeUsd: WrappedBigNumber.from(res.data.data.totalVolumeUsd),
      allTimeEarnedUsd: WrappedBigNumber.from(res.data.data.allTimeEarnedUsd),
      count: WrappedBigNumber.from(res.data.data.count),
    };
  }
};
