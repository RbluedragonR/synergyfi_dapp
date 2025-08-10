/**
 * @description Component-TGPTicketModal
 */
import './index.less';

import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { GlobalModalType } from '@/constants';
import { useModalOpen, useToggleModal } from '@/features/global/hooks';
import { useCurrentTGPWeek, useTGPUser, useUserSharedTicket } from '@/features/tgp/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import OdysseySquareButton from '@/pages/Odyssey/components/OdysseySquareButton';

import TGPModal from '../TGPModal';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPTicketModal: FC<IPropTypes> = function ({}) {
  const modalOpen = useModalOpen(GlobalModalType.LUCK_TICKET);
  const toggleModal = useToggleModal(GlobalModalType.LUCK_TICKET);
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  const tgpUser = useTGPUser(userAddr);
  const currentWeek = useCurrentTGPWeek();
  console.log('🚀 ~ currentWeek:', currentWeek);
  const sharedTicket = useUserSharedTicket(userAddr);
  const ticket = useMemo(() => {
    if (sharedTicket) {
      return sharedTicket;
    }
    return tgpUser?.luckyDraws.find((w) => w.week === currentWeek)?.ticket;
  }, [currentWeek, sharedTicket, tgpUser?.luckyDraws]);
  if (!ticket) {
    return null;
  }
  return (
    <div className="syn-tgp-ticket-modal">
      <TGPModal
        title={t('tgp.modal.luckyDraw.ticketTitle')}
        open={modalOpen}
        centerTitle={t('tgp.modal.luckyDraw.ticketNum')}
        centerNum={ticket}
        onCancel={() => {
          toggleModal(false);
        }}>
        <div className="syn-tgp-ticket-modal-bottom">
          <p className="syn-tgp-ticket-modal-text">{t('tgp.modal.luckyDraw.publicDate')}</p>
          <OdysseySquareButton
            onClick={() => {
              toggleModal(false);
            }}
            type="primary">
            {t('common.confirm')}
          </OdysseySquareButton>
        </div>
      </TGPModal>
    </div>
  );
};

export default TGPTicketModal;
