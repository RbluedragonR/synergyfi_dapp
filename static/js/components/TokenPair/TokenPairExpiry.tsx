import './TokenPairExpiry.less';

import { Tag } from 'antd';
import cls from 'classnames';
import React, { useMemo } from 'react';

import Expiry from '../Expiry';

interface ITokenPairExpiryTypes {
  expiry: number | undefined;
  highlight?: boolean;
  showShortPerp?: boolean;
  tag?: boolean;
}
function TokenPairExpiry({ expiry, highlight, showShortPerp, tag }: ITokenPairExpiryTypes): JSX.Element {
  const dom = useMemo(
    () => (
      <span
        className={cls(`token-pair__expiry`, {
          'token-pair-highlight': highlight,
        })}>
        <Expiry expiry={expiry} showShortPerp={showShortPerp}></Expiry>
      </span>
    ),
    [expiry, highlight, showShortPerp],
  );
  return tag ? (
    <Tag bordered={true} className="token-pair-expiry-tag">
      {dom}
    </Tag>
  ) : (
    <>{dom}</>
  );
}

export default React.memo(TokenPairExpiry, (prevProps, nextProps) => {
  return prevProps.expiry === nextProps.expiry && prevProps.highlight === nextProps.highlight;
});
