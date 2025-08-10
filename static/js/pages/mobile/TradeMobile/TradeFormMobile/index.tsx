/**
 * @description Component-TradeFormMobile
 */
import './index.less';

import { Side } from '@synfutures/sdks-perp';
import { Tooltip } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as LabelIcon } from '@/assets/svg/label_rebate.svg';
import { TRADE_TYPE } from '@/constants/trade';
import { useCurrentPairFromUrl, useGetDefaultLimitPrice, usePairDisabledForLimit } from '@/features/pair/hook';
import { setLimitPrice, setTradeFormSide, setTradeFormType } from '@/features/trade/actions';
import { useTradeSide, useTradeType } from '@/features/trade/hooks';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import WalletCardWrapper from '@/pages/components/WalletStatus/WalletCardWrapper';
import TradeformFooter from '@/pages/trade/TradeCard/TradeForm/tradeformFooter';
import { formatNumber } from '@/utils/numberUtil';

import { useBackendChainConfig } from '@/features/config/hook';
import classNames from 'classnames';
import TradeLimitFormMobile from '../TradeLimitFormMobile';
import TradeMarketFormMobile from '../TradeMarketFormMobile';
import LimitDisabledDrawer from './LimitDisabledDrawer';
import TradeFormSideMobile from './TradeFormSideMobile';
interface IPropTypes {
  className?: string;
}
const TradeFormMobile: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const { t } = useTranslation();
  const [openLimitDrawer, setOpenLimitDrawer] = useState(false);
  const dispatch = useAppDispatch();
  const tradeType = useTradeType(chainId);
  const dappConfig = useBackendChainConfig(chainId);
  const tradeSide = useTradeSide(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const [inputTouched, setInputTouched] = useState(false);
  const sdkContext = useSDK(chainId);
  const { inDisabledPairs } = usePairDisabledForLimit(currentPair);
  const getDefaultLimitPrice = useGetDefaultLimitPrice(currentPair, tradeSide, sdkContext);
  const setDefaultLimitPrice = useCallback(
    async (tradeSide?: Side) => {
      const defaultLimitPrice = await getDefaultLimitPrice(tradeSide);
      if (defaultLimitPrice) {
        const inputAmountStr = formatNumber(
          defaultLimitPrice.adjustPrice.stringValue,
          currentPair?.priceDecimal,
          false,
        );
        chainId &&
          dispatch(
            setLimitPrice({
              chainId,
              limitPrice: inputAmountStr,
              alignedPrice: inputAmountStr,
            }),
          );
      }
    },
    [chainId, currentPair?.priceDecimal, dispatch, getDefaultLimitPrice],
  );
  const onTradeSideChange = useCallback(
    async (key: string) => {
      const side = Number(key) as Side;
      chainId &&
        dispatch(
          setTradeFormSide({
            chainId,
            tradeSide: side,
          }),
        );
      setInputTouched(false);
      if (tradeType === TRADE_TYPE.LIMIT) {
        setDefaultLimitPrice(side);
      }
    },
    [chainId, dispatch, setDefaultLimitPrice, tradeType],
  );

  const tabList = [
    {
      key: TRADE_TYPE.MARKET.toString(),
      tab: t('common.tradePage.market'),
    },
    {
      key: TRADE_TYPE.LIMIT.toString(),
      tab: dappConfig?.trade?.isDisableLimitOrder ? (
        <Tooltip title="Coming Soon">
          <span>{t('common.limit')}</span>
        </Tooltip>
      ) : (
        <div className={classNames('syn-trade-form-tab', { disabled: inDisabledPairs })}>
          <div className="syn-trade-form-mobile-tab-container">
            <span>{t('common.limit')}</span>
            <LabelIcon className="syn-trade-form-mobile-tab-label" />
          </div>
        </div>
      ),
      disabled: dappConfig?.trade?.isDisableLimitOrder,
    },
  ];
  const onTabChange = useCallback(
    (key: string) => {
      const tradeType = key as TRADE_TYPE;
      if (inDisabledPairs) {
        setOpenLimitDrawer(true);
        return;
      }
      chainId &&
        dispatch(
          setTradeFormType({
            chainId,
            tradeType,
          }),
        );
      if (tradeType === TRADE_TYPE.LIMIT) {
        setDefaultLimitPrice();
      }
    },
    [chainId, dispatch, inDisabledPairs, setDefaultLimitPrice],
  );

  useEffect(() => {
    setInputTouched(false);
  }, [tradeType]);
  return (
    <>
      <WalletCardWrapper
        bordered={false}
        tabList={tabList}
        tabKey={tradeType?.toString()}
        showSettingsIcon={false}
        onTabChange={onTabChange}
        footer={<TradeformFooter tradeType={tradeType} />}
        className="syn-trade-form-mobile">
        <TradeFormSideMobile chainId={chainId} onSideChange={onTradeSideChange} />
        {tradeType === TRADE_TYPE.MARKET && <TradeMarketFormMobile />}
        {tradeType === TRADE_TYPE.LIMIT && (
          <TradeLimitFormMobile inputTouched={inputTouched} inputTouchedChange={setInputTouched} />
        )}
      </WalletCardWrapper>
      <LimitDisabledDrawer open={openLimitDrawer} onClose={setOpenLimitDrawer} />
    </>
  );
};

export default TradeFormMobile;
