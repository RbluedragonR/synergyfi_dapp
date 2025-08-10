/**
 * @description Component-UnderlineToolTip
 */
import './index.less';

import { Tooltip, TooltipProps } from 'antd';
import BN from 'bignumber.js';
import classNames from 'classnames';
import { FC } from 'react';
import { useMediaQuery } from 'react-responsive';

import { negativeNumberColor } from '@/components/NumberFormat';

export type LearnMoreTooltip = Omit<TooltipProps, 'overlay'> & {
  link?: string;
  linkText?: string;
};

const UnderlineToolTip: FC<
  TooltipProps & {
    textOverflowEllipsisProps?: {
      viewportMinWidth: number;
      viewportMaxWidth: number;
      underlineWidth: string;
      textMaxWidth: string;
    };
    colorShaderProps?: { num: BN };
  }
> = function (props) {
  const isTextOverflowEllipsis =
    useMediaQuery({
      minWidth: props.textOverflowEllipsisProps?.viewportMinWidth || 1280,
      maxWidth: props.textOverflowEllipsisProps?.viewportMaxWidth || 1440,
    }) && !!props.textOverflowEllipsisProps;
  return (
    <Tooltip
      {...props}
      title={
        isTextOverflowEllipsis ? (
          <div
            style={{
              position: 'relative',
            }}>
            <div className="syn-underline-tooltip-text-ellipsis-extra-tooltip">{props.children}</div>
            {props.title as JSX.Element}
          </div>
        ) : (
          props.title
        )
      }>
      <span
        className={classNames(
          props.title && 'syn-underline-tooltip',
          isTextOverflowEllipsis && 'syn-underline-tooltip-text-ellipsis',
        )}
        style={{
          color: props.colorShaderProps ? negativeNumberColor(props.colorShaderProps.num) : undefined,
          width: isTextOverflowEllipsis ? props.textOverflowEllipsisProps?.textMaxWidth : undefined,
        }}>
        {props.children}
      </span>
      {/* // Since text-overflow hidden will hide the bottom border (after:) so adding extra bottom border for isTextOverflowEllipsis = true */}
      {isTextOverflowEllipsis && (
        <span
          style={{ width: isTextOverflowEllipsis ? props.textOverflowEllipsisProps?.underlineWidth : undefined }}
          className="syn-underline-tooltip-text-ellipsis-extra-underline"
        />
      )}
    </Tooltip>
  );
};

export default UnderlineToolTip;
