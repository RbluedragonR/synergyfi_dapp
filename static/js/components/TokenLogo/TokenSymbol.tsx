import './TokenSymbol.less';

import classNames from 'classnames';
import React from 'react';

import { TokenInfo } from '@/types/token';

import TokenLogo from '../TokenLogo';

function TokenSymbol(props: { classNames?: string; tokenInfo: TokenInfo; logoSize?: number }): JSX.Element {
  return (
    <div className={classNames('token-symbol', props.classNames)}>
      <TokenLogo className="token-logo" token={props.tokenInfo} size={props.logoSize} />
      <span className="token-symbol-label">{props.tokenInfo?.symbol}</span>
    </div>
  );
}

export default React.memo(TokenSymbol, (prevProps, nextProps) => {
  return prevProps.tokenInfo?.id === nextProps.tokenInfo?.id;
});
