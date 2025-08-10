/**
 * @description Component-Fallback
 * https://www.npmjs.com/package/framer-motion
 * https://zhuanlan.zhihu.com/p/337546795
 */
import './index.less';

import React, { FC } from 'react';
import { animated, useSpring } from 'react-spring';
interface Props {
  children?: React.ReactNode;
  show: boolean;
  isMobile: boolean | undefined;
}
const Fallback: FC<Props> = function ({ children, show }) {
  const styles = useSpring(
    show
      ? {
          opacity: 1,
          x: 0,
          contentVisibility: 'auto',
          display: 'block',
        }
      : { opacity: 0, x: 200, duration: 600, contentVisibility: 'hidden', display: 'none' },
  );

  return (
    <animated.div className="syn-card_wrap_fallback" style={styles}>
      {children}
    </animated.div>
  );
};

export default Fallback;
