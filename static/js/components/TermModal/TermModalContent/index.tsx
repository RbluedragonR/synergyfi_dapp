/**
 * @description Component-TermModalContent
 */
import './index.less';

import { default as classNames, default as cls } from 'classnames';
import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { ExternalLink } from '@/components/Link';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { useGa } from '@/hooks/useGa';
import { GaCategory } from '@/utils/analytics';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  onCancel: () => void;
  onOk: () => void;
}
const TermModalContent: FC<IPropTypes> = function ({ onCancel, onOk }) {
  const { deviceType } = useMediaQueryDevice();
  const gaEvent = useGa();
  const { t } = useTranslation();
  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
      }}>
      <div className="syn-term_modal-body">
        <p>
          <Trans i18nKey="common.agreeTerm" t={t}>
            By trading on SynFutures, you agree to the{' '}
            <ExternalLink
              onClick={() => {
                gaEvent({
                  category: GaCategory.ACKNOWLEDGEMENTS,
                  action: 'Term-Click on Terms of Use',
                });
              }}
              href="https://www.synfutures.com/terms">
              Terms of Use
            </ExternalLink>
            {', '}
            <ExternalLink href="https://docsend.com/view/afw9jwebywuqs3z2">Terms & Condition</ExternalLink> and{' '}
            <ExternalLink
              onClick={() => {
                gaEvent({
                  category: GaCategory.ACKNOWLEDGEMENTS,
                  action: 'Term-Click on Privacy Policy',
                });
              }}
              href="https://www.synfutures.com/policy">
              Privacy Policy
            </ExternalLink>
            .
          </Trans>
        </p>
        <p>{t('common.term.agreeTerm2')}</p>
        <div className={classNames('term-detail', deviceType)}>
          <ul className="term-article">
            <li>{t('common.term.termDetail1')}</li>
            <li>{t('common.term.termDetail2')}</li>
            <li>{t('common.term.termDetail3')}</li>
            <li>{t('common.term.termDetail4')}</li>
            <li>{t('common.term.termDetail5')}</li>
          </ul>

          <div className="term-locations">{t('common.term.termLocation')}</div>
        </div>
      </div>
      <div className={cls('syn-term_modal-footer', deviceType)}>
        <Button ghost onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="primary" onClick={onOk} style={{ whiteSpace: 'nowrap' }}>
          {t('common.term.iAgree')}
        </Button>
      </div>
    </div>
  );
};

export default TermModalContent;
