import './TokenPairOracle.less';

import { MarketType } from '@synfutures/sdks-perp';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getMarketOraclesInfo, i18nIdOracleTooltipMap } from '@/constants/oracle/marketOraclesInfo';
import { useChainId } from '@/hooks/web3/useChain';
import { Tooltip } from '../ToolTip';

function TokenPairOracle({ marketType }: { marketType: MarketType | undefined }): JSX.Element | null {
  const { t } = useTranslation();
  const chainId = useChainId();
  const oraclesInfo = useMemo(() => {
    return chainId && marketType && getMarketOraclesInfo(chainId)[marketType];
  }, [chainId, marketType]);
  const oracleIcon = useMemo(() => {
    return oraclesInfo && oraclesInfo.oracleIcon;
  }, [oraclesInfo]);
  const tooltipTitle = useMemo(() => {
    return (
      oraclesInfo &&
      marketType &&
      t(i18nIdOracleTooltipMap[marketType], { oracleName: oraclesInfo.oracleNameForI18nTooltip })
    );
  }, [marketType, oraclesInfo, t]);
  if (!oraclesInfo || !tooltipTitle) return <></>;
  return (
    <Tooltip title={tooltipTitle}>
      <div className="token-pair__oracle">{oracleIcon}</div>
    </Tooltip>
  );
}

export default React.memo(TokenPairOracle);
