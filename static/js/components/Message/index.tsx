import './index.less';

import { SyncOutlined } from '@ant-design/icons';
import React, { ReactNode } from 'react';

import { ReactComponent as IconWarning } from '@/assets/svg/icon_warning_circle.svg';

export function MessageComponent({
  loading,
  msg,
  status,
  hide,
}: {
  msg: ReactNode;
  status: string | undefined;
  loading?: boolean | undefined;
  hide?: boolean;
}): JSX.Element {
  const loadingNode: ReactNode = (
    <span>
      <SyncOutlined spin /> Simulating Transaction ...
    </span>
  );
  if (hide) {
    return <></>;
  }
  return (
    <div className="message">
      <IconWarning width={14} height={14} />
      &nbsp;
      <span className={`text ${status || 'warning'}`}>{loading ? loadingNode : msg} &nbsp; </span>
    </div>
  );
}
export const Message = React.memo(MessageComponent);
