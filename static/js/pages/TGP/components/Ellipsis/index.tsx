/**
 * @description Component-Ellipsis
 */
import './index.less';

import React, { FC, useEffect, useRef, useState } from 'react';

import { Tooltip } from '@/components/ToolTip';
interface IPropTypes {
  children?: React.ReactNode;
  tooltip?: boolean;
  length?: number;
}
const Ellipsis: FC<IPropTypes> = function ({ tooltip, length, children }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOverFlowed, setIsOverFlowed] = useState(false);
  useEffect(() => {
    const myDiv = ref.current;
    setIsOverFlowed(myDiv ? myDiv.scrollWidth > myDiv.clientWidth : false);
  }, [children]);
  return (
    <Tooltip title={tooltip && isOverFlowed ? children : undefined}>
      <div ref={ref} style={{ maxWidth: length ? length + 'px' : '100%' }} className="syn-ellipsis">
        {children}
      </div>
    </Tooltip>
  );
};

export default Ellipsis;
