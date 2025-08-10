import { vaultStageInfos } from '@/constants/launchpad/vault';
import { Stage } from '@synfutures/sdks-perp-launchpad';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';
type TVaultStatusTextProps = ComponentProps<'div'> & {
  vaultStage: Stage;
  type?: 'default' | 'tag';
};
export default function VaultStatusText({ vaultStage, type = 'default' }: TVaultStatusTextProps) {
  const { t } = useTranslation();
  const statusInfo = vaultStageInfos[vaultStage];
  if (!statusInfo) {
    return null;
  }
  const { color, bgColor, i18nId } = statusInfo;
  return (
    <div
      className={classNames('syn-vault-status-text', `syn-vault-status-text-${type}`)}
      style={{ color, backgroundColor: type === 'tag' ? bgColor : 'unset' }}>
      {type == 'tag' && vaultStage === Stage.LIVE && (
        <div
          style={{
            backgroundColor: color,
            width: 6,
            height: 6,
            borderRadius: 99,
          }}
        />
      )}
      {t(i18nId)}
    </div>
  );
}
