/**
 * @description Component-TokenPairLeverage
 */
import './index.less';

import { Tag } from 'antd';
import cls from 'classnames';
import { FC, useMemo } from 'react';

import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { formatNumber } from '@/utils/numberUtil';
interface IPropTypes {
  leverage: WrappedBigNumber | number | undefined;
  highlight?: boolean;
  tag?: boolean;
}
const TokenPairLeverage: FC<IPropTypes> = function ({ leverage, highlight, tag }) {
  const dom = useMemo(
    () => (
      <span
        className={cls(`token-pair__expiry`, {
          'token-pair-highlight': highlight,
        })}>
        <span>{formatNumber(leverage || 0, 0)}x</span>
      </span>
    ),
    [highlight, leverage],
  );
  return tag ? (
    <Tag bordered={true} className="token-pair-expiry-tag">
      {dom}
    </Tag>
  ) : (
    <>{dom}</>
  );
};

export default TokenPairLeverage;
