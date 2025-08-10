/**
 * @description Component-ScaleLimitPreview
 */
import Modal from '@/components/Modal';
import './index.less';

import Alert from '@/components/Alert';
import { Button } from '@/components/Button';
import { FETCHING_STATUS, GlobalModalType } from '@/constants';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useWrappedOrderList } from '@/features/account/orderHook';
import { useGlobalConfig, useModalOpen, useToggleModal } from '@/features/global/hooks';
import { useTokenPrice } from '@/features/global/query';
import { useCurrentPairByDevice } from '@/features/pair/hook';
import { batchPlaceScaledLimitOrder } from '@/features/trade/actions';
import { useScaleFormState, useScaleFormStateStatus, useScaleSimulation, useTradeSide } from '@/features/trade/hooks';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useProvider, useUserAddr } from '@/hooks/web3/useChain';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { toWad } from '@/utils/numberUtil';
import { Side } from '@synfutures/sdks-perp';
import _ from 'lodash';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LimitFormDetail } from '../../TradeLimitForm/LimitFormDetail';
import ScaleLimitPreviewRow from './ScaleLimitPreviewRow';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const ScaleLimitPreview: FC<IPropTypes> = function ({}) {
  const modalOpen = useModalOpen(GlobalModalType.ORDER_PREVIEW);
  const toggleModal = useToggleModal(GlobalModalType.ORDER_PREVIEW);
  const { t } = useTranslation();
  const signer = useWalletSigner();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const tradeSide = useTradeSide(chainId);
  const sdkContext = useSDK(chainId);
  const scaleFormState = useScaleFormState(chainId);
  const currentPair = useCurrentPairByDevice(chainId);
  const simulation = useScaleSimulation(chainId);
  const provider = useProvider();
  const dispatch = useAppDispatch();
  const openOrders = useWrappedOrderList(chainId, userAddr, currentPair?.id);
  const tokenPriceInfo = useTokenPrice({ chainId, tokenAddress: currentPair?.rootInstrument.marginToken?.address });
  const scaleLimitFormStatus = useScaleFormStateStatus(chainId);
  const scaleSimulation = useScaleSimulation(chainId);
  const simulatedOrders = useMemo(
    () =>
      _.orderBy(simulation?.data?.orders, [(order) => WrappedBigNumber.from(order.limitPrice).stringValue], ['desc']),
    [simulation?.data?.orders],
  );
  const globalConfig = useGlobalConfig(chainId);
  const tradeText = useMemo(() => {
    return scaleFormState.tradeSide === Side.LONG ? t('common.buyUpper') : t('common.sellUpper');
  }, [scaleFormState.tradeSide, t]);
  return (
    <Modal
      width={640}
      centered={true}
      title={
        <div className="syn-scale-limit-preview-title">
          <div className="syn-scale-limit-preview-title-left">
            <span>{t('common.tradePage.orderView')}</span>
            {t('common.tradePage.limitOrders', { number: simulation?.data?.orders.length })}
          </div>
        </div>
      }
      className="syn-scale-limit-preview"
      open={modalOpen}
      footer={
        <div className="syn-scale-limit-preview-footer">
          <LimitFormDetail
            showSize={true}
            baseToken={currentPair?.rootInstrument.baseToken}
            isLoading={false}
            marginToken={currentPair?.rootInstrument.marginToken}
            chainId={chainId}
            simulationData={scaleSimulation?.data}
          />
          <div className="syn-scale-limit-preview-footer-right">
            <Alert showIcon={true} type="warning" message={t('common.tradePage.warningMsg.scaleLimitNotice')} />
            <Button
              type="primary"
              loading={scaleLimitFormStatus === FETCHING_STATUS.FETCHING}
              onClick={async () => {
                const baseAmountWad = toWad(scaleFormState?.baseAmount || 0);
                if (
                  signer &&
                  chainId &&
                  userAddr &&
                  sdkContext &&
                  currentPair &&
                  provider &&
                  simulation?.data &&
                  !baseAmountWad.eq(0) &&
                  globalConfig.deadline &&
                  scaleFormState.leverage
                ) {
                  try {
                    const result = await dispatch(
                      batchPlaceScaledLimitOrder({
                        signer,
                        chainId,
                        userAddr,
                        sdkContext,
                        pair: currentPair,
                        provider,
                        simulation: simulation.data,
                        deadline: Number(globalConfig.deadline),
                        side: tradeSide,
                        leverageWad: toWad(scaleFormState.leverage),
                        baseSizeWad: baseAmountWad,
                      }),
                    ).unwrap();
                    if (result) {
                      toggleModal();
                    }
                  } catch (e) {
                    console.log('🚀 ~ e:', e);
                  }
                }
              }}
              className={tradeSide === Side.SHORT ? 'short' : 'long'}
              chainIconProps={chainId && { chainId, width: 18, marginRight: 4 }}>
              {tradeText}
            </Button>
          </div>
        </div>
      }
      onCancel={() => toggleModal()}>
      <div className="syn-scale-limit-preview-table">
        <div className="syn-scale-limit-preview-table-header">
          <span>{t('common.price')}</span>
          <span>{t('common.size')}</span>
          <span>{t('common.margin')}</span>
          <span>{t('common.table.tradeV')}</span>
          <span>{t('common.table.feeEarned')}</span>
        </div>
        {simulatedOrders?.map((order) => (
          <ScaleLimitPreviewRow
            key={order.tick}
            orderList={openOrders}
            currentPair={currentPair}
            tokenPriceInfo={tokenPriceInfo}
            order={order}
          />
        ))}
      </div>
    </Modal>
  );
};

export default ScaleLimitPreview;
