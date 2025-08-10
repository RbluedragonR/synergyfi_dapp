import './index.less';

import classnames from 'classnames';
import React from 'react';

interface IContainerProps {
  className?: string;
  children?: React.ReactNode;
}

export default function Container(props: IContainerProps): JSX.Element {
  return (
    <div className={classnames('container-wrap', props.className)}>
      <div className="container">{props.children}</div>
    </div>
  );
}
