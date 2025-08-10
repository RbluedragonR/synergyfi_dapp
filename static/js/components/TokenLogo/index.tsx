import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import classNames from 'classnames';
import _ from 'lodash';
import React, { FunctionComponent, useMemo } from 'react';
import { ImageProps } from 'rebass';

import { THEME_ENUM } from '@/constants';
import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
// import { useIsNativeToken } from '@/features/chain/hook';
import { useTheme } from '@/features/global/hooks';
// import { useDappChainConfig } from '@/hooks/web3/useChain';
import { TokenInfo } from '@/types/token';

import { useTokenInfo } from '@/features/chain/hook';
import { getChainShortName } from '@/utils/chain';
import Logo from './Logo';
import unknown from './assets/icon_crypto_default.svg';
import unknownD from './assets/icon_crypto_default_d.svg';

const BLOCKCHAIN: { [chainId: number]: string } = {
  [CHAIN_ID.ETHEREUM]: 'ethereum',
  [CHAIN_ID.GOERLI]: 'ethereum',
  [CHAIN_ID.BSC]: 'binanace',
  [CHAIN_ID.POLYGON]: 'polygon',
};

function getTokenSymbol(token: TokenInfo): string {
  // show mapping token icon
  const mockConfig = _.get(DAPP_CHAIN_CONFIGS, [token.chainId, 'network', 'mockTokenConfig']);
  if (mockConfig?.mockTokenSymbol === token.symbol) {
    return mockConfig.mappingTokenSymbol.toLowerCase();
  }
  return token.symbol.toLowerCase();
}

export function getTokenLogoUrls(token: TokenInfo, isSpot = false): string[] {
  const urls = [];

  //1. get logo from icons by symbol
  urls.push(
    isSpot
      ? `https://api.synfutures.com/s3/config/coins/large_${getChainShortName(
          token.chainId,
        )}_${token.address.toLowerCase()}.png`
      : `https://api.synfutures.com/ipfs/icons/token/${getTokenSymbol(token)}.png`,
  );
  // 2. get logo from trustwallet by chainId and address
  if (token.chainId in BLOCKCHAIN) {
    urls.push(
      `https://raw.githubusercontent.com/sushiswap/assets/master/blockchains/${BLOCKCHAIN[token.chainId]}/assets/${
        token.address
      }/logo.png`,
    );
    urls.push(
      `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${BLOCKCHAIN[token.chainId]}/assets/${
        token.address
      }/logo.png`,
    );
  }

  return urls;
}

interface ITokenLogoProps extends Pick<ImageProps, 'style' | 'alt' | 'className'> {
  src?: string;
  token?: TokenInfo;
  size?: string | number;
  isHideBackground?: boolean;
  chainId?: CHAIN_ID;
  showChainIcon?: boolean;
  showBg?: boolean;
  isSpot?: boolean;
}

const TokenLogo: FunctionComponent<ITokenLogoProps> = ({
  src,
  token,
  size = 16,
  isHideBackground = false,
  className,
  chainId,
  showChainIcon,
  showBg = true,
  isSpot,
  ...rest
}) => {
  // const isNativeToken = useIsNativeToken(token?.chainId, token);
  // const dappConfig = useDappChainConfig(token?.chainId);
  const tokenInfoFromServer = useTokenInfo(token?.chainId, token?.address);
  const { dataTheme } = useTheme();
  const unknownSrc = useMemo(() => (dataTheme === THEME_ENUM.DARK ? unknownD : unknown), [dataTheme]);
  const srcs = useMemo(() => {
    if (src) {
      return [src, unknownSrc];
    }
    if (!token) {
      return [unknownSrc];
    }

    // if (isNativeToken) {
    //   if (dappConfig?.network?.wrapperNativeLogo) {
    //     return [dappConfig?.network?.wrapperNativeLogo, unknownSrc];
    //   }
    // }

    if (token.address && token.symbol) {
      const defaultUrls = [...getTokenLogoUrls(token, isSpot)];
      if (tokenInfoFromServer?.logoURI) {
        // use our server logo first
        return [...defaultUrls, tokenInfoFromServer?.logoURI, unknownSrc];
      }
      return [...defaultUrls, unknownSrc];
    }
    return [];
  }, [src, token, isSpot, tokenInfoFromServer?.logoURI, unknownSrc]);

  return (
    <div className={classNames(!isHideBackground && 'token-icon', className)} style={{ width: size, height: size }}>
      <Logo className="token-icon_logo" srcs={srcs} width={size} height={size} {...rest} />
      {chainId && showChainIcon && (
        <div className="token-icon_chain">
          <div className="token-icon_chain-container">
            <img src={DAPP_CHAIN_CONFIGS[chainId].network.icon} />
            <div id="token-icon_chain-bg" />
          </div>
        </div>
      )}
      {showBg && (
        <div
          className="token-icon_bg"
          style={{
            width: Number(size) - 1,
            height: Number(size) - 1,
          }}
        />
      )}
    </div>
  );
};

export default React.memo(TokenLogo, (prevProps, nextProps) => {
  return (
    prevProps.token?.id === nextProps.token?.id &&
    prevProps.token?.symbol === nextProps.token?.symbol &&
    nextProps.token?.address === prevProps.token?.address
  );
});
