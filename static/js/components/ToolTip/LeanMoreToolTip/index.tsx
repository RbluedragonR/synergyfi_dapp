/**
 * @description Component-LeanMoreToolTip
 */
import { TooltipProps } from 'antd';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ExternalLink } from '@/components/Link';

import IconToolTip from '../IconToolTip';
import UnderlineToolTip from '../UnderlineToolTip';
export type LearnMoreTooltip = Omit<TooltipProps, 'overlay'> & {
  link?: string;
  linkText?: string;
  icon?: React.ReactNode;
};

const LeanMoreToolTip: FC<LearnMoreTooltip> = function ({ linkText, link, ...props }) {
  const { t } = useTranslation();
  const SynTooltip = useMemo(() => {
    return props.children ? UnderlineToolTip : IconToolTip;
  }, [props.children]);
  return (
    <SynTooltip
      {...props}
      title={
        props.title && (
          <span
            onClick={(e) => {
              e.stopPropagation();
            }}>
            <>
              {props.title} {link && <ExternalLink href={link}>{linkText || t('common.learnMore')}</ExternalLink>}
            </>
          </span>
        )
      }
    />
  );
};

export default LeanMoreToolTip;
