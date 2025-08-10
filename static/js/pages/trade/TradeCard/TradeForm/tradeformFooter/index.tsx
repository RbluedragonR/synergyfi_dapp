/**
 * @description Component-TradeFormFooter
 */
import './index.less';

import { Side } from '@synfutures/sdks-perp';
import { BigNumber } from 'ethers';
import { FC, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { FETCHING_STATUS } from '@/constants';
import { TRADE_TYPE } from '@/constants/trade';
import { useMainPosition } from '@/features/account/positionHook';
import { useCurrentPairByDevice } from '@/features/pair/hook';
import {
  useCanPlaceCrossMarketOrder,
  useLimitFormStatus,
  useMarketFormStateStatus,
  useScaleSimulation,
  useTradeSide,
} from '@/features/trade/hooks';
// import { useGa } from '@/hooks/useGa';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { ApproveWrapButton } from '@/pages/components/WalletStatus/ApproveButton';
// import { GaCategory } from '@/utils/analytics';
// import { getDisplayExpiry } from '@/utils/feature';
import Alert from '@/components/Alert';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { formatDisplayNumber } from '@/utils/numberUtil';
import { useTradeFooterFormState } from './useTradeFooterStatus';
interface IPropTypes {
  disableBtn?: boolean;
  onTradeSuccess?: () => void;
  tradeType: TRADE_TYPE;
}
const TradeFormFooter: FC<IPropTypes> = function ({ disableBtn, tradeType }) {
  const { deviceType } = useMediaQueryDevice();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const marketFormStatus = useMarketFormStateStatus(chainId);
  const limitFormStatus = useLimitFormStatus(chainId);
  const tradeSide = useTradeSide(chainId);
  const { t } = useTranslation();
  const currentPair = useCurrentPairByDevice(chainId);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const canPlaceCrossMarketOrder = useCanPlaceCrossMarketOrder(chainId);
  const fetchingStatus = useMemo(() => {
    switch (tradeType) {
      case TRADE_TYPE.LIMIT:
        return limitFormStatus;
      case TRADE_TYPE.SCALE_LIMIT:
        return false;
      default:
        return marketFormStatus;
    }
  }, [tradeType, marketFormStatus, limitFormStatus]);
  const scaleLimitSimulation = useScaleSimulation(chainId);

  const {
    marginToDeposit,
    isDisableBtn,
    tradePrice,
    onTradeLimit,
    onTradeMarket,
    onTradeScaledLimit,
    onTradeCrossMarket,
  } = useTradeFooterFormState(tradeType, currentPair);

  const tradeText = useMemo(() => {
    if (tradeType === TRADE_TYPE.SCALE_LIMIT) {
      return t('common.preview');
    }
    return tradeSide === Side.LONG ? t('common.buyUpper') : t('common.sellUpper');
  }, [tradeSide, t, tradeType]);
  const signer = useWalletSigner();

  const onClickTradeButton = useCallback(
    async (originalSize: BigNumber) => {
      if (chainId && userAddr && signer && currentPair) {
        try {
          if (tradeType === TRADE_TYPE.SCALE_LIMIT) {
            onTradeScaledLimit();
          }
          if (tradeType === TRADE_TYPE.MARKET) {
            onTradeMarket(originalSize);
          } else if (tradeType === TRADE_TYPE.LIMIT) {
            canPlaceCrossMarketOrder ? onTradeCrossMarket() : onTradeLimit();
          }
        } catch (e) {}
      }
    },
    [
      chainId,
      userAddr,
      signer,
      currentPair,
      tradeType,
      onTradeScaledLimit,
      onTradeMarket,
      canPlaceCrossMarketOrder,
      onTradeCrossMarket,
      onTradeLimit,
    ],
  );
  return (
    <div className={`trade-form__footer ${deviceType}`}>
      {tradeType === TRADE_TYPE.SCALE_LIMIT && scaleLimitSimulation?.data && !scaleLimitSimulation?.message && (
        <Alert type="warning" showIcon={true} message={t('common.tradePage.warningMsg.scaleLimitNotice')} />
      )}

      <ApproveWrapButton
        className={`trade-form__btn ${tradeSide === Side.SHORT ? 'trade-form__btn-short' : ''}`}
        loading={fetchingStatus === FETCHING_STATUS.FETCHING}
        disabled={disableBtn || isDisableBtn}
        amount={marginToDeposit?.wadValue}
        marginToken={currentPair?.rootInstrument.marginToken}
        afterApproved={() => currentPosition && onClickTradeButton(currentPosition.size)}>
        {tradeText}
        <> &nbsp; {tradePrice ? '@ ' + formatDisplayNumber({ num: tradePrice || '', type: 'price' }) : ''} </>
      </ApproveWrapButton>
    </div>
  );
};

export default memo(TradeFormFooter);
