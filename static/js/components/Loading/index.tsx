import './index.less';

import { SpinProps } from 'antd';
import React from 'react';

const Loading: React.FC<SpinProps & { height?: number }> = (props) => {
  if (!props?.spinning) {
    return <>{props.children}</>;
  }
  return (
    <div className="syn-loading" style={{ height: props?.height, ...props.style }}>
      <div className="syn-loading-part">
        <div>
          <span className="one h6"></span>
          <span className="two h3"></span>
        </div>
      </div>

      <div className="syn-loading-part">
        <div>
          <span className="one h1"></span>
          <span className="two h4"></span>
        </div>
      </div>

      <div className="syn-loading-part">
        <div>
          <span className="one h5"></span>
          <span className="two h2"></span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
