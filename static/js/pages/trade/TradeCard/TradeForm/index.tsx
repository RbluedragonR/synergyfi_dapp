/**
 * @description Component-TradeForm
 */
import './index.less';

import { usePrevious } from 'ahooks';
import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as LabelIcon } from '@/assets/svg/icon_rebate_round.svg';
import { Tooltip } from '@/components/ToolTip';
import { TRADE_TYPE } from '@/constants/trade';
import { useCurrentPairFromUrl, useGetDefaultLimitPrice, usePairDisabledForLimit } from '@/features/pair/hook';
import { resetFormByChainId, setLimitPrice, setTradeFormType } from '@/features/trade/actions';
import { useTradeSide, useTradeType } from '@/features/trade/hooks';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import DepositNativeCard from '@/pages/components/Portfolio/Vault/AccountButtons/Deposit/DepositModal/DepositNativeCard';
import WalletCardWrapper from '@/pages/components/WalletStatus/WalletCardWrapper';
import { formatNumber } from '@/utils/numberUtil';
import { isWrappedNativeToken } from '@/utils/token';

import { useBackendChainConfig } from '@/features/config/hook';
import TradeEarnTabs from '@/pages/components/Tabs/TradeEarnTabs';
import classNames from 'classnames';
import { useLocation } from 'react-router-dom';
import ScaleLimitForm from './ScaleLimitForm';
import TradeAdjust from './TradeAdjust';
import TradeClose from './TradeClose';
import TradeLimitForm from './TradeLimitForm';
import TradeMarketForm from './TradeMarketForm';
import TradeFormFooter from './tradeformFooter';
interface IPropTypes {
  children?: React.ReactNode;
}
const TradeForm: FC<IPropTypes> = function ({}) {
  const { state } = useLocation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const chainId = useChainId();
  const tradeType = useTradeType(chainId);
  const tradeSide = useTradeSide(chainId);
  const sdkContext = useSDK(chainId);
  const dappConfig = useBackendChainConfig(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const tradeTypePrev = usePrevious(tradeType);
  const { inDisabledPairs, pairDisabledInLimit } = usePairDisabledForLimit(currentPair);
  const isWrappedNative = useMemo(
    () => chainId && isWrappedNativeToken(chainId, currentPair?.rootInstrument.marginToken?.address || ''),
    [chainId, currentPair?.rootInstrument.marginToken?.address],
  );
  const getDefaultLimitPrice = useGetDefaultLimitPrice(currentPair, tradeSide, sdkContext);
  const tabList = [
    {
      key: TRADE_TYPE.MARKET.toString(),
      tab: <div className={classNames('syn-trade-form-tab')}>{t('common.tradePage.market')}</div>,
    },
    {
      key: TRADE_TYPE.LIMIT.toString(),
      tab: dappConfig?.trade?.isDisableLimitOrder ? (
        <Tooltip title="Coming Soon">
          <span>{t('common.limit')}</span>
        </Tooltip>
      ) : (
        <Tooltip title={inDisabledPairs ? t('common.tradePage.limitDisabled') : ''}>
          <div className={classNames('syn-trade-form-tab', { disabled: pairDisabledInLimit })}>
            <span>{t('common.limit')}</span>
            <Tooltip title={inDisabledPairs ? '' : t('tooltip.tradePage.feeRebate')}>
              <LabelIcon className="syn-trade-form-tab-label" />
            </Tooltip>
          </div>
        </Tooltip>
      ),
      disabled: pairDisabledInLimit,
    },
    {
      key: TRADE_TYPE.SCALE_LIMIT.toString(),
      disabled: pairDisabledInLimit,
      tab: dappConfig?.trade?.isDisableLimitOrder ? (
        <Tooltip title="Coming Soon">
          <span>{t('common.limit')}</span>
        </Tooltip>
      ) : (
        <Tooltip title={inDisabledPairs ? t('common.tradePage.limitDisabled') : ''}>
          <div className={classNames('syn-trade-form-tab', { disabled: pairDisabledInLimit })}>
            <span>{t('common.tradePage.scaleLimit')}</span>
            <Tooltip title={inDisabledPairs ? '' : t('tooltip.tradePage.feeRebate')}>
              <LabelIcon className="syn-trade-form-tab-label" />
            </Tooltip>
          </div>
        </Tooltip>
      ),
    },
  ];

  const onTabChange = useCallback(
    async (key: string) => {
      const tradeType = key as TRADE_TYPE;
      if ([TRADE_TYPE.LIMIT, TRADE_TYPE.SCALE_LIMIT].includes(tradeType)) {
      }
      chainId &&
        dispatch(
          setTradeFormType({
            chainId,
            tradeType: key as TRADE_TYPE,
          }),
        );
      if (tradeType === TRADE_TYPE.LIMIT) {
        const defaultLimitPrice = await getDefaultLimitPrice();

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
      }
    },
    [chainId, currentPair?.priceDecimal, dispatch, getDefaultLimitPrice],
  );
  const closeDepositNativeInTrade = useCallback(() => {
    if (chainId) {
      if (tradeTypePrev === TRADE_TYPE.ADJUST_MARGIN) {
        dispatch(
          setTradeFormType({
            chainId,
            tradeType: TRADE_TYPE.ADJUST_MARGIN,
          }),
        );
      } else {
        dispatch(
          resetFormByChainId({
            chainId,
          }),
        );
      }
    }
  }, [chainId, dispatch, tradeTypePrev]);

  useEffect(() => {
    if (state?.toLimitTab) {
      onTabChange(TRADE_TYPE.LIMIT);
    }
    // only depend on this
  }, [state?.toLimitTab]);

  return (
    <div className="trade-area">
      {[TRADE_TYPE.MARKET, TRADE_TYPE.LIMIT, TRADE_TYPE.SCALE_LIMIT].includes(tradeType as TRADE_TYPE) && (
        <WalletCardWrapper
          extraHeader={
            <div className="syn-trade-form-extra-header">
              <TradeEarnTabs isTrade pairSymbol={currentPair?.symbol} />
            </div>
          }
          bordered={false}
          tabList={tabList}
          isWrappedNative={isWrappedNative}
          tabKey={tradeType.toString()}
          onTabChange={onTabChange}
          footer={<TradeFormFooter tradeType={tradeType} />}
          className="syn-trade-form">
          {tradeType === TRADE_TYPE.MARKET && <TradeMarketForm />}
          {tradeType === TRADE_TYPE.LIMIT && <TradeLimitForm />}
          {tradeType === TRADE_TYPE.SCALE_LIMIT && <ScaleLimitForm />}
        </WalletCardWrapper>
      )}
      {tradeType === TRADE_TYPE.ADJUST_MARGIN && <TradeAdjust />}
      {tradeType === TRADE_TYPE.CLOSE_POSITION && <TradeClose />}
      {tradeType === TRADE_TYPE.DEPOSIT_NATIVE && (
        <DepositNativeCard closeDepositNativeInTrade={closeDepositNativeInTrade} />
      )}
    </div>
  );
};

export default TradeForm;
