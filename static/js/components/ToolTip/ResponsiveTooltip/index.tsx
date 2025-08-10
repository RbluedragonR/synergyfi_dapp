import { Tooltip, TooltipProps } from 'antd';
import { FC, memo } from 'react';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { mockOpenTooltip } from '@/constants/mock';

const ResponsiveTooltip: FC<TooltipProps & { showOnMobile?: boolean }> = function (props) {
  const { isMobile } = useMediaQueryDevice();
  return isMobile && !props.showOnMobile ? (
    <> {props.children}</>
  ) : (
    <Tooltip {...props} open={mockOpenTooltip ? mockOpenTooltip : props.open} />
  );
};

export default memo(ResponsiveTooltip);
