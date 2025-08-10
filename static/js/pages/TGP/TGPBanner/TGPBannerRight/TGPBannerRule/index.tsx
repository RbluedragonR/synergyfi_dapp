/**
 * @description Component-TGPBannerRule
 */
import './index.less';

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsMaster, useTGPDappConfig } from '@/features/tgp/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPBannerRule: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const tgpConfig = useTGPDappConfig();
  const userAddr = useUserAddr();
  const isMaster = useIsMaster(userAddr);
  return (
    <div className="syn-tgp-banner-rule">
      <a
        className="syn-tgp-banner-rule-link"
        target="_blank"
        href={isMaster ? tgpConfig.masterDocsLink : tgpConfig.openDocsLink}
        rel="noreferrer">
        {t('tgp.banner.rank.learnRules')}
      </a>
    </div>
  );
};

export default TGPBannerRule;
