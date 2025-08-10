import {
  CheckCircleFilled,
  CloseCircleFilled,
  CloseOutlined,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from '@ant-design/icons';
import { message } from 'antd';
import { MessageType } from 'antd/es/message/interface';
import { IconType } from 'antd/es/notification/interface';
import { ArgsProps } from 'antd/lib/message';
import {} from 'antd/lib/notification';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo } from 'react';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { useEtherscanLink } from '@/hooks/web3/useChain';

const typeToIcon = {
  success: CheckCircleFilled,
  info: InfoCircleFilled,
  error: CloseCircleFilled,
  warning: ExclamationCircleFilled,
};

interface IMessage extends ArgsProps {
  type?: IconType;
  tx?: string; // window.open(txHash)
}

export const useMessage = (): {
  open: (args: IMessage) => void;
  success: (args: IMessage) => void;
  info: (args: IMessage) => void;
  warning: (args: IMessage) => void;
  error: (args: IMessage) => void;
} => {
  const { deviceType } = useMediaQueryDevice();
  useEffect(() => {
    message.config({
      top: 76,
      duration: 5,
    });
  }, []);
  const getEtherscanLink = useEtherscanLink();
  /**
   * message wrapper, add tx open func
   * @param args message args
   */
  const openMessage = useCallback(
    (args: IMessage): void => {
      let iconNode: React.ReactNode = null;
      if (args.type) {
        const prefix = 'ant-message-notice';
        iconNode = React.createElement(typeToIcon[args.type] || null, {
          className: `${prefix}-icon ${prefix}-icon-${args.type}`,
        });
      }
      // eslint-disable-next-line prefer-const
      let hide: MessageType;
      const content = (
        <div
          className="syn-message-content-wrap"
          onClick={() => {
            if (args.tx) {
              window.open(getEtherscanLink(args.tx, 'transaction'));
            }
          }}>
          <div className="syn-message-content">{args.content}</div>
          <div
            className="syn-message-content-close"
            onClick={(e) => {
              hide();
              e.stopPropagation();
            }}>
            <CloseOutlined />
          </div>
        </div>
      );
      hide = message[args.type || 'info'](
        {
          content: content,
          // description: args.description,
          icon: iconNode,
          duration: args.type === 'error' ? 30 : args.type === 'info' ? 5 : 5,
          className: classNames('syn-message', deviceType),
          onClick: () => {
            if (args.tx) {
              window.open(getEtherscanLink(args.tx, 'transaction'));
            }
          },
        },
        args.duration,
      );
    },
    [deviceType, getEtherscanLink],
  );

  /**
   *  add click
   */
  const txMessage = useMemo(() => {
    const res = {
      open: openMessage,
      success: openMessage,
      info: openMessage,
      warning: openMessage,
      error: openMessage,
    };

    const types: IconType[] = ['success', 'info', 'warning', 'error'];
    types.forEach((type: IconType) => {
      res[type] = (args: IMessage): void =>
        res.open({
          ...args,
          type,
        });
    });
    return res;
  }, [openMessage]);

  return txMessage;
};
