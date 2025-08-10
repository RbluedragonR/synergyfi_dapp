import './index.less';

import classNames from 'classnames';
import { useMemo } from 'react';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { CHAIN_ID } from '@/constants/chain';

import { useBackendChainConfig } from '@/features/config/hook';
import { ITokenBalanceInfo } from '@/types/balance';
import { useTokenBalanceList } from '../hook';
import BalanceItem from './BalanceItem';
import BalanceItemMobile from './BalanceItemMobile';
interface IProps {
  chainId: CHAIN_ID | undefined;
}
export default function BalanceList({ chainId }: IProps): JSX.Element {
  const tokenBalanceList = useTokenBalanceList(chainId);
  const dappChainConfig = useBackendChainConfig(chainId);
  const { isMobile, deviceType } = useMediaQueryDevice();
  const tokenListFiltered = useMemo(() => {
    const list = (dappChainConfig?.balanceDisplayList || []).reduce(
      (acc, symbol) => {
        const token = tokenBalanceList.find((token) => token.symbol === symbol);
        if (token) {
          acc.push(token);
        }
        return acc;
      },

      [] as ITokenBalanceInfo[],
    );

    return list.sort((a, b) => {
      if (a.balance.gt(0) && b.balance.eq(0)) return -1;
      if (a.balance.eq(0) && b.balance.gt(0)) return 1;
      return 0;
    });
  }, [dappChainConfig, tokenBalanceList]);
  return (
    <div className={classNames('balance-list', 'syn-scrollbar', deviceType)}>
      {tokenListFiltered.map((balanceInfo) =>
        isMobile ? (
          <BalanceItemMobile key={balanceInfo.id} balanceInfo={balanceInfo} />
        ) : (
          <BalanceItem key={balanceInfo.id} balanceInfo={balanceInfo}></BalanceItem>
        ),
      )}
      {!isMobile && tokenListFiltered.length % 2 !== 0 && <BalanceItem balanceInfo={undefined} />}
    </div>
  );
}
