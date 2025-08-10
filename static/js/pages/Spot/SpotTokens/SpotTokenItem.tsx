/**
 * @description Component-SpotTokenItem
 */
import classNames from 'classnames';
import './index.less';

import { ReactComponent as LinkIcon } from '@/assets/svg/icon_link_address.svg';
import TokenLogo from '@/components/TokenLogo';
import { Tooltip } from '@/components/ToolTip';
import { useTokenBalance } from '@/features/balance/hook';
import { TokenInfoInSpot } from '@/features/spot/types';
import useCopyClipboard from '@/hooks/useCopyClipboard';
import { useChainId } from '@/hooks/web3/useChain';
import USDPriceWrap from '@/pages/components/USDPriceWrap';
import { shortenAddress } from '@/utils/address';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  token: TokenInfoInSpot;
  onTokenChange: (token: TokenInfoInSpot) => void;
}
const SpotTokenItem: FC<IPropTypes> = function ({ onTokenChange, token }) {
  const chainId = useChainId();
  const { t } = useTranslation();
  const shortenedAddr = useMemo(() => shortenAddress(token.address), [token.address]);
  const [copied, setCopied] = useCopyClipboard();
  const tokenBalance = useTokenBalance(token.address, chainId);
  return (
    <div
      onClick={() => {
        onTokenChange(token);
      }}
      className={classNames('syn-spot-tokens-modal-list-item')}>
      <div className="syn-spot-tokens-modal-list-item-symbol">
        <TokenLogo token={token} isSpot={true} size={40} />
        <dl>
          <dt>{token.symbol}</dt>
          <dd>
            {shortenedAddr}
            <Tooltip open={copied} title={copied ? t('common.spot.copied') : ''}>
              <LinkIcon
                className="link-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setCopied(token.address);
                }}
              />
            </Tooltip>
          </dd>
        </dl>
      </div>
      <div className="syn-spot-tokens-modal-list-item-balance">
        {tokenBalance?.gt(0) && (
          <dl>
            <dt>{tokenBalance.formatNumberWithTooltip({ isShowTBMK: true })}</dt>
            <dd>
              <USDPriceWrap chainId={chainId} value={tokenBalance} marginToken={token} />
            </dd>
          </dl>
        )}
      </div>
    </div>
  );
};

export default SpotTokenItem;
