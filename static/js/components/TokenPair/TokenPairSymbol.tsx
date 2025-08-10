import './TokenPairSymbol.less';

import classNames from 'classnames';
import React from 'react';

import { ReactComponent as MarginIcon } from '@/assets/svg/margin_icon.svg';
import { TokenInfo } from '@/types/token';

function TokenPairSymbol({
  baseToken,
  quoteToken,
  isInverse,
  requiredMarginIcon = true,
}: {
  baseToken: TokenInfo;
  quoteToken: TokenInfo;
  isInverse?: boolean;
  requiredMarginIcon?: boolean;
}): JSX.Element {
  return (
    <span className={classNames('token-pair__symbol')}>
      {isInverse ? (
        <>
          <span className="token-pair__symbol-base">{quoteToken?.symbol}</span>
          {requiredMarginIcon && <MarginIcon className="token-pair__symbol-margin-icon" />}
          <span className="token-pair__symbol-quote">/{baseToken?.symbol}</span>
        </>
      ) : (
        <>
          <span className="token-pair__symbol-base">{baseToken?.symbol}</span>
          <span className="token-pair__symbol-quote">/{quoteToken?.symbol}</span>
          {requiredMarginIcon && <MarginIcon className="token-pair__symbol-margin-icon" />}
        </>
      )}
    </span>
  );
}

export default React.memo(TokenPairSymbol, (prevProps, nextProps) => {
  return (
    prevProps?.baseToken?.id === nextProps?.baseToken?.id &&
    prevProps?.quoteToken.id === nextProps?.quoteToken.id &&
    prevProps?.quoteToken.symbol === nextProps?.quoteToken.symbol &&
    prevProps?.baseToken?.symbol === nextProps?.baseToken?.symbol
  );
});
