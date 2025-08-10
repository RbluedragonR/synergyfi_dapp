/**
 * @description Component-
 */
import './index.less';

import { Tooltip, TooltipProps } from 'antd';
import React, { FC, memo } from 'react';

import { ReactComponent as IconInfo } from '@/assets/svg/icon_info.svg';
import { useMediaQueryDevice } from '@/components/MediaQuery';

const IconToolTip: FC<TooltipProps & { icon?: React.ReactNode }> = function (props) {
  const { isMobile } = useMediaQueryDevice();
  return isMobile ? (
    <></>
  ) : (
    <Tooltip {...props}>
      {props.icon ? (
        props.icon
      ) : (
        <IconInfo
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="syn-icon-tooltip"
        />
      )}
    </Tooltip>
  );
};

export default memo(IconToolTip);
