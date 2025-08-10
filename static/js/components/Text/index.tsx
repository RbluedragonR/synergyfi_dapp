/**
 * @description Component-Text
 */
import './index.less';

import { Typography } from 'antd';
import { TextProps } from 'antd/es/typography/Text';
import classNames from 'classnames';
import React, { FC } from 'react';

const { Text: AntText } = Typography;
interface IPropTypes extends TextProps, React.RefAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  className?: string;
}
const SynText: FC<IPropTypes> = function (props) {
  return <AntText {...props} className={classNames('syn-text', props.className)}></AntText>;
};

export default SynText;
