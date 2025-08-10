/**
 * @description Component-TradeDetailtsDrawer
 */
import './index.less';

import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import Drawer from '@/components/Drawer';
import { TRADE_TYPE } from '@/constants/trade';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useLimitSimulation, useMarketSimulation, useTradeSide, useTradeType } from '@/features/trade/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import { TradeFormDetails } from '@/pages/trade/TradeCard/TradeForm/TradeDetail/TradeFormDetails';
import { LimitFormDetail } from '@/pages/trade/TradeCard/TradeForm/TradeLimitForm/LimitFormDetail';

import { ReactComponent as DetailsIcon } from './assets/icon_more_whitepaper.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TradeDetailsDrawer: FC<IPropTypes> = function () {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const chainId = useChainId();
  const tradeType = useTradeType(chainId);
  const tradeSide = useTradeSide(chainId);
  const marketSimulation = useMarketSimulation(chainId);
  const limitSimulation = useLimitSimulation(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  return (
    <>
      <Button icon={<DetailsIcon />} className="syn-trade-details-drawer-btn" onClick={() => setOpen(true)} type="text">
        {t('mobile.details')}
      </Button>
      <Drawer
        placement="bottom"
        height={'auto'}
        title={t('mobile.details')}
        open={open}
        destroyOnClose
        onClose={() => setOpen(false)}
        className="syn-trade-details-drawer reverse-header">
        {tradeType === TRADE_TYPE.MARKET && (
          <TradeFormDetails
            simulation={marketSimulation?.data}
            marginToken={currentPair?.rootInstrument.marginToken}
            fairPrice={currentPair?.wrapAttribute('fairPrice')}
            isLoading={false}
            chainId={chainId}
            tradeSide={tradeSide}
            detailToggle={false}
          />
        )}
        {tradeType === TRADE_TYPE.LIMIT && (
          <LimitFormDetail
            marginToken={currentPair?.rootInstrument.marginToken}
            fairPrice={currentPair?.wrapAttribute('fairPrice')}
            isLoading={false}
            chainId={chainId}
            tradeSide={tradeSide}
            simulationData={limitSimulation?.data}
          />
        )}
      </Drawer>
    </>
  );
};

export default TradeDetailsDrawer;
