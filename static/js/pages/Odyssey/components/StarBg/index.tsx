/**
 * @description Component-StarBg
 */
import './index.less';

import React, { FC, useEffect } from 'react';

import { starInit, startShine, stopAnimation } from './star';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const StarBg: FC<IPropTypes> = function ({}) {
  useEffect(() => {
    starInit(document.getElementById('star-bg'));
    startShine();
    return () => stopAnimation();
  }, []);
  return <div id="star-bg" className="syn-star-bg"></div>;
};

export default StarBg;
