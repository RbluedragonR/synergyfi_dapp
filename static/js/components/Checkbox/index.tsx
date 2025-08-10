import './Checkbox.less';

import { Checkbox as AntDCheckbox, CheckboxProps } from 'antd';
import classNames from 'classnames';

export default function Checkbox(props: CheckboxProps): JSX.Element {
  return <AntDCheckbox {...props} className={classNames('syn-checkbox', props.className)}></AntDCheckbox>;
}
