import './BalanceItem.less';

import classNames from 'classnames';

import AddQuotesButton from '@/components/AddQuotesButton';
import { ExternalLinkIconWithTooltip } from '@/components/Link';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import TokenLogo from '@/components/TokenLogo';
import { useNativeToken } from '@/features/chain/hook';
import { useChainId, useEtherscanLink, useUserAddr } from '@/hooks/web3/useChain';
import MintTokenButton from '@/pages/components/MintToken';
import USDPriceWrap from '@/pages/components/USDPriceWrap';
import { ITokenBalanceInfo } from '@/types/balance';
import { isTestnet } from '@/utils/chain';
import { isNativeTokenAddr } from '@/utils/token';

export type BalanceItemProps = {
  balanceInfo: ITokenBalanceInfo | undefined;
};

export default function BalanceItem({ balanceInfo }: BalanceItemProps): JSX.Element {
  const chainId = useChainId();
  const account = useUserAddr();
  const nativeToken = useNativeToken(chainId);
  const getEtherscanLink = useEtherscanLink();
  const { deviceType } = useMediaQueryDevice();
  return balanceInfo ? (
    <div className={classNames('balance-item', deviceType)}>
      <div className="balance-item__top">
        <div className="balance-item__token">
          <TokenLogo className="my-balances-icon" src={balanceInfo.logoURI} token={balanceInfo} />
          <span className="my-balances-text">{balanceInfo.symbol}</span>
        </div>
        <div className={classNames(`balance-item__btns`, isTestnet(chainId) && `balance-item__btns_testnet`)}>
          {isTestnet(chainId) && <MintTokenButton tokenInfo={balanceInfo} />}
          {isNativeTokenAddr(balanceInfo.address) ||
            (balanceInfo.address !== nativeToken?.address && <AddQuotesButton tokenInfo={balanceInfo} />)}

          <ExternalLinkIconWithTooltip
            type="secondary"
            className="user-address-btn"
            href={getEtherscanLink(
              balanceInfo?.address === nativeToken?.address ? `${account}` : `${balanceInfo.address}`,
              'address',
            )}
          />
        </div>
      </div>
      <div className="balance-item__bottom">
        <div data-testid="wallet_balance" className="balance-item__balance">
          {balanceInfo.balance?.formatNumberWithTooltip({ isShowTBMK: true })}
        </div>

        <div className="balance-item__usd-value">
          <USDPriceWrap chainId={chainId} marginToken={balanceInfo} value={balanceInfo.balance} isShowTBMK={true} />
        </div>
      </div>
    </div>
  ) : (
    <div className={classNames('balance-item empty', deviceType)} />
  );
}
