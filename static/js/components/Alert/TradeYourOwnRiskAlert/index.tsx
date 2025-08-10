import './index.less';

import classNames from 'classnames';
import { ComponentProps } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ReactComponent as IconWarningYellow } from '@/assets/svg/icon_warning_yellow.svg';
import SynLink from '@/components/Link';
import { FAQ_LINKS } from '@/constants/links';
import { useChainId } from '@/hooks/web3/useChain';
import { CHAIN_ID } from '@derivation-tech/context';
export type ITradeYourOwnRiskAlertProps = ComponentProps<'div'> & {
  i18nId: string;
  hrefInfo?: { href: string; label: string };
};

export default function TradeYourOwnRiskAlert({
  i18nId,
  className,
  hrefInfo,
  ...others
}: ITradeYourOwnRiskAlertProps): JSX.Element {
  const chainId = useChainId();
  const { i18n } = useTranslation();
  if (!i18n.exists(i18nId)) {
    return <></>;
  }
  return (
    <div {...others} className={classNames(className, 'syn-trade-your-own-risk-alert')}>
      <IconWarningYellow className="syn-trade-your-own-risk-alert-icon" />
      <Trans
        i18nKey={i18nId}
        components={{
          a: (
            <a
              href={chainId === CHAIN_ID.BASE ? FAQ_LINKS.COMMUNITY_BASE_DOC : FAQ_LINKS.COMMUNITY_DOC}
              target="_blank"
              rel="noreferrer"
            />
          ),
        }}
      />
      {hrefInfo && (
        <SynLink target="_blank" href={hrefInfo.href}>
          {hrefInfo.label}
        </SynLink>
      )}
    </div>
  );
}
