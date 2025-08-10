import tableCheckSrc from '@/assets/svg/icon_table_check.svg';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { TabType } from '@/constants';
import { EARN_TYPE } from '@/constants/earn';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useAddLiquidationSimulation, useEarnFormType } from '@/features/earn/hook';
import { useTabType } from '@/features/global/hooks';
import { useChainOdysseyDappConfig, useEarnPoints, useTradePoints } from '@/features/odyssey/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useLimitFormState, useTradeType } from '@/features/trade/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { toBN } from '@/utils/numberUtil';
import { ReactNode, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export default function useOoPointsRightNode(): ReactNode {
  const { t } = useTranslation();
  const chainId = useChainId();
  const odysseyChainConfig = useChainOdysseyDappConfig(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const pairConfig = useMemo(() => {
    return odysseyChainConfig?.earnOoPointPairs?.find(
      (item) => item.pairSymbol.toLowerCase() === currentPair?.symbol.toLowerCase(),
    );
  }, [odysseyChainConfig?.earnOoPointPairs, currentPair?.symbol]);
  const userAddr = useUserAddr();
  const tabType = useTabType();
  let ooPoints: undefined | WrappedBigNumber = undefined;
  // OdysseyRewardCard in Trade Tab
  const tradeType = useTradeType(chainId);
  const ooPointsInTrade = useTradePoints(chainId, userAddr, currentPair?.symbol);
  const limitFormState = useLimitFormState(chainId);
  // OdysseyRewardCard in Earn Tab
  const ooPointsInEarn = useEarnPoints(chainId, userAddr, currentPair?.symbol);
  const earnType = useEarnFormType(chainId);
  const liquidationSimulation = useAddLiquidationSimulation(chainId);
  let ooPointsRightNode: ReactNode = null;

  const beforeSimulationOOPointsRightNode = useMemo(() => {
    // In Market Trade, Limit Trade, Add Liquidation, every pairs have oo point but different boost
    if (!pairConfig?.boost) return <img alt="check" src={tableCheckSrc} />;
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <UnderlineToolTip
          overlayClassName="oopoint-right-tooltip"
          title={
            <Trans i18nKey={'odyssey.rewardCard.tooltip.boostMultiplier'} values={{ boost: pairConfig?.boost }} />
          }>
          {t('odyssey.rewardCard.boost', { boost: pairConfig?.boost })}
        </UnderlineToolTip>
        <img alt="check" src={tableCheckSrc} />
      </span>
    );
  }, [pairConfig?.boost, t]);

  const afterSimulationOOPointsRightNode = (ooPoints: WrappedBigNumber, i18nKey: string, isEarn: boolean) => (
    <UnderlineToolTip title={<Trans i18nKey={i18nKey} components={{ b: <b /> }} />}>
      {isEarn ? (
        <Trans
          t={t}
          i18nKey="odyssey.rewardCard.estPoints"
          values={{
            points: ooPoints.formatDisplayNumber({ isShowSeparator: true, type: 'price' }),
          }}
        />
      ) : (
        <>
          {t('odyssey.rewardCard.upTo')} &nbsp;
          {ooPoints.formatDisplayNumber({ isShowSeparator: true, type: 'price' })}
        </>
      )}
    </UnderlineToolTip>
  );
  if (tabType === TabType.Trade) {
    // when user claer input then show 100x instead previous simulation
    if (toBN(limitFormState.baseAmount || 0).lte(0)) {
      ooPoints = undefined;
    } else {
      ooPoints = ooPointsInTrade;
    }
    ooPointsRightNode = (
      <>
        {tradeType !== TRADE_TYPE.LIMIT && <img alt="check" src={tableCheckSrc} />}
        {tradeType === TRADE_TYPE.LIMIT && ooPoints === undefined && beforeSimulationOOPointsRightNode}
        {tradeType === TRADE_TYPE.LIMIT &&
          ooPoints &&
          afterSimulationOOPointsRightNode(ooPoints, 'odyssey.rewardCard.tooltip.limitOrder', false)}
      </>
    );
  }

  if (tabType === TabType.Earn && earnType === EARN_TYPE.ADD_LIQ) {
    // when user claer input then show 100x instead previous simulation
    if (!liquidationSimulation?.data || !!liquidationSimulation.message) {
      ooPoints = undefined;
    } else {
      ooPoints = ooPointsInEarn;
    }
    ooPointsRightNode = (
      <>
        {ooPoints === undefined && beforeSimulationOOPointsRightNode}
        {ooPoints && afterSimulationOOPointsRightNode(ooPoints, 'odyssey.rewardCard.tooltip.addLiquidity', true)}
      </>
    );
  }

  return ooPointsRightNode;
}
