import './index.less';

import { Image } from 'antd';
import classNames from 'classnames';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import iconSparklesLightSrc from '@/assets/svg/icon_sparkle_16_light.svg';
import iconSparklesSrc from '@/assets/svg/icon_sparkles_20.svg';
import tableCheckSrc from '@/assets/svg/icon_table_check.svg';

import viewImageSrc from '@/assets/svg/icon_view_image.svg';
import viewImageLightSrc from '@/assets/svg/icon_view_image_light.svg';
import { THEME_ENUM } from '@/constants';
import { EARN_TYPE } from '@/constants/earn';
import { PAIR_PAGE_TYPE } from '@/constants/global';
import { TRADE_TYPE } from '@/constants/trade';
import { useEarnFormType } from '@/features/earn/hook';
import { useCurrentMarketType, useTheme } from '@/features/global/hooks';
import { useChainOdysseyDappConfig } from '@/features/odyssey/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useTradeType } from '@/features/trade/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import OdysseyBoostTag from '@/pages/Odyssey/components/OdysseyBoostTag';
import { getEarnRuleImg } from '@/utils/image';
import { OdysseyRewardId, nonBlastAndOoPointRewardIds, odysseyRewardInfos } from '../../../configs/odysseyReward';
import useOoPointsRightNode from './useOoPointsRightNode';
type OdysseyRewardCardProps =
  | {
      isDepositModal: true;
      quoteSymbol: string;
    }
  | {
      isDepositModal?: false;
    };
type TContentItem = {
  iconSrc: string;
  right: ReactNode;
  id: OdysseyRewardId;
};
const imgSrc = {
  iconSparkles: {
    [THEME_ENUM.LIGHT]: iconSparklesLightSrc,
    [THEME_ENUM.DARK]: iconSparklesSrc,
  },
  viewImage: {
    [THEME_ENUM.LIGHT]: viewImageLightSrc,
    [THEME_ENUM.DARK]: viewImageSrc,
  },
};
/**
 * OdysseyReward
 * blastPoints reminder:
 * 1. qoute symbol need to filter by earnBlastPointQuotes in Market Trade, Limit Trade, Add Liquidation and Deposit.
 *    if qoute symbol is not included no blastPoints
 * 2. In Market Trade, Limit Trade, Add Liquidation,Close Position Only the pairs included in earnOoPointPairs which have boosted ooPoints
 *                               blastPoints                          blastGold  ooPoints                                       non Blast, non OoPoint Reward
 * Market Trade(Trade)           ?(depends on earnBlastPointQuotes)        v         v (No boosted)                                ?(depends on checkIsDisplay)
 * Limit Trade(Trade)            ?(depends on earnBlastPointQuotes)        v         v (boosted depends on earnOoPointPairs)       ?(depends on checkIsDisplay)
 * Close Position(Trade)         ?(depends on earnBlastPointQuotes)        v         v (No boosted)                                ?(depends on checkIsDisplay)
 * Add Liquidation(Earn)         ?(depends on earnBlastPointQuotes)        v         v (boosted depends on earnOoPointPairs)       ?(depends on checkIsDisplay)
 * Deposit(Depsoit)              ?(depends on earnBlastPointQuotes)        v         x                                             ?(depends on checkIsDisplay)
 * Deposit Native(DepsoitNative) v                                         v         x                                             x
 * Remove Liquidty               x                                         x         x                                             x
 * Adjust Margin                 x                                         x         x                                             x
 */

export default function OdysseyRewardCard(props: OdysseyRewardCardProps): JSX.Element | null {
  const { isDepositModal } = props;
  const [visible, setVisible] = useState(false);
  const { dataTheme } = useTheme();
  const { t } = useTranslation();
  const chainId = useChainId();
  const odysseyChainConfig = useChainOdysseyDappConfig(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const quoteSymbol = useMemo(() => {
    return isDepositModal ? props.quoteSymbol : currentPair?.rootInstrument.marginToken.symbol || '';
  }, [currentPair?.rootInstrument.marginToken.symbol, isDepositModal, props]);
  const tradeType = useTradeType(chainId);
  const earnType = useEarnFormType(chainId);
  const ooPointsRightNode = useOoPointsRightNode();
  const marketType = useCurrentMarketType();
  if (
    !odysseyChainConfig?.showEarnBanner ||
    earnType === EARN_TYPE.REMOVE_LIQ ||
    tradeType === TRADE_TYPE.ADJUST_MARGIN
  ) {
    return null;
  }

  /**
   * 1. Portfolio page deposit
   * 2. DEPOSIT_NATIVE in earn and trade pages
   * 3. Trade and add liquidation
   */
  const selectedOdysseyRewardIds = (isDepositModal && [
    OdysseyRewardId.BLAST_POINTS,
    OdysseyRewardId.BLAST_GOLD,
    ...nonBlastAndOoPointRewardIds,
  ]) ||
    ((tradeType === TRADE_TYPE.DEPOSIT_NATIVE || earnType === EARN_TYPE.DEPOSIT_NATIVE) && [
      OdysseyRewardId.BLAST_POINTS,
      OdysseyRewardId.BLAST_GOLD,
    ]) || [
      OdysseyRewardId.OO_POINTS,
      OdysseyRewardId.BLAST_POINTS,
      OdysseyRewardId.BLAST_GOLD,
      ...nonBlastAndOoPointRewardIds,
    ];

  const contentItems: TContentItem[] = selectedOdysseyRewardIds.flatMap((id) => {
    if (
      odysseyRewardInfos[id].checkIsDisplay &&
      !odysseyRewardInfos[id].checkIsDisplay?.(odysseyChainConfig, quoteSymbol, chainId)
    ) {
      return [];
    }
    if (id === OdysseyRewardId.OO_POINTS) {
      return [
        {
          ...odysseyRewardInfos[id],
          iconSrc: odysseyRewardInfos[id].iconSrcForRewardCard,
          right: ooPointsRightNode,
          id: id as OdysseyRewardId,
        },
      ];
    }
    return [
      {
        ...odysseyRewardInfos[id],
        iconSrc: odysseyRewardInfos[id].iconSrcForRewardCard,
        right: <img alt="check" src={tableCheckSrc} />,
        id,
      },
    ];
  });

  if (contentItems.length === 0) {
    return null;
  }
  return (
    <div className={classNames('syn-odyssey-reward-card', dataTheme)}>
      <div className="syn-odyssey-reward-card-title">
        <div className="syn-odyssey-reward-card-title-left">
          <img alt="iconSparkles" src={imgSrc.iconSparkles[dataTheme]} />
          <span>{t('odyssey.eligibleToEarn')}</span>
        </div>
        <div onClick={() => setVisible(true)} className="syn-odyssey-reward-card-view-rule">
          <img alt="view rules" src={imgSrc.viewImage[dataTheme]} className="syn-odyssey-reward-card-view-rule-btn" />
          {t('common.rules')}
        </div>
      </div>
      <div className="syn-odyssey-reward-card-content">
        {contentItems.map((item, i) => (
          <div key={i} className="syn-odyssey-reward-card-row">
            <div className="syn-odyssey-reward-card-row-left">
              <img src={item.iconSrc} />
              {t(`odyssey.earn.odysseyBoostReward.points.title.${item.id}`)}
              {item.id === OdysseyRewardId.OO_POINTS && marketType === PAIR_PAGE_TYPE.EARN && chainId && (
                <OdysseyBoostTag chainId={chainId} pairSymbol={currentPair?.symbol} quoteSymbol={quoteSymbol} />
              )}
            </div>
            <div className="syn-odyssey-reward-card-row-right">{item.right}</div>
          </div>
        ))}
      </div>
      <Image
        rootClassName="syn-odyssey-reward-card-image"
        preview={{
          visible,
          src: getEarnRuleImg(chainId),
          onVisibleChange: (value) => {
            setVisible(value);
          },
        }}
      />
    </div>
  );
}
