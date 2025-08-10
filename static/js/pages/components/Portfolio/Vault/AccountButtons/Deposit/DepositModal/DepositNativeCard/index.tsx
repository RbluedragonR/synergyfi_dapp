/**
 * @description Component-DepositCard
 */
import './index.less';

import { FC, memo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { BALANCE_TYPE, TabType } from '@/constants';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { setGateAccountState } from '@/features/balance/actions';
import { useGateAccountState, useTokenBalance, useTokenGateBalanceByChainIdAndAddress } from '@/features/balance/hook';
import { useNativeToken } from '@/features/chain/hook';
import { resetLiquidityFormByChainId } from '@/features/earn/action';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import WalletCardWrapper from '@/pages/components/WalletStatus/WalletCardWrapper';
import { useAccountDepositWithdrawCheck } from '@/pages/portfolio/Assets/hooks/assetsHook';

import { useCurrentPairByDevice } from '@/features/pair/hook';
import TradeEarnTabs from '@/pages/components/Tabs/TradeEarnTabs';
import DepositForm from '../DepositForm';
import DepositFormAlert from '../DepositFormAlert';
import DepositModalFooter from '../DepositModalFooter';
interface IPropTypes {
  className?: string;
  location?: TabType;
  closeDepositNativeInTrade?: () => void;
  onDepositSuccess?: () => void;
}
const DepositNativeCard: FC<IPropTypes> = function ({
  location = TabType.Trade,
  closeDepositNativeInTrade,
  onDepositSuccess,
}) {
  const { t } = useTranslation();
  const { isMobile } = useMediaQueryDevice();
  const chainId = useChainId();
  const nativeToken = useNativeToken(chainId);
  const tradeAccountState = useGateAccountState(chainId);
  const tokenBalance = useTokenBalance(nativeToken?.address || '', chainId);
  const dispatch = useAppDispatch();
  const gateBalance = useTokenGateBalanceByChainIdAndAddress(chainId, nativeToken?.address || '');
  const currentPair = useCurrentPairByDevice(chainId);

  const simulation = useAccountDepositWithdrawCheck(
    WrappedBigNumber.from(tradeAccountState?.depositAmountStr || 0),
    gateBalance?.balance,
    tokenBalance,
    BALANCE_TYPE.DEPOSIT,
    chainId,
  );
  const closeSection = useCallback(() => {
    if (isMobile) {
      onDepositSuccess && onDepositSuccess();
    } else {
      if (chainId && location === TabType.Trade) {
        closeDepositNativeInTrade && closeDepositNativeInTrade();
      }
      chainId &&
        location === TabType.Earn &&
        dispatch(
          resetLiquidityFormByChainId({
            chainId,
          }),
        );
    }
  }, [chainId, closeDepositNativeInTrade, dispatch, isMobile, location, onDepositSuccess]);
  useEffect(() => {
    chainId &&
      dispatch(
        setGateAccountState({
          amountRatio: 0,
          depositAmountStr: '',
          chainId,
        }),
      );
  }, [chainId, dispatch]);
  return (
    <div className="syn-deposit-card">
      <WalletCardWrapper
        tabList={[]}
        mode="modal"
        clickClose={closeSection}
        title={isMobile ? false : t('common.deposit')}
        showSliderBar={true}
        showSettingsIcon={false}
        extraHeader={
          !isMobile && (
            <div className="syn-trade-form-extra-header">
              <TradeEarnTabs isTrade pairSymbol={currentPair?.symbol} />
            </div>
          )
        }
        alert={
          <DepositFormAlert
            type={BALANCE_TYPE.DEPOSIT}
            simulation={simulation}
            quote={nativeToken}
            originQuote={nativeToken}
            chainId={chainId}></DepositFormAlert>
        }
        footer={
          <DepositModalFooter
            simulation={simulation}
            type={BALANCE_TYPE.DEPOSIT}
            quote={nativeToken}
            onCloseModal={closeSection}
          />
        }>
        <DepositForm type={BALANCE_TYPE.DEPOSIT} quote={nativeToken} simulation={simulation} />
      </WalletCardWrapper>
    </div>
  );
};

export default memo(DepositNativeCard);
