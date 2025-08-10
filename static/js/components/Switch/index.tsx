import './index.less';

import { Switch as AntDSwitch, SwitchProps } from 'antd';
import classNames from 'classnames';

export default function Input(props: SwitchProps): JSX.Element {
  return <AntDSwitch {...props} className={classNames('syn-switch', props.className)}></AntDSwitch>;
}
