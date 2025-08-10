/**
 * @description Component-BalanceItemMobile
 */
import './index.less';

import classNames from 'classnames';
import { FC } from 'react';

import AddQuotesButton from '@/components/AddQuotesButton';
import { ExternalLinkIconWithTooltip } from '@/components/Link';
import TokenLogo from '@/components/TokenLogo';
import { useNativeToken } from '@/features/chain/hook';
import { useChainId, useEtherscanLink, useUserAddr } from '@/hooks/web3/useChain';
import MintTokenButton from '@/pages/components/MintToken';
import USDPriceWrap from '@/pages/components/USDPriceWrap';
import { ITokenBalanceInfo } from '@/types/balance';
import { isTestnet } from '@/utils/chain';
import { isNativeTokenAddr } from '@/utils/token';
interface IPropTypes {
  balanceInfo: ITokenBalanceInfo | undefined;
  className?: string;
}
const BalanceItemMobile: FC<IPropTypes> = function ({ balanceInfo }) {
  const chainId = useChainId();
  const nativeToken = useNativeToken(chainId);
  const getEtherscanLink = useEtherscanLink();
  const userAddr = useUserAddr();
  if (!balanceInfo) {
    return <></>;
  }
  return (
    <div className="syn-balance-item-mobile">
      <div className="syn-balance-item-mobile__token">
        <TokenLogo className="my-balances-icon" src={balanceInfo.logoURI} token={balanceInfo} />
        <div data-testid="wallet_balance" className="syn-balance-item-mobile__balance">
          {balanceInfo.balance?.formatNumberWithTooltip({ isShowTBMK: true })}
        </div>

        <span className="my-balances-text">{balanceInfo.symbol}</span>
      </div>
      <div className="syn-balance-item-mobile__balance_usd">
        <USDPriceWrap chainId={chainId} marginToken={balanceInfo} value={balanceInfo.balance} isShowTBMK={true} />
      </div>
      <div
        className={classNames(
          `syn-balance-item-mobile__btns`,
          isTestnet(chainId) && `syn-balance-item-mobile__btns_testnet`,
        )}>
        {isTestnet(chainId) && <MintTokenButton tokenInfo={balanceInfo} />}
        {isNativeTokenAddr(balanceInfo.address) ||
          (balanceInfo.address !== nativeToken?.address && <AddQuotesButton tokenInfo={balanceInfo} />)}

        <ExternalLinkIconWithTooltip
          type="secondary"
          className="user-address-btn"
          href={getEtherscanLink(
            balanceInfo?.address === nativeToken?.address ? `${userAddr}` : `${balanceInfo.address}`,
            'address',
          )}
        />
      </div>
    </div>
  );
};

export default BalanceItemMobile;
