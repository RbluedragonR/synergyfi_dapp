/**
 * @description Component-DepositModal
 */
import './index.less';

import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import OdysseyRewardCard from '@/components/Card/OdysseyRewardsCard';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { BALANCE_TYPE } from '@/constants';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { setGateAccountState } from '@/features/balance/actions';
import { useGateAccountState, useTokenBalance, useTokenGateBalanceByChainIdAndAddress } from '@/features/balance/hook';
import { setPortfolioDepositOrWithdrawOperateToken } from '@/features/portfolio/actions';
import { usePortfolioOperateToken } from '@/features/portfolio/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import WalletDrawerWrapper from '@/pages/components/WalletStatus/WalletDrawerWrapper';
import WalletModalWrapper from '@/pages/components/WalletStatus/WalletModalWrapper';
import { useAccountDepositWithdrawCheck } from '@/pages/portfolio/Assets/hooks/assetsHook';
import { getDefaultITradeAccountState } from '@/types/balance';
import { DepositModalProps } from '@/types/modal';
import { isWrappedNativeToken } from '@/utils/token';

import DepositForm from './DepositForm';
import DepositFormAlert from './DepositFormAlert';
import DepositModalFooter from './DepositModalFooter';
import './index.less';
const DepositModal: FC<DepositModalProps> = function ({ type, open: visible, onCloseModal, quote: quote }) {
  const { isMobile } = useMediaQueryDevice();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  const tradeAccountState = useGateAccountState(chainId);
  const tokenInfo = usePortfolioOperateToken(chainId, userAddr);
  const adjustQuote = useMemo(() => {
    if (chainId && quote && isWrappedNativeToken(chainId, quote.address)) {
      return tokenInfo;
    }
    return quote;
  }, [chainId, quote, tokenInfo]);
  const isWrappedNativeTokenInfo = useMemo(() => {
    return chainId && quote && isWrappedNativeToken(chainId, quote.address);
  }, [chainId, quote]);
  const tokenBalance = useTokenBalance(adjustQuote?.address || '', chainId);
  const gateBalance = useTokenGateBalanceByChainIdAndAddress(chainId, quote?.address || '');
  const simulation = useAccountDepositWithdrawCheck(
    WrappedBigNumber.from(tradeAccountState?.depositAmountStr || 0),
    gateBalance?.balance,
    tokenBalance,
    type as BALANCE_TYPE,
    chainId,
  );

  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      if (chainId && userAddr && quote)
        dispatch(setPortfolioDepositOrWithdrawOperateToken({ chainId, userAddr, tokenInfo: quote }));
    }
  }, [chainId, dispatch, quote, userAddr, visible]);

  const onClickModal = useCallback(() => {
    onCloseModal();
    isWrappedNativeTokenInfo &&
      chainId &&
      userAddr &&
      quote &&
      dispatch(setPortfolioDepositOrWithdrawOperateToken({ chainId, userAddr, tokenInfo: quote }));
    chainId &&
      dispatch(
        setGateAccountState({
          chainId,
          ...getDefaultITradeAccountState(),
        }),
      );
  }, [chainId, dispatch, isWrappedNativeTokenInfo, onCloseModal, quote, userAddr]);

  return isMobile ? (
    <WalletDrawerWrapper
      className={classNames('syn-deposit-modal-drawer', 'reverse-header', 'syn-mobile-deposit-modal-drawer')}
      open={visible}
      height={'auto'}
      title={type === BALANCE_TYPE.DEPOSIT ? t('common.deposit') : t('common.withdraw')}
      destroyOnClose={true}
      placement="bottom"
      onClose={() => {
        onClickModal();
      }}
      cardProps={{
        tabList: [],
        title: type === BALANCE_TYPE.DEPOSIT ? t('common.deposit') : t('common.withdraw'),
        showSliderBar: true,
        showSettingsIcon: false,
        alert: (
          <DepositFormAlert
            simulation={simulation}
            type={type}
            quote={adjustQuote}
            chainId={chainId}
            originQuote={quote}
          />
        ),
        footer: (
          <DepositModalFooter simulation={simulation} type={type} quote={adjustQuote} onCloseModal={onCloseModal} />
        ),
      }}>
      <DepositForm type={type} quote={quote} simulation={simulation} />
    </WalletDrawerWrapper>
  ) : (
    <>
      <WalletModalWrapper
        open={visible}
        width={424}
        className={classNames(
          'syn-deposit-modal',
          type === BALANCE_TYPE.DEPOSIT && 'syn-deposit-modal-for-odyssey-reward',
        )}
        maskClosable={true}
        destroyOnClose={true}
        onClose={() => {
          onClickModal();
        }}
        onCancel={onCloseModal}
        cardProps={{
          tabList: [],
          title: type === BALANCE_TYPE.DEPOSIT ? t('common.deposit') : t('common.withdraw'),
          showSliderBar: true,
          showSettingsIcon: false,
          alert: (
            <DepositFormAlert
              simulation={simulation}
              type={type}
              quote={adjustQuote}
              chainId={chainId}
              originQuote={quote}
            />
          ),
          footer: (
            <DepositModalFooter simulation={simulation} type={type} quote={adjustQuote} onCloseModal={onCloseModal} />
          ),
        }}>
        <DepositForm type={type} quote={quote} simulation={simulation}></DepositForm>
        {type === BALANCE_TYPE.DEPOSIT && quote && <OdysseyRewardCard isDepositModal quoteSymbol={quote.symbol} />}
      </WalletModalWrapper>
    </>
  );
};

export default React.memo(DepositModal);
