/**
 * @description Component-TGPLuckyDrawModal
 */
import './index.less';

import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { GlobalModalType } from '@/constants';
import { TGP_LUCK_USER_STATUS } from '@/constants/tgp';
import { useModalOpen, useToggleModal } from '@/features/global/hooks';
import { useIsMaster, useSelectedLuckyWeek, useTGPDappConfig, useTGPWeekState } from '@/features/tgp/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import { getShareStorageKey, useTGPWeek } from '@/utils/tgp';

import TGPModal from '../../components/TGPModal';
import TGPTwitterDiscord from '../../components/TGPModal/TGPTwitterDiscord';
// import { useCurrentLuckyWeek } from '@/features/tgp/hooks';
// import moment from 'moment';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPLuckyDrawModal: FC<IPropTypes> = function ({}) {
  const modalOpen = useModalOpen(GlobalModalType.LUCKY_DRAW);
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  const selectedWeek = useSelectedLuckyWeek();
  const week = useTGPWeek(selectedWeek);
  const tgpConfig = useTGPDappConfig();
  const weekWithState = useTGPWeekState(userAddr, selectedWeek);
  const toggleModal = useToggleModal(GlobalModalType.LUCKY_DRAW);
  const isMaster = useIsMaster(userAddr);
  const type = 'luckyDraw';
  return (
    <TGPModal
      className="syn-tgp-lucky-draw-modal"
      open={modalOpen}
      onCancel={() => {
        if (userAddr) {
          const storageKey = getShareStorageKey(type, isMaster, selectedWeek, userAddr);
          const status = Number(localStorage.getItem(storageKey) || 0);
          if (status === TGP_LUCK_USER_STATUS.JOINED) {
            localStorage.setItem(storageKey, TGP_LUCK_USER_STATUS.DISCORD_CONFIRMED.toString());
          }
          toggleModal(false);
        }
      }}
      title={t('tgp.modal.congrat')}
      centerTitle={t('tgp.modal.luckyDraw.centerTitle')}
      centerNum={`${weekWithState?.prize?.toString()} ${tgpConfig.prizeCurrency}`}>
      <div className="syn-tgp-lucky-draw-modal-content">
        <div className="syn-tgp-lucky-draw-modal-content-title">
          <Trans
            i18nKey="tgp.modal.luckyDraw.weekLine"
            values={{
              range: week?.weekDates,
            }}
            components={{ span: <span /> }}
          />
        </div>

        <TGPTwitterDiscord
          isMaster={isMaster}
          week={selectedWeek}
          type="luckyDraw"
          modalStatus="claim"
          onConfirm={() => toggleModal(false)}
        />
      </div>
    </TGPModal>
  );
};

export default TGPLuckyDrawModal;
