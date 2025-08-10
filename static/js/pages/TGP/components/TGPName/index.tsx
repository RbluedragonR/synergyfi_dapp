/**
 * @description Component-TGPName
 */
import './index.less';

import { Jazzicon } from '@uktvs/jazzicon-react';
import React, { FC, useMemo } from 'react';

import SynText from '@/components/Text';
import { Tooltip } from '@/components/ToolTip';
import { useTGPMasterByAddr } from '@/features/tgp/hooks';
import { shortenAddress } from '@/utils/address';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  userAddr: string | undefined;
  size?: number;
  showTooltip?: boolean;
  ellipsisWidth?: number;
}
const TGPName: FC<IPropTypes> = function ({ userAddr, size = 24, ellipsisWidth, showTooltip = true }) {
  const masterInfo = useTGPMasterByAddr(userAddr);

  const name = useMemo(() => {
    if (masterInfo?.twitterUsername) {
      return `@${masterInfo?.twitterUsername}`;
    }
    return userAddr;
  }, [masterInfo?.twitterUsername, userAddr]);

  if (!userAddr) {
    return null;
  }
  return (
    <div className="syn-tgp-name">
      {masterInfo?.twitterUsername ? (
        <img
          src={
            masterInfo?.profileImgUrl ||
            'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'
          }
        />
      ) : (
        <div className="identicon" style={{ width: size, height: size }}>
          <Jazzicon address={userAddr || ''} />
        </div>
      )}
      {masterInfo?.twitterUsername ? (
        <SynText
          ellipsis={{
            tooltip: `${name}`,
          }}
          style={
            ellipsisWidth
              ? { width: ellipsisWidth, height: size, lineHeight: `${size}px` }
              : { height: size, lineHeight: `${size}px` }
          }>
          <span>{name}</span>
        </SynText>
      ) : (
        <Tooltip title={showTooltip ? userAddr : ''}>
          <span>{shortenAddress(userAddr)}</span>
        </Tooltip>
      )}
    </div>
  );
};

export default TGPName;
