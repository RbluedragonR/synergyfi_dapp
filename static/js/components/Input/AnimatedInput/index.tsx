/**
 * @description Component-AnimatedInput
 */
import './index.less';

import { InputProps } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import React, { FC, useEffect, useRef, useState } from 'react';
import { animated, useSpring } from 'react-spring';

import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  showInput: boolean;
  inputProps?: Omit<InputProps, 'size' | 'prefix' | 'value'> & {
    value: string | number | undefined;
  };
  suffix?: React.ReactNode;
  onWrapperClick?: () => void;
}
const AnimatedInput: FC<IPropTypes> = function ({ showInput, inputProps, className, suffix, onWrapperClick }) {
  const [isFocus, setIsFocus] = useState(false);
  const springStyles = useSpring({ width: showInput ? 97.95 : 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState(0);
  useEffect(() => {
    inputRef?.current?.focus();

    return () => {
      inputRef?.current?.blur();
    };
  }, [showInput]);

  useEffect(() => {
    if (inputRef.current) {
      // fix cursor position issue
      const input = inputRef.current;
      if (inputProps?.value === '0.') {
        input.selectionStart = 2;
        input.selectionEnd = 2;
      } else {
        input.selectionStart = position;
        input.selectionEnd = position;
      }
    }
  }, [position, inputProps?.value]);
  return (
    <div className="syn-animated-input">
      <span
        className={classNames(
          'ant-input-affix-wrapper syn-input ant-input-affix-wrapper-lg',
          isFocus && 'ant-input-affix-wrapper-focused',
          className,
        )}
        onClick={() => {
          showInput && inputRef?.current?.focus();
          !showInput && onWrapperClick && onWrapperClick();
        }}>
        <animated.div style={springStyles}>
          <input
            // remove number type to fix cursor position issue
            {..._.omit(inputProps, ['type'])}
            ref={inputRef}
            className={classNames('ant-input ant-input-lg')}
            onChange={(e) => {
              const currentPosition = e.currentTarget?.selectionStart || 0;
              setPosition(currentPosition);

              inputProps?.onChange && inputProps?.onChange(e);
            }}
            onFocus={(e) => {
              setIsFocus(true);
              inputProps?.onFocus && inputProps?.onFocus(e);
            }}
            onBlur={(e) => {
              if (inputProps?.max && WrappedBigNumber.from(inputProps.max).notEq(0)) {
                if (WrappedBigNumber.from(inputProps?.value || 0).gt(inputProps.max)) {
                  e.target.value = inputProps.max.toString();
                  inputProps?.onChange && inputProps?.onChange(e);
                }
              }
              setIsFocus(false);
            }}
            onWheel={(e) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (e.target as any).blur();
            }}
          />
        </animated.div>
        {suffix}
      </span>
    </div>
  );
};

export default AnimatedInput;
