/**
 * @description Component-LegalDisclaimer
 */
import { LEGAL_DISCLAIMER } from '@/constants/launchpad/vault';
import { FC } from 'react';
import { Trans } from 'react-i18next';
import { ReactComponent as WarningIcon } from './assets/icon_warning_yellow.svg';
import './index.less';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const LegalDisclaimer: FC<IPropTypes> = function ({}) {
  return (
    <div className="syn-legal-disclaimer">
      <WarningIcon />
      <Trans i18nKey="launchpad.legalDisclaimer" components={{ a: <a /> }} values={{ link: LEGAL_DISCLAIMER }} />
    </div>
  );
};

export default LegalDisclaimer;
