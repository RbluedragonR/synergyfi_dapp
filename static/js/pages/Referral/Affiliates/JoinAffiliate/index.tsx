/**
 * @description Component-JoinAffiliate
 */
import './index.less';

import { JOIN_AFFILIATE_LINK } from '@/constants/links';
import { useTheme } from '@/features/global/hooks';
import classNames from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import WalletWrappedButton from '../../components/WalletWrappedButton';
import { ReactComponent as Step1 } from './assets/icon_num_01.svg';
import { ReactComponent as Step2 } from './assets/icon_num_02.svg';
import { ReactComponent as Step3 } from './assets/icon_num_03.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const JoinAffiliate: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <div className="syn-join-affiliate">
      <div className={classNames('syn-join-affiliate-top', theme.dataTheme)}>
        <div className="syn-join-affiliate-top-up">{t('affiliates.joinAffiliates.title')}</div>
        <div className="syn-join-affiliate-top-middle">
          <div>{t('affiliates.joinAffiliates.subTitle1')}</div>
          <div>{t('affiliates.joinAffiliates.subTitle2')}</div>
          <div>{t('affiliates.joinAffiliates.joinNowExtra')}</div>
        </div>
        <div className="syn-join-affiliate-top-bottom">
          <WalletWrappedButton
            type="primary"
            className={`syn-join-affiliate-btn`}
            loading={false}
            disabled={false}
            onClick={() => {
              window.open(JOIN_AFFILIATE_LINK, '_blank');
            }}>
            {t('affiliates.joinAffiliates.joinNow')}
          </WalletWrappedButton>
        </div>
      </div>
      <div className="syn-join-affiliate-bottom">
        <div className="syn-join-affiliate-bottom-col">
          <div className="syn-join-affiliate-bottom-col-title">{t('affiliates.joinAffiliates.whyJoin.title')}</div>
          <div className="syn-join-affiliate-bottom-col-content">
            <h6>{t('affiliates.joinAffiliates.whyJoin.subTitle1')}</h6>
            <ul>
              <li>{t('affiliates.joinAffiliates.whyJoin.content.0')}</li>
              <li>{t('affiliates.joinAffiliates.whyJoin.content.1')}</li>
              <li>{t('affiliates.joinAffiliates.whyJoin.content.2')}</li>
              <li>{t('affiliates.joinAffiliates.whyJoin.content.3')}</li>
              <li>{t('affiliates.joinAffiliates.whyJoin.content.4')}</li>
            </ul>
            <h6>{t('affiliates.joinAffiliates.whyJoin.subTitle2')}</h6>
            <ul>
              <li>{t('affiliates.joinAffiliates.whyJoin.content.5')}</li>
            </ul>
          </div>
        </div>
        <div className="syn-join-affiliate-bottom-col">
          <div className="syn-join-affiliate-bottom-col-title">{t('affiliates.joinAffiliates.howItWorks.title')}</div>
          <div className="syn-join-affiliate-bottom-col-content">
            <div className="step">
              <div className="step-title">
                <Step1 />
              </div>
              <div className="step-content">
                <div className="step-content-top">{t('affiliates.joinAffiliates.howItWorks.steps.1.title')}</div>
                {t('affiliates.joinAffiliates.howItWorks.steps.1.content')}
              </div>
            </div>
            <div className="step">
              <div className="step-title">
                <Step2 />
              </div>
              <div className="step-content">
                <div className="step-content-top">{t('affiliates.joinAffiliates.howItWorks.steps.2.title')}</div>
                {t('affiliates.joinAffiliates.howItWorks.steps.2.content')}
              </div>
            </div>
            <div className="step">
              <div className="step-title">
                <Step3 />
              </div>
              <div className="step-content">
                <div className="step-content-top">{t('affiliates.joinAffiliates.howItWorks.steps.3.title')}</div>
                {t('affiliates.joinAffiliates.howItWorks.steps.3.content')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinAffiliate;
