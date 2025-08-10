/**
 * @description Component-TGPModalTwitterShare
 */
import './index.less';

// import { Button } from 'antd';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TGP_LUCK_USER_STATUS, TGP_WAIT_TIME } from '@/constants/tgp';
import { useTGPTwitterLink } from '@/features/tgp/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import OdysseyButton from '@/pages/Odyssey/components/OdysseyButton';
// import { ReactComponent as IconRefresh } from '@/pages/TGP/assets/svg/icon_refresh_24.svg';
import { ReactComponent as IconShare } from '@/pages/TGP/assets/svg/icon_share_16.svg';
import { getShareStorageKey } from '@/utils/tgp';
interface IPropTypes {
  className?: string;
  type: 'luckyDraw' | 'rank';
  status: TGP_LUCK_USER_STATUS | undefined;
  statusChange: (status: TGP_LUCK_USER_STATUS) => void;
  week: number;
  modalStatus: 'claim' | 'shareToGetTicket';
  isMaster: boolean;
}
const TGPModalTwitterShare: FC<IPropTypes> = function ({
  status,
  statusChange,
  type = 'luckyDraw',
  week,
  modalStatus,
  isMaster,
}) {
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  const twitterLink = useTGPTwitterLink(week, type, modalStatus, isMaster);
  const [isSharing, setIsSharing] = useState(false);
  console.log('🚀 ~ twitterLink:', { twitterLink, week, type, modalStatus, isMaster });
  if (status && status >= TGP_LUCK_USER_STATUS.CONFIRMED) {
    return null;
  }
  return (
    <div className="syn-tgp-modal-twitter-share">
      {t('tgp.modal.shareLine')}
      <div className="syn-tgp-modal-twitter-share-bottom">
        {status === TGP_LUCK_USER_STATUS.INIT && (
          <OdysseyButton
            loading={isSharing}
            onClick={() => {
              if (userAddr) {
                const storageKey = getShareStorageKey(type, isMaster, week, userAddr);
                setIsSharing(true);
                setTimeout(() => {
                  setIsSharing(false);
                  statusChange(TGP_LUCK_USER_STATUS.CONFIRMED);
                  localStorage.setItem(storageKey, TGP_LUCK_USER_STATUS.CONFIRMED.toString());
                }, TGP_WAIT_TIME);
              }
            }}
            href={twitterLink}
            target="_blank"
            className="primary golden">
            {!isSharing && <IconShare />}
            {isSharing ? t('tgp.modal.sharing') : t('tgp.modal.share')}
          </OdysseyButton>
        )}
        {/* {status === TGP_LUCK_USER_STATUS.SHARED && (
          <>
            <Button
              onClick={() => {
                statusChange(TGP_LUCK_USER_STATUS.INIT);
              }}
              type="text"
              icon={<IconRefresh />}
            />
            <OdysseyButton
              onClick={() => {
                if (userAddr) {
                  const storageKey = getShareStorageKey(type, isMaster, week, userAddr);
                  statusChange(TGP_LUCK_USER_STATUS.CONFIRMED);
                  localStorage.setItem(storageKey, TGP_LUCK_USER_STATUS.CONFIRMED.toString());
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

export default TGPModalTwitterShare;
