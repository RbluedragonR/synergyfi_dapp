import { useMediaQueryDevice } from '@/components/MediaQuery';
import { ETH_DECIMALS_PLACES } from '@/constants';
import { FARCASTER_LINK, FARCASTER_SHARE_LINK, SHARE_GET } from '@/constants/links';
import { useMainPosition } from '@/features/account/positionHook';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { axiosGet } from '@/utils/axios';
import { cast, sleep, tweet } from '@/utils/common';
import { exportAsImage, exportAsImageDataURL, uploadImageAndGetId } from '@/utils/image';
import { getSharePNLId } from '@/utils/sharepnl';
import { showProperDateString } from '@/utils/timeUtils';
import {
  OptionId,
  PnlShareSettingProps,
  TSynSharePnlIdTimestampMaps,
  filterSynSharePnlIdTimestampMaps,
  getInitPnlShareSetting,
  pnlShareSettingStorageKey,
} from '@/utils/trade/pnlShare';
import { useAsyncEffect } from 'ahooks';
import _ from 'lodash';
import { RefObject, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useTradePositionNode from './useTradePositionNode';

export const optionInfos: { i18nId: string; optionId: OptionId }[] = [
  {
    i18nId: 'common.leverage',
    optionId: OptionId.leverage,
  },
  {
    i18nId: 'common.pnlShareModal.pnlAmount',
    optionId: OptionId.pnlAmount,
  },
  {
    i18nId: 'common.price',
    optionId: OptionId.price,
  },
];
type TBtnStatus = 'init' | 'loading' | 'done' | 'error';
export const pnlStorageKey = 'SYN_SHARE_PNL_ID_TIMESTAMP_MAP_0.0.3';
export const pnlNotiStorageKey = 'SYN_SHARE_PNL_Noti_ID_TIMESTAMP_MAP_0.0.1';

const clearUpOldKey = () => {
  localStorage.removeItem('SYN_SHARE_PNL_ID_TIMESTAMP_MAP_0.0.1');
  localStorage.removeItem('SYN_SHARE_PNL_ID_TIMESTAMP_MAP_0.0.2');
};
type TBtnId = 'copy' | 'download' | 'tweet' | 'farcaster';
clearUpOldKey();
const getSynSharePnlIdTimestampMaps = (storageKey: string) =>
  JSON.parse(localStorage.getItem(storageKey) || '{}') as TSynSharePnlIdTimestampMaps;
const setSynSharePnlIdTimestampMaps = (synSharePnlIdTimestampMaps: TSynSharePnlIdTimestampMaps, storageKey: string) =>
  localStorage.setItem(storageKey, JSON.stringify(synSharePnlIdTimestampMaps));

export default function usePnlSharePanel({
  cardRef,
  storageKey,
}: {
  cardRef: RefObject<HTMLDivElement>;
  storageKey: string;
}) {
  const initPnlShareSetting = getInitPnlShareSetting();
  const [btnStatus, setBtnStatus] = useState<{
    [id in TBtnId]: TBtnStatus;
  }>({ copy: 'init', download: 'init', tweet: 'init', farcaster: 'init' });
  const [shareLink, setShareLink] = useState('');
  const [btnMessage, setBtnMessage] = useState<{
    [id in TBtnId]: string | null;
  }>({ copy: null, download: null, tweet: null, farcaster: null });
  const [optionStatus, setOptionStatus] = useState<PnlShareSettingProps>(initPnlShareSetting);
  const { t } = useTranslation();
  const handleError = useCallback(
    async (btnId: TBtnId) => {
      setBtnStatus((prev) => {
        return { ...prev, [btnId]: 'error' };
      });
      setBtnMessage((prev) => {
        return { ...prev, [btnId]: t('common.pnlShareModal.tooltip.error') };
      });
      await sleep(2500);
      setBtnStatus((prev) => {
        return { ...prev, [btnId]: 'init' };
      });
      setBtnMessage((prev) => {
        return { ...prev, [btnId]: null };
      });
    },
    [t],
  );
  const handleFinish = useCallback(
    async (btnId: TBtnId) => {
      setBtnStatus((prev) => {
        return { ...prev, [btnId]: 'done' };
      });
      setBtnMessage((prev) => {
        return { ...prev, [btnId]: t(`common.pnlShareModal.tooltip.${btnId}`) };
      });
      await sleep(2500);
      setBtnStatus((prev) => {
        return { ...prev, [btnId]: 'init' };
      });
      setBtnMessage((prev) => {
        return { ...prev, [btnId]: null };
      });
    },
    [t],
  );
  const handleClickDownload = async () => {
    try {
      setBtnStatus((prev) => {
        return { ...prev, download: 'loading' };
      });
      await exportAsImage(cardRef.current, `syn-share-position-${Date.now()}.jpg`, { scale: 3 });
      handleFinish('download');
    } catch (error) {
      handleError('download');
    }
  };
  useEffect(() => {
    // clearup localstorage
    const oldMap = getSynSharePnlIdTimestampMaps(storageKey);
    setSynSharePnlIdTimestampMaps(oldMap ? filterSynSharePnlIdTimestampMaps(oldMap) : {}, storageKey);
    console.log('🚀 ~ clear up PnlShareId');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chainId = useChainId();
  const currentPairMobile = useCurrentPairFromUrl(chainId);
  const currentPairDefault = useCurrentPairFromUrl(chainId);
  const userAddr = useUserAddr();
  const { isNotMobile } = useMediaQueryDevice();
  const currentPair = isNotMobile ? currentPairDefault : currentPairMobile;
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const rootInstrument = currentPosition?.rootInstrument;
  const getIsUploadRequired = useCallback(
    (shareId: string) => {
      const sharePnlIdTimestampMap =
        chainId &&
        userAddr &&
        currentPair?.id &&
        _.get(getSynSharePnlIdTimestampMaps(storageKey), [String(chainId), userAddr, currentPair.id]);
      if (sharePnlIdTimestampMap && Object.keys(sharePnlIdTimestampMap).includes(shareId)) {
        return false;
      }
      return true;
    },
    [chainId, currentPair?.id, storageKey, userAddr],
  );
  const {
    tradePositionNode: { leverage, averagePrice, pnlPercent, markPrice, pnl, side, isClose },
  } = useTradePositionNode();

  useAsyncEffect(async () => {
    try {
      if (currentPair) {
        const res = await axiosGet({
          url: `${FARCASTER_LINK}/generate-pnl?chainId=${chainId}&traderAddress=${userAddr}&instrumentAddress=${
            currentPair?.rootInstrument.instrumentAddr
          }&expiry=${
            currentPair?.expiry
          }&side=${side?.toLocaleLowerCase()}&unrealizedPnl=${pnl?.formatNormalNumberString(
            ETH_DECIMALS_PLACES,
            false,
          )}&unrealizedPnlPercent=${pnlPercent?.formatNormalNumberString(
            ETH_DECIMALS_PLACES,
            false,
          )}&avgPrice=${averagePrice?.formatNormalNumberString(
            ETH_DECIMALS_PLACES,
            false,
          )}&markPrice=${markPrice?.formatNormalNumberString(
            ETH_DECIMALS_PLACES,
            false,
          )}&leverage=${leverage?.formatNormalNumberString(ETH_DECIMALS_PLACES, false)}&isClose=${isClose}${
            isClose ? `&tradePrice=${markPrice?.formatNormalNumberString(ETH_DECIMALS_PLACES, false)}` : ''
          }`,
        });
        const uploadUrl = res?.data?.data?.url;
        if (uploadUrl) {
          if (currentPair && rootInstrument) {
            const linkRes = {
              text: `Trading ${
                currentPair?.rootInstrument?.isInverse
                  ? `${currentPair?.rootInstrument?.quoteToken.symbol}/${currentPair?.rootInstrument?.baseToken?.symbol}`
                  : `${currentPair?.rootInstrument?.baseToken.symbol}/${currentPair?.rootInstrument?.quoteToken?.symbol}`
              } ${showProperDateString({
                expiry: currentPair?.expiry || 0,
                format: 'MMDD',
              })} on @SynFuturesDefi. 🚀 #CryptoTrading #DeFi`,
              url: uploadUrl,
            };
            setShareLink(
              `${FARCASTER_SHARE_LINK}${linkRes.text ? encodeURIComponent(linkRes.text) : ''}&embeds[]=${
                linkRes.url ? encodeURIComponent(linkRes.url) : ''
              }`,
            );
          }
        }
      }
    } catch (error) {
      console.log('🚀 ~ useAsyncEffect ~ error:', error);
    }
  }, [currentPair, userAddr]);

  const handleUpload = useCallback(
    async ({
      onGetShareUrl,
      onFinish,
      onConfirmUpdateRequired,
      onError,
      onUpload,
    }: {
      onGetShareUrl?: (shareUrl: string) => void;
      onConfirmUpdateRequired?: () => void;
      onFinish?: (shareUrl: string, uploadUrl?: string) => Promise<void>;
      onError?: () => void;
      onUpload?: () => Promise<string>;
    }) => {
      try {
        const pairId = currentPair?.id;
        if (chainId && pairId && userAddr) {
          const timestamp = Date.now();
          const shareId = getSharePNLId({
            storageKey,
            chainId,
            pairId,
            userAddr,
            shareLeverage: optionStatus.leverage,
            sharePnl: optionStatus.pnlAmount,
            sharePrice: optionStatus.price,
            timestamp,
          });
          const shareUrl = `${SHARE_GET}${shareId}&type=default`;
          onGetShareUrl?.(shareUrl);
          const isUpdateRequired = getIsUploadRequired(shareId);
          if (isUpdateRequired) {
            onConfirmUpdateRequired?.();
            const base64Data = await exportAsImageDataURL(cardRef.current, { scale: 2 });
            base64Data &&
              (await uploadImageAndGetId({
                id: shareId,
                base64Data,
                timestamp,
              }));
            setSynSharePnlIdTimestampMaps(
              _.set(
                getSynSharePnlIdTimestampMaps(storageKey) || {},
                [String(chainId), userAddr, currentPair.id, shareId],
                timestamp,
              ),
              storageKey,
            );
          }
          const uploadUrl = await onUpload?.();
          onFinish?.(shareUrl, uploadUrl);
        }
      } catch (error) {
        console.log('🚀 ~ usePnlSharePanel ~ error:', error);
        onError?.();
      }
    },
    [
      cardRef,
      chainId,
      currentPair?.id,
      getIsUploadRequired,
      optionStatus.leverage,
      optionStatus.pnlAmount,
      optionStatus.price,
      storageKey,
      userAddr,
    ],
  );
  const toggleOption = (optionId: OptionId) => {
    setOptionStatus((prev) => {
      const newOptionStatus = { ...prev, [optionId]: !prev[optionId] };
      localStorage.setItem(pnlShareSettingStorageKey, JSON.stringify(newOptionStatus));
      return newOptionStatus;
    });
  };

  return {
    handleClickDownload,
    handleCopy: useCallback(
      async () =>
        await handleUpload({
          onGetShareUrl: (shareUrl) => navigator.clipboard.writeText(shareUrl),
          onConfirmUpdateRequired: () =>
            setBtnStatus((prev) => {
              return { ...prev, copy: 'loading' };
            }),
          onFinish: async () => {
            handleFinish('copy');
          },
          onError: async () => {
            handleError('copy');
          },
        }),
      [handleError, handleFinish, handleUpload],
    ),
    handleTweet: useCallback(
      async () =>
        await handleUpload({
          onConfirmUpdateRequired: () =>
            setBtnStatus((prev) => {
              return { ...prev, tweet: 'loading' };
            }),
          onFinish: async (shareUrl) => {
            rootInstrument &&
              currentPair &&
              tweet({
                text: `Trading ${
                  rootInstrument.isInverse
                    ? `${rootInstrument.quoteToken.symbol}/${rootInstrument.baseToken?.symbol}`
                    : `${rootInstrument.baseToken.symbol}/${rootInstrument.quoteToken?.symbol}`
                } ${showProperDateString({
                  expiry: currentPair.expiry,
                  format: 'MMDD',
                })} on @SynFuturesDefi. 🚀 #CryptoTrading #DeFi`,
                url: shareUrl,
              });
            handleFinish('tweet');
          },
          onError: async () => {
            handleFinish('tweet');
          },
        }),
      [currentPair, handleFinish, handleUpload, rootInstrument],
    ),
    handleFarcaster: useCallback(
      async () =>
        await handleUpload({
          onConfirmUpdateRequired: () => {
            setBtnStatus((prev) => {
              return { ...prev, farcaster: 'loading' };
            });
          },
          onUpload: async () => {
            const res = await axiosGet({
              url: `${FARCASTER_LINK}/generate-pnl?chainId=${chainId}&traderAddress=${userAddr}&instrumentAddress=${
                currentPair?.rootInstrument.instrumentAddr
              }&expiry=${
                currentPair?.expiry
              }&side=${side?.toLocaleLowerCase()}&unrealizedPnl=${pnl?.formatNormalNumberString(
                ETH_DECIMALS_PLACES,
                false,
              )}&unrealizedPnlPercent=${pnlPercent?.formatNormalNumberString(
                ETH_DECIMALS_PLACES,
                false,
              )}&avgPrice=${averagePrice?.formatNormalNumberString(
                ETH_DECIMALS_PLACES,
                false,
              )}&markPrice=${markPrice?.formatNormalNumberString(
                ETH_DECIMALS_PLACES,
                false,
              )}&leverage=${leverage?.formatNormalNumberString(ETH_DECIMALS_PLACES, false)}&isClose=${isClose}${
                isClose ? `&tradePrice=${markPrice?.formatNormalNumberString(ETH_DECIMALS_PLACES, false)}` : ''
              }`,
            });
            return res?.data?.data?.url;
          },
          onFinish: async (shareUrl, uploadUrl) => {
            if (uploadUrl) {
              if (currentPair && rootInstrument) {
                const linkRes = {
                  text: `Trading ${
                    rootInstrument.isInverse
                      ? `${rootInstrument.quoteToken.symbol}/${rootInstrument.baseToken?.symbol}`
                      : `${rootInstrument.baseToken.symbol}/${rootInstrument.quoteToken?.symbol}`
                  } ${showProperDateString({
                    expiry: currentPair.expiry,
                    format: 'MMDD',
                  })} on @SynFuturesDefi. 🚀 #CryptoTrading #DeFi`,
                  url: uploadUrl,
                };
                setShareLink(
                  `${FARCASTER_SHARE_LINK}${linkRes.text ? encodeURIComponent(linkRes.text) : ''}&embeds[]=${
                    linkRes.url ? encodeURIComponent(linkRes.url) : ''
                  }`,
                );
                cast(linkRes);
              }

              handleFinish('farcaster');
            }
          },
          onError: async () => {
            handleFinish('farcaster');
          },
        }),
      [
        handleUpload,
        chainId,
        userAddr,
        currentPair,
        side,
        pnl,
        pnlPercent,
        averagePrice,
        markPrice,
        leverage,
        isClose,
        rootInstrument,
        handleFinish,
      ],
    ),
    toggleOption,
    optionStatus,
    btnStatus,
    btnMessage,
    shareLink,
  };
}
