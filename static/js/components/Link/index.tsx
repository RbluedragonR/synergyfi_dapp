import './index.less';

import classNames from 'classnames';
import { HTMLProps, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '@/components/ToolTip';

import { ExplorerIcon } from '@/assets/svg';
import { checkLinkIsBlockExplorer } from '@/utils/chain';
import { ReactComponent as IconAddrLink } from './assets/icon_acct_new.svg';

export type SynLinkProps = Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref'> & {
  href: string;
  type?: 'primary' | 'secondary';
  children?: ReactNode;
  icon?: ReactNode;
};

export default function SynLink({ type = 'primary', ...props }: SynLinkProps): JSX.Element {
  const linkTarget = useMemo(() => {
    if (props.target === '_blank') {
      return { target: '_blank', rel: 'noreferrer noopener' };
    }
    return { target: props.target };
  }, [props.target]);
  return (
    <a
      {...props}
      {...linkTarget}
      className={classNames('syn-link', `syn-link-${type}`, props.className)}
      onClick={props.onClick}></a>
  );
}

export function ExternalLink({
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  ...rest
}: SynLinkProps): JSX.Element {
  return <SynLink {...rest} target={target} rel={rel} href={href} />;
}

export function ExternalLinkIcon({
  target = '_blank',
  href,
  children,
  rel = 'noopener noreferrer',
  icon,
  ...rest
}: SynLinkProps): JSX.Element {
  const isBlockExplorer = checkLinkIsBlockExplorer(href);
  return (
    <SynLink {...rest} className={classNames('external-link', rest.className)} target={target} rel={rel} href={href}>
      {children}{' '}
      {icon || isBlockExplorer ? (
        <ExplorerIcon className="external-link-icon" />
      ) : (
        <IconAddrLink className="external-link-icon" />
      )}
    </SynLink>
  );
}
export function ExternalLinkIconWithTooltip(props: SynLinkProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('common.viewOnScan')}>
      <ExternalLinkIcon {...props} />
    </Tooltip>
  );
}
