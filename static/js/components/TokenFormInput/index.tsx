import './index.less';

import { InputProps } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import { TokenInfo } from '@/types/token';

import FormItem from '../FormItem';
import Input from '../Input';
import AnimatedInput from '../Input/AnimatedInput';

export function TokenFormInputComponent(
  props: Omit<InputProps, 'value'> & {
    formLabel?: React.ReactNode;
    formClassName?: string;
    tokenInfo?: TokenInfo;
    msg?: string;
    status?: string;
    showMsg?: boolean;
    flexible?: string;
    value: string | number | undefined;
  },
): JSX.Element {
  const [showInput, setShowInput] = useState(false);

  const suffixClicked = useCallback(() => {
    if (props.flexible) {
      setShowInput(!showInput);
    }
  }, [props.flexible, showInput]);
  useEffect(() => {
    if (!props.flexible) {
      setShowInput(true);
    }
  }, [props.flexible]);
  return (
    <FormItem
      className={classNames(
        props.formClassName,
        showInput ? props.flexible : '',
        props.flexible && !showInput && 'short',
      )}
      label={props.formLabel}>
      {props.flexible ? (
        <AnimatedInput
          showInput={showInput}
          inputProps={_.omit(props, ['formClassName', 'formLabel', 'tokenInfo', 'msg', 'status'])}
          className={classNames('syn-form-input', props.className, showInput && 'show', props.flexible && 'flexible')}
          onWrapperClick={suffixClicked}
          suffix={
            <span className={props.flexible ? 'syn-form-input-flexible ant-input-suffix' : ''} onClick={suffixClicked}>
              {props.suffix || props.tokenInfo?.symbol}
            </span>
          }
        />
      ) : (
        <Input
          {..._.omit(props, ['formClassName', 'formLabel', 'tokenInfo', 'msg', 'status'])}
          className={classNames('syn-form-input', props.className, showInput && 'show', props.flexible && 'flexible')}
          onWheel={(e) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (e.target as any).blur();
          }}
          size={props.size}
          suffix={
            <span className={props.flexible ? 'syn-form-input-flexible' : ''} onClick={suffixClicked}>
              {props.suffix || props.tokenInfo?.symbol}
            </span>
          }
        />
      )}
      {props.msg && <div className={`message ${props.status}`}> {props.msg}</div>}
    </FormItem>
  );
}

export const TokenFormInput = React.memo(TokenFormInputComponent);
