/**
 * @description Component-TGPModalDiscordJoin
 */
import './index.less';

// import { Button } from 'antd';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TGP_LUCK_USER_STATUS } from '@/constants/tgp';
import { useTGPDappConfig } from '@/features/tgp/hooks';
// import { useUserAddr } from '@/hooks/web3/useChain';
import OdysseyButton from '@/pages/Odyssey/components/OdysseyButton';
// import { ReactComponent as IconRefresh } from '@/pages/TGP/assets/svg/icon_refresh_24.svg';
// import { getShareStorageKey } from '@/utils/tgp';
interface IPropTypes {
  className?: string;
  onConfirm: () => void;
  type?: 'luckyDraw' | 'rank';
  status: TGP_LUCK_USER_STATUS | undefined;
  statusChange: (status: TGP_LUCK_USER_STATUS) => void;
  week: number;
  modalStatus: 'claim' | 'shareToGetTicket';
  isMaster: boolean;
}
const TGPModalDiscordJoin: FC<IPropTypes> = function ({
  // onConfirm,
  status,
  // statusChange,
  // type = 'luckyDraw',
  // week,
  // isMaster,
}) {
  // const userAddr = useUserAddr();
  const tgpConfig = useTGPDappConfig();
  const { t } = useTranslation();
  if (!status || status < TGP_LUCK_USER_STATUS.CONFIRMED) {
    return null;
  }
  return (
    <div className="syn-tgp-modal-discord-join">
      <div className="syn-tgp-modal-discord-join-title">
        {t('tgp.modal.joinTitle')}
        <div className="syn-tgp-modal-discord-join-subtitle">{t('tgp.modal.joinSubtitle')}</div>
      </div>
      <div className="syn-tgp-modal-discord-join-bottom">
        {status === TGP_LUCK_USER_STATUS.CONFIRMED && (
          <OdysseyButton
            // onClick={() => {
            //   if (userAddr) {
            //     const storageKey = getShareStorageKey(type, isMaster, week, userAddr);
            //     statusChange(TGP_LUCK_USER_STATUS.DISCORD_CONFIRMED);
            //     localStorage.setItem(storageKey, TGP_LUCK_USER_STATUS.JOINED.toString());
            //   }
            // }}
            href={tgpConfig.telegramGroup}
            target="_blank"
            className="primary golden">
            {t('tgp.modal.join')}
          </OdysseyButton>
        )}
        {/* {status > TGP_LUCK_USER_STATUS.CONFIRMED && (
          <>
            <Button
              onClick={() => {
                statusChange(TGP_LUCK_USER_STATUS.CONFIRMED);
              }}
              type="text"
              icon={<IconRefresh />}
            />

            <OdysseyButton
              onClick={() => {
                if (userAddr) {
                  statusChange(TGP_LUCK_USER_STATUS.DISCORD_CONFIRMED);

                  const storageKey = getShareStorageKey(type, isMaster, week, userAddr);
                  localStorage.setItem(storageKey, TGP_LUCK_USER_STATUS.DISCORD_CONFIRMED.toString());
                  onConfirm();
                }
              }}
              className="primary">
              {t('tgp.modal.confirm')}
            </OdysseyButton>
          </>
        )} */}
      </div>
    </div>
  );
};

export default TGPModalDiscordJoin;
