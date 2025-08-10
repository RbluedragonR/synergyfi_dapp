/**
 * @description Component-MarketTag
 */
import Tag from '@/components/Tag';
import './index.less';

import { Tooltip } from '@/components/ToolTip';
import { BackendMarketCustomTagConfig } from '@/types/config';
import { FC } from 'react';
interface IPropTypes extends BackendMarketCustomTagConfig {
  children?: React.ReactNode;
  className?: string;
}
const MarketTag: FC<IPropTypes> = function ({ tagName, tagColor, tagBgColor, tooltip, link, isOpenNewTag }) {
  return (
    <Tooltip title={tooltip}>
      <Tag
        bordered={true}
        className="syn-market-tag"
        style={{ color: tagColor, backgroundColor: tagBgColor }}
        onClick={(e) => {
          if (link) {
            if (isOpenNewTag) {
              window.open(link, '_blank');
            } else {
              window.location.href = link;
            }
          }
          e.stopPropagation();
        }}>
        {tagName}
      </Tag>
    </Tooltip>
  );
};

export default MarketTag;
