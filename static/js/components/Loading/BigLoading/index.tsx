/**
 * @description Component-BigLoading
 */
import './index.less';

import classNames from 'classnames';
import React, { FC } from 'react';

import { useMediaQueryDevice } from '@/components/MediaQuery';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const BigLoading: FC<IPropTypes> = function ({}) {
  const { deviceType } = useMediaQueryDevice();
  return (
    <div className={classNames('syn-big-loading', deviceType)}>
      <svg
        version="1.1"
        id="Loader"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="5 5 40 40">
        <circle
          className="syn-big-loading-path_circle"
          fill="none"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          cx="25"
          cy="25"
          r="15"
        />
      </svg>
    </div>
  );
};

export default BigLoading;
