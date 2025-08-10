/**
 * @description Component-TradeForm
 */
import './index.less';

import React, { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TabType } from '@/constants';
import { EARN_TYPE } from '@/constants/earn';
import { setCurrentRange, setEarnFormType } from '@/features/earn/action';
import { useAddLiquidityFormState, useEarnFormType, useIsInWhiteList } from '@/features/earn/hook';
import { useCombinedPairFromUrl } from '@/features/pair/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import DepositNativeCard from '@/pages/components/Portfolio/Vault/AccountButtons/Deposit/DepositModal/DepositNativeCard';
import WalletCardWrapper from '@/pages/components/WalletStatus/WalletCardWrapper';
import { isWrappedNativeToken } from '@/utils/token';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { WrappedPair } from '@/entities/WrappedPair';
import TradeEarnTabs from '@/pages/components/Tabs/TradeEarnTabs';
import EarnFormFooter from '../EarnFormFooter';
import AddLiqForm from './AddLiqForm';
import PairNotInWhitelist from './PairNotInWhitelist';
import RemoveLiqForm from './RemoveLiqForm';

interface IPropTypes {
  children?: React.ReactNode;
  onClose?: () => void;
  isRemove?: boolean;
}
const EarnForm: FC<IPropTypes> = function ({ onClose, isRemove }) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const earnType = useEarnFormType(chainId);
  const addLiqFormState = useAddLiquidityFormState(chainId);
  const currentPair = useCombinedPairFromUrl(chainId);
  const isInWhiteList = useIsInWhiteList(chainId, userAddr, currentPair?.rootInstrument.quoteToken);
  const { isMobile } = useMediaQueryDevice();
  const isWrappedNative = useMemo(
    () => chainId && isWrappedNativeToken(chainId, currentPair?.rootInstrument.quoteToken?.address || ''),
    [chainId, currentPair?.rootInstrument.quoteToken?.address],
  );

  const tabList = useMemo(() => {
    if (earnType === EARN_TYPE.ADD_LIQ) {
      return [
        {
          key: EARN_TYPE.ADD_LIQ.toString(),
          tab: t('common.earn.addLiq'),
        },
      ];
    }
    return [
      {
        key: EARN_TYPE.REMOVE_LIQ.toString(),
        tab: t('common.earn.removeLiq'),
      },
    ];
  }, [earnType, t]);

  const formState = useMemo(() => {
    return earnType === EARN_TYPE.ADD_LIQ ? addLiqFormState : undefined;
  }, [addLiqFormState, earnType]);
  const closeRemove = useCallback(() => {
    if (isRemove && onClose) {
      onClose();
      return;
    }
    if (chainId) {
      dispatch(
        setEarnFormType({
          chainId,
          formType: EARN_TYPE.ADD_LIQ,
        }),
      );
      dispatch(
        setCurrentRange({
          chainId,
          rangeId: '',
        }),
      );
    }
  }, [chainId, dispatch, isRemove, onClose]);

  const isNewPair = !(currentPair instanceof WrappedPair);

  return (
    <>
      {!isInWhiteList && earnType !== EARN_TYPE.REMOVE_LIQ ? (
        <PairNotInWhitelist isNewPair={isNewPair} currentPair={currentPair} />
      ) : (
        (earnType === EARN_TYPE.ADD_LIQ || earnType === EARN_TYPE.REMOVE_LIQ) && (
          <WalletCardWrapper
            extraHeader={
              !isMobile && (
                <div className="syn-trade-form-earn-header">
                  <TradeEarnTabs disableTrade={isNewPair} isTrade={false} pairSymbol={currentPair?.symbol} />
                </div>
              )
            }
            tabList={tabList}
            mode={earnType === EARN_TYPE.REMOVE_LIQ ? 'modal' : undefined}
            clickClose={closeRemove}
            title={t('common.earn.removeLiq')}
            className="syn-earn-form"
            showSettingsIcon={!isMobile}
            isWrappedNative={isWrappedNative}
            tabKey={earnType.toString()}
            onTabChange={(key) => {
              chainId &&
                dispatch(
                  setEarnFormType({
                    chainId,
                    formType: key as EARN_TYPE,
                  }),
                );
            }}
            footer={
              <EarnFormFooter
                isMobile={isMobile}
                inputAmountStr={formState?.amount}
                earnType={earnType}
                clickClose={closeRemove}
              />
            }>
            {isRemove ? (
              <RemoveLiqForm />
            ) : (
              <>
                {earnType === EARN_TYPE.ADD_LIQ && <AddLiqForm />}
                {earnType === EARN_TYPE.REMOVE_LIQ && <RemoveLiqForm />}
              </>
            )}
          </WalletCardWrapper>
        )
      )}
      {earnType === EARN_TYPE.DEPOSIT_NATIVE && <DepositNativeCard location={TabType.Earn} />}
    </>
  );
};

export default EarnForm;
