/**
 * @description Component-TradeAdjustClose
 */
import './index.less';

import classNames from 'classnames';
import { FC, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Alert from '@/components/Alert';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { Message } from '@/components/Message';
import SynTab from '@/components/SynTab';
import WrappedButton from '@/components/WrappedButton';
import { FETCHING_STATUS } from '@/constants';
import { MANAGE_SIDE } from '@/constants/trade';
import WalletCardWrapper from '@/pages/components/WalletStatus/WalletCardWrapper';

import { Tooltip } from '@/components/ToolTip';
import { useIsIpBlocked } from '@/features/global/hooks';
import { useCurrentPairByDevice } from '@/features/pair/hook';
import { setAdjustMarginMethod } from '@/features/trade/actions';
import { useAppDispatch, useAppSelector } from '@/hooks';
import useMarginAdjust from '@/hooks/trade/MarginAdjust/useMarginAdjust';
import { useMarginAdjustByLeverageInput } from '@/hooks/trade/MarginAdjust/useMarginAdjustByLeverage';
import useMarginAdjustMethod from '@/hooks/trade/MarginAdjust/useMarginAdjustMethod';
import { useChainId } from '@/hooks/web3/useChain';
import TradeEarnTabs from '@/pages/components/Tabs/TradeEarnTabs';
import { MarginAdjustMethod } from '@/types/trade';
import TradeAdjustDetail from './TradeAdjustDetail';
import MarginAdjustByAmount from './TradeMarginAdjustAmount';
import TradeMarginAdjustLeverage from './TradeMarginAdjustLeverage';

interface IPropTypes {
  onClose?: () => void;
}
const TradeAdjust: FC<IPropTypes> = function ({ onClose }) {
  const { activeMarginAdjustMethod, toggleActiveMarginAdjustMethod, tradeAdjustMethodItems } = useMarginAdjustMethod();
  const manageSides = useAppSelector((state) => state.trade.adjustMarginControlState.manageSides);
  const chainId = useChainId();
  const leverageErrMsg = useAppSelector(
    (state) => chainId && state.trade.chainAdjustMarginByLeverageState[chainId]?.errMsg,
  );

  const currentPair = useCurrentPairByDevice(chainId);
  const dispatch = useAppDispatch();

  const {
    closeSection,
    marginTokenAmount,
    isLoading,
    isDisable,
    adjustPositionMargin,
    adjustFormStatus,
    adjustMarginSimulation,
    currentPosition,
    errMsg,
    isShowDepositInfo,
    depositInfo,
    displayBalance,
    adjustMarginFormState,
  } = useMarginAdjust(onClose);

  const { isMobile, deviceType } = useMediaQueryDevice();
  const { t } = useTranslation();
  const manageSide = useMemo(() => manageSides[activeMarginAdjustMethod], [activeMarginAdjustMethod, manageSides]);
  const { disable } = useMarginAdjustByLeverageInput();

  const inDisabledAdjustWithdraw = useMemo(
    () => manageSide === MANAGE_SIDE.OUT && !!currentPair?.symbol && !currentPair?.withinDeviationLimit,
    [currentPair?.symbol, currentPair?.withinDeviationLimit, manageSide],
  );

  const ipBlocked = useIsIpBlocked();
  useEffect(() => {
    dispatch(setAdjustMarginMethod(MarginAdjustMethod.Leverage));
  }, [dispatch]);
  return (
    <WalletCardWrapper
      clickClose={closeSection}
      showSettingsIcon={false}
      extraHeader={
        !isMobile && (
          <div className="syn-trade-form-extra-header">
            <TradeEarnTabs isTrade pairSymbol={currentPair?.symbol} />
          </div>
        )
      }
      footer={
        <Tooltip title={inDisabledAdjustWithdraw && t('tooltip.tradePage.disableAdjustWithdraw')}>
          <WrappedButton
            noNeedApprove={manageSide === MANAGE_SIDE.OUT}
            className={classNames('syn-trade-adjust-btn', manageSide === MANAGE_SIDE.OUT && 'syn-trade-adjust-btn-out')}
            amount={marginTokenAmount}
            loading={isLoading}
            disabled={
              isDisable ||
              inDisabledAdjustWithdraw ||
              (disable && activeMarginAdjustMethod === MarginAdjustMethod.Leverage) ||
              (!!leverageErrMsg && activeMarginAdjustMethod === MarginAdjustMethod.Leverage) ||
              adjustMarginSimulation?.data === undefined ||
              ipBlocked
            }
            marginToken={currentPair?.rootInstrument.marginToken}
            afterApproved={adjustPositionMargin}>
            {manageSide === MANAGE_SIDE.OUT
              ? t('common.tradePage.adjustMargin.reduce')
              : t('common.tradePage.adjustMargin.topUp')}
          </WrappedButton>
        </Tooltip>
      }
      title={isMobile ? '' : t('common.adjustM')}
      mode={isMobile ? undefined : 'modal'}
      className={classNames('syn-trade-adjust', deviceType)}>
      <div className="syn-trade-adjust-method-tabs">
        {t('common.by')}
        <div style={{ width: 160 }}>
          <SynTab
            variant="rounded"
            disabled={adjustFormStatus === FETCHING_STATUS.FETCHING}
            activeKey={activeMarginAdjustMethod}
            items={tradeAdjustMethodItems}
            onChange={toggleActiveMarginAdjustMethod}
          />
        </div>
      </div>

      {activeMarginAdjustMethod === MarginAdjustMethod.Leverage && (
        <>{currentPair && <TradeMarginAdjustLeverage pair={currentPair} />}</>
      )}
      {activeMarginAdjustMethod === MarginAdjustMethod.Amount && (
        <>
          <MarginAdjustByAmount />
        </>
      )}

      {isMobile && <TradeAdjustDetail simulation={adjustMarginSimulation} currentPosition={currentPosition} />}
      {errMsg && (
        <>
          <Message msg={errMsg} status="warning" />
        </>
      )}
      {leverageErrMsg && (
        <>
          <Alert message={leverageErrMsg} type="error" showIcon />
        </>
      )}
      {isShowDepositInfo && depositInfo}
      {/* {!isShowDepositInfo && isShowVaultChange && vaultChangeInfo} */}
      {displayBalance.mul(0.95).lte(adjustMarginFormState.amount) && manageSide === MANAGE_SIDE.OUT && (
        <Alert
          message={<Trans t={t} i18nKey="common.tradePage.adjustMargin.maxWithdrawPolicy" components={{ b: <b /> }} />}
          type="info"
          showIcon
        />
      )}
    </WalletCardWrapper>
  );
};

export default TradeAdjust;
