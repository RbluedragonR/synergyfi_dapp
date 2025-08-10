import './index.less';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useNativeToken } from '@/features/chain/hook';
import { TokenInfo } from '@/types/token';

import { useWagmiConnectorClient } from '@/hooks/web3/useWagami';
import { watchAsset } from 'viem/actions';
import { Tooltip } from '../ToolTip';
import { ReactComponent as IconWallet } from './assets/icon_acct_metamask.svg';

interface IAddQuotesButtonProps {
  tokenInfo: TokenInfo;
}

export default function AddQuotesButton({ tokenInfo }: IAddQuotesButtonProps): JSX.Element {
  const nativeToken = useNativeToken(tokenInfo?.chainId);
  const { t } = useTranslation();
  const { data: connectorClient } = useWagmiConnectorClient();

  const onClickAddQuotes = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (connectorClient) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      watchAsset(connectorClient as any, {
        /** Token type. */
        type: 'ERC20',
        options: tokenInfo,
      });
    }
    return;
  }, [connectorClient, tokenInfo]);
  if (tokenInfo.address === nativeToken?.address) {
    return <></>;
  }
  return (
    <Tooltip
      title={t('modal.userAddrModal.balanceList.addQoBtn.title', {
        symbol: tokenInfo.symbol,
      })}>
      <a className="btn-add-quote" onClick={onClickAddQuotes}>
        <IconWallet />
      </a>
    </Tooltip>
  );
}
