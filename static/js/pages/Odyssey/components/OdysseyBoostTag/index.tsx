/**
 * @description Component-OdysseyBoostTag
 */
import './index.less';

import classNames from 'classnames';
import React, { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Tag from '@/components/Tag';
import { Tooltip } from '@/components/ToolTip';
import {
  getMultiplerForNonBlastAndOoPointReward,
  nonBlastAndOoPointRewardIds,
  odysseyRewardInfos,
} from '@/configs/odysseyReward';
import { useTheme } from '@/features/global/hooks';
import { useChainOdysseyDappConfig } from '@/features/odyssey/hooks';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  chainId: number | undefined;
  pairSymbol: string | undefined;
  quoteSymbol?: string | undefined;
  isShowNonOoPoint?: boolean;
}

const OdysseyBoostTag: FC<IPropTypes> = function ({ chainId, pairSymbol, quoteSymbol, isShowNonOoPoint }) {
  const { dataTheme } = useTheme();
  const { t } = useTranslation();
  const odysseyChainConfig = useChainOdysseyDappConfig(chainId);
  const pairConfig = useMemo(() => {
    return odysseyChainConfig?.earnOoPointPairs?.find((item) => item.pairSymbol === pairSymbol);
  }, [odysseyChainConfig?.earnOoPointPairs, pairSymbol]);

  if (!odysseyChainConfig?.showLiquidityPoints || !pairConfig || !pairSymbol) {
    return null;
  }
  return (
    <div className="syn-odyssey-boost-tag-container">
      <Tooltip title={<Trans i18nKey={'odyssey.earn.tooltip'} components={{ b: <b /> }} />}>
        <Tag bordered={true} className={classNames('syn-odyssey-boost-tag boost', dataTheme)}>
          {t('odyssey.earn.earnBoost', { boost: pairConfig?.boost || 1 })}
        </Tag>
      </Tooltip>
      {isShowNonOoPoint &&
        quoteSymbol &&
        nonBlastAndOoPointRewardIds.map((id) => {
          const multiplier = getMultiplerForNonBlastAndOoPointReward(odysseyChainConfig, quoteSymbol, id);
          const info = odysseyRewardInfos[id];
          if (multiplier === undefined) return null;
          return (
            <span key={`nonBlastAndOoPointRewardtag-${id}`}>
              <Tooltip
                title={
                  <Trans
                    i18nKey={`odyssey.earn.odysseyBoostReward.points.tooltip.${id}`}
                    components={{ b: <b /> }}
                    values={{ boost: multiplier }}
                  />
                }>
                <Tag
                  icon={info.iconSvgNodeForTag}
                  bordered={true}
                  style={{ background: info.tagBgColor, color: info.textColor || '#fff' }}
                  className={classNames('syn-odyssey-boost-tag', dataTheme)}>
                  {t('odyssey.earn.odysseyBoostReward.earnBoost', { boost: multiplier })}
                </Tag>
              </Tooltip>
            </span>
          );
        })}
    </div>
  );
};

export default OdysseyBoostTag;
