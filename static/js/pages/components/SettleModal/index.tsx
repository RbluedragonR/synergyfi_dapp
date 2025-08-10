/**
 * @description Component-SettleModal
 */

import './index.less';

import { utils } from '@synfutures/sdks-perp';
import { useAsyncEffect } from 'ahooks';
import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { GlobalModalType, THEME_ENUM } from '@/constants';
import { EMERGENCY_CLOSE_TIME } from '@/constants/portfolio';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useModalOpen, useTheme, useToggleModal } from '@/features/global/hooks';
import { useSettlingPortfolio } from '@/features/portfolio/hook';
import { useSDK } from '@/features/web3/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import WalletDrawerWrapper from '../WalletStatus/WalletDrawerWrapper';
import WalletModalWrapper from '../WalletStatus/WalletModalWrapper';
import ImgFrozen_constr from './assets/icon_mj_construction@2x 3.png';
import SettleModalFooter from './SettleModalFooter';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const SettleModal: FC<IPropTypes> = function ({}) {
  const { isMobile } = useMediaQueryDevice();
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { dataTheme } = useTheme();
  const toggleModal = useToggleModal(GlobalModalType.SETTLE);
  const [seconds, setSeconds] = useState(EMERGENCY_CLOSE_TIME);
  const settlingPortfolio = useSettlingPortfolio(chainId, userAddr);
  const sdk = useSDK(chainId);
  const [settledBalance, setSettledBalance] = useState<WrappedBigNumber | undefined>(undefined);
  const visible = useModalOpen(GlobalModalType.SETTLE);

  const isAbnormalInstrument = useMemo(() => {
    return !settlingPortfolio?.rootInstrument?.isNormalInstrument || false;
  }, [settlingPortfolio?.rootInstrument?.isNormalInstrument]);

  useEffect(() => {
    toggleModal(false);
  }, [chainId, userAddr]);

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (isAbnormalInstrument && visible) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => !!interval && clearInterval(interval);
  }, [isAbnormalInstrument, seconds, visible]);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      if (seconds === 1 && visible) {
        toggleModal(false);
      }
    }, 0);
    return () => timeOut && clearTimeout(timeOut);
  }, [seconds, visible]);

  useEffect(() => {
    if (visible) {
      setSeconds(EMERGENCY_CLOSE_TIME);
    }
  }, [visible]);

  useAsyncEffect(async () => {
    try {
      if (sdk && settlingPortfolio) {
        setSettledBalance(undefined);
        const position = await sdk.perp.observer.getPositionIfSettle(settlingPortfolio, settlingPortfolio.rootPair);

        const equity = utils.positionEquity(position, settlingPortfolio.rootPair);
        setSettledBalance(WrappedBigNumber.from(equity));
      }
    } catch (error) {
      console.log('get settled account total balance error:', error);
    }
  }, [sdk, settlingPortfolio]);

  const onClickModal = useCallback(() => {
    toggleModal(false);
  }, [toggleModal]);

  const onCloseModal = useCallback(() => {
    toggleModal(false);
  }, [toggleModal]);
  const cardProps = useMemo(
    () => ({
      tabList: [],
      title: isAbnormalInstrument ? false : t('common.portfolio.settleForm.title'),
      // collapsePanelSlot: <DepositMiniDescription underlying={underlying} type={type} />,
      showSliderBar: true,
      // showSubSlotSwitch: false,
      showSettingsIcon: false,
      //   alert: <DepositFormAlert simulation={simulation} quote={quote} chainId={chainId}></DepositFormAlert>,
      footer: isAbnormalInstrument ? (
        <Button type="primary" block onClick={onCloseModal}>
          {t('common.portfolio.settleForm.maintenanceBtnText')}({seconds}s)
        </Button>
      ) : (
        <SettleModalFooter
          chainId={chainId}
          userAddr={userAddr}
          settlingPortfolio={settlingPortfolio}
          onCloseModal={onCloseModal}
        />
      ),
    }),
    [chainId, isAbnormalInstrument, onCloseModal, seconds, settlingPortfolio, t, userAddr],
  );
  const cardForm = useMemo(
    () => (
      <div className="syn-settle-modal-form">
        {isAbnormalInstrument ? (
          <div className="syn-settle-modal-form-wrap">
            <div className="syn-settle-modal-form-img">
              <img
                loading="lazy"
                src={dataTheme === THEME_ENUM.LIGHT ? ImgFrozen_constr : ImgFrozen_constr}
                alt="frozen"
              />
            </div>
            <div>
              <div className="syn-settle-modal-form-title">{t('common.portfolio.settleForm.AbnormalTitle1')}</div>
              <div className="syn-settle-modal-form-title">{t('common.portfolio.settleForm.AbnormalTitle2')}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="syn-settle-modal-form-content">
              <span>{t('common.portfolio.settleForm.totalBalance')}</span>
              <div className="syn-settle-modal-form-content-line"></div>
              <EmptyDataWrap isLoading={!settledBalance}>
                {settledBalance && (
                  <span>
                    {settledBalance.formatNumberWithTooltip({
                      suffix: settlingPortfolio?.rootInstrument.quoteToken.symbol,
                      showZeroIfNegative: true,
                    })}
                  </span>
                )}
              </EmptyDataWrap>
            </div>
            <ul className="syn-settle-modal-form-list">
              <li>
                <Trans
                  i18nKey="common.portfolio.settleForm.line1"
                  values={{
                    symbol: settlingPortfolio?.rootInstrument.quoteToken.symbol,
                  }}
                  components={{ b: <b /> }}
                />
              </li>
              <li>
                <Trans i18nKey="common.portfolio.settleForm.line2" components={{ b: <b /> }} />
              </li>
            </ul>
          </>
        )}
      </div>
    ),
    [dataTheme, isAbnormalInstrument, settledBalance, settlingPortfolio?.rootInstrument.quoteToken.symbol, t],
  );

  return isMobile ? (
    <WalletDrawerWrapper
      open={visible}
      height={'auto'}
      title={isAbnormalInstrument ? '' : t('common.settle')}
      className={classNames('syn-settle-modal', isAbnormalInstrument ? 'emergency' : '')}
      destroyOnClose={true}
      styles={{ header: isAbnormalInstrument ? { display: 'none' } : {} }}
      onClose={() => {
        onClickModal();
      }}
      placement="bottom"
      cardProps={cardProps}>
      {cardForm}
    </WalletDrawerWrapper>
  ) : (
    <WalletModalWrapper
      open={visible}
      width={424}
      className={classNames('syn-settle-modal', isAbnormalInstrument ? 'emergency' : '')}
      // maskClosable={false}
      destroyOnClose={true}
      onClose={() => {
        onClickModal();
      }}
      onCancel={onCloseModal}
      cardProps={cardProps}>
      {cardForm}
    </WalletModalWrapper>
  );
};

export default SettleModal;
