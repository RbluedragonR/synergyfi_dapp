import './index.less';

import { SearchOutlined } from '@ant-design/icons';
import { Input as AntDInput, InputProps, InputRef } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';

import { WrappedBigNumber } from '@/entities/WrappedBigNumber';

// import { ReactComponent as IconClear } from './assets/icon_clear_field.svg';
interface Iprops extends Omit<InputProps, 'value'> {
  value?: string | number | undefined;
}
export default function Input(props: Iprops): JSX.Element {
  const inputRef = useRef<InputRef>(null);
  const [position, setPosition] = useState(0);
  useEffect(() => {
    if (inputRef.current?.input && !isMobile) {
      // fix cursor position issue
      const input = inputRef.current.input;
      if (props.value === '0.') {
        input.selectionStart = 2;
        input.selectionEnd = 2;
      } else {
        input.selectionStart = position;
        input.selectionEnd = position;
      }
    }
  }, [position, props.value]);
  return (
    <AntDInput
      // {...props}
      {..._.omit(props, ['type', 'onBlur'])}
      ref={inputRef}
      onChange={(e) => {
        const currentPosition = e.currentTarget?.selectionStart || 0;
        setPosition(currentPosition);

        props?.onChange && props?.onChange(e);
      }}
      onBlur={(e) => {
        if (props.max && WrappedBigNumber.from(props.max).notEq(0)) {
          if (WrappedBigNumber.from(props.value || 0).gt(props.max)) {
            e.target.value = props.max.toString();
            props?.onChange && props?.onChange(e);
          }
        }
        props.onBlur && props.onBlur(e);
      }}
      className={classNames('syn-input', props.className)}></AntDInput>
  );
}

export function Search(props: Iprops): JSX.Element {
  return (
    <Input
      prefix={<SearchOutlined style={{ color: 'var(--icon-grey1)' }} />}
      {...props}
      className={classNames('syn-search', props.className)}></Input>
  );
}
