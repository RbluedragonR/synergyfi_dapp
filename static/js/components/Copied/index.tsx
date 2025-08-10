/**
 * @description Component-Copied
 */
import './index.less';

import { FC } from 'react';

import useCopyClipboard from '@/hooks/useCopyClipboard';
import { isAddress } from '@/utils/address';

import classNames from 'classnames';
import { Tooltip } from '../ToolTip';
import { ReactComponent as IconAddrCopy } from './assets/icon_acct_copy.svg';

interface IPropTypes {
  title: string;
  copiedTitle: string;
  copyValue: string;
  showTitle?: boolean;
  checkAddress?: boolean;
  showTooltip?: boolean;
  onClicked?: () => void;
  className?: string;
}
const Copied: FC<IPropTypes> = function ({
  title,
  copiedTitle,
  copyValue,
  showTitle,
  checkAddress = true,
  showTooltip = true,
  onClicked,
  className,
}) {
  const [copied, setCopied] = useCopyClipboard(2000);

  return (
    <div className={classNames('syn-copied', className)}>
      <Tooltip title={showTooltip ? (copied ? copiedTitle : title) : ''}>
        <a
          className="syn-copied-btn syn-link"
          onClick={() => {
            setCopied(checkAddress ? isAddress(copyValue || '') || '' : copyValue);
            onClicked && onClicked();
          }}>
          <IconAddrCopy />
          {showTitle ? (copied ? copiedTitle : title) : ''}
        </a>
      </Tooltip>
    </div>
  );
};

export default Copied;
