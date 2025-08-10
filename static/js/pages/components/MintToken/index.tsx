// import { ReactComponent as IconMint } from '@/assets/svg/icon_acct_mint.svg';
import './index.less';

import { useTranslation } from 'react-i18next';

import { Tooltip } from '@/components/ToolTip';
import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
// import { useTestnetMint } from '@/hooks/useTestnet';
import { useChainId } from '@/hooks/web3/useChain';
import { TokenInfo } from '@/types/token';
import { isNativeTokenAddr } from '@/utils/token';

import { ReactComponent as FaucetToken } from './assets/icon_acct_faucet.svg';
// import { ReactComponent as MintToken } from './assets/icon_acct_mint_linear.svg';
interface IMintTokenButtonProps {
  tokenInfo: TokenInfo;
}

export default function MintTokenButton({ tokenInfo }: IMintTokenButtonProps): JSX.Element {
  const chainId = useChainId();
  const { t } = useTranslation();
  // const { onClickMintToken } = useTestnetMint(tokenInfo);

  if (chainId && isNativeTokenAddr(tokenInfo?.address)) {
    if (!DAPP_CHAIN_CONFIGS[chainId].network.testnet?.faucetLink) return <></>;
    return (
      <Tooltip title={`${t('modal.userAddrModal.faucet')} ${tokenInfo.symbol}`}>
        <a
          className="btn-mint faucet"
          href={DAPP_CHAIN_CONFIGS[chainId].network.testnet?.faucetLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ width: 'auto' }}>
          <FaucetToken />
        </a>
      </Tooltip>
    );
  }

  // if (chainId && DAPP_CHAIN_CONFIGS[chainId].network.testnet?.mintTokens.includes(tokenInfo.symbol)) {
  //   return (
  //     <Tooltip title={`Mint ${tokenInfo.symbol}`}>
  //       <a className="btn-mint" onClick={onClickMintToken} style={{ width: 'auto' }}>
  //         <MintToken />
  //       </a>
  //     </Tooltip>
  //   );
  // }
  return <></>;
}
