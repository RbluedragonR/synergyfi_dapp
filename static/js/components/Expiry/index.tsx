/**
 * @description Component-Expiry
 */
import classNames from 'classnames';
import React, { FC } from 'react';

import { showProperDateString } from '@/utils/timeUtils';
interface IPropTypes {
  expiry: number | undefined;
  className?: string;
  showShortPerp?: boolean;
}
const Expiry: FC<IPropTypes> = function ({ expiry, className, showShortPerp = false }) {
  return (
    <span
      className={classNames(className, {
        // 'font-number': expiry !== 0,
      })}>
      {!!expiry && showProperDateString({ expiry, format: 'MMDD', showShortPerp })}
    </span>
  );
};

export default React.memo(Expiry);
