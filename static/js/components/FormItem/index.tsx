import { Form, FormItemProps } from 'antd';
import classNames from 'classnames';
// import './index.less';

export default function FormItem<T>(props: FormItemProps<T>): JSX.Element {
  return <Form.Item {...props} className={classNames('syn-form-item', props.className)}></Form.Item>;
}
