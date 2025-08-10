import React from 'react';

import AccountGlobalEffect from '@/features/account/GlobalEffect';
import BalanceGlobalEffect from '@/features/balance/GlobalEffect';
import ChainGlobalEffect from '@/features/chain/GlobalEffect';
import ChartGlobalEffect from '@/features/chart/globalEffect';
import EarnGlobalEffect from '@/features/earn/GlobalEffect';
import FuturesGlobalEffect from '@/features/futures/GlobalEffect';
import GlobalGlobalEffect from '@/features/global/GlobalEffect';
import PairGlobalEffect from '@/features/pair/GlobalEffect';
// import SynGlobalEffect from '@/features/syn/GlobalEffect';
import CampaignGlobalEffect from '@/features/campaign/GlobalEffect';
import ConfigGlobalEffect from '@/features/config/GlobalEffect';
import TradeGlobalEffect from '@/features/trade/GlobalEffect';
import TransactionGlobalEffect from '@/features/transaction/GlobalEffect';
import UserGlobalEffect from '@/features/user/GlobalEffect';
import WalletGlobalEffect from '@/features/wallet/GlobalEffect';
import Web3GlobalEffect from '@/features/web3/GlobalEffect';

function GlobalEffect(): JSX.Element {
  return (
    <>
      <ConfigGlobalEffect />
      <CampaignGlobalEffect />
      {/* <DiscordWidgetBotEffect /> */}
      <Web3GlobalEffect />
      <ChartGlobalEffect />
      <ChainGlobalEffect />
      <GlobalGlobalEffect />
      <TransactionGlobalEffect />
      <BalanceGlobalEffect />
      <WalletGlobalEffect />
      <UserGlobalEffect />
      <TradeGlobalEffect />
      <PairGlobalEffect />
      <FuturesGlobalEffect />
      <AccountGlobalEffect />
      {/* <SynGlobalEffect /> */}
      <EarnGlobalEffect />
    </>
  );
}

export default React.memo(GlobalEffect);
