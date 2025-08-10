/**
 * @description Component-TGPClaimModal
 */
import './index.less';

import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { TGP_LUCK_USER_STATUS } from '@/constants/tgp';
import { useTGPDappConfig } from '@/features/tgp/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import { formatNumber } from '@/utils/numberUtil';
import { getShareStorageKey, useTGPWeek } from '@/utils/tgp';

import TGPModal from '..';
import TGPTwitterDiscord from '../TGPTwitterDiscord';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  open: boolean;
  toggleModal: (isOpen: boolean) => void;
  isMaster: boolean;
  week: number;
  rank?: number;
  prize?: number;
}
const TGPRankClaimModal: FC<IPropTypes> = function ({ open, toggleModal, isMaster, week, rank, prize }) {
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  const weekI18n = useTGPWeek(week);
  const tgpConfig = useTGPDappConfig();
  console.log('🚀 ~ tgpConfig:', tgpConfig);
  const type = 'rank';
  return (
    <TGPModal
      className="syn-tgp-rank-claim-modal"
      open={open}
      onCancel={() => {
        if (userAddr) {
          const storageKey = getShareStorageKey(type, isMaster, week, userAddr);
          const status = Number(localStorage.getItem(storageKey) || 0);
          if (status === TGP_LUCK_USER_STATUS.JOINED) {
            localStorage.setItem(storageKey, TGP_LUCK_USER_STATUS.DISCORD_CONFIRMED.toString());
          }
          toggleModal(false);
        }
      }}
      desc={
        <Trans
          i18nKey={isMaster ? 'tgp.modal.rank.rankMasterDesc' : 'tgp.modal.rank.rankOpenDesc'}
          values={{ rank: t('tgp.rank', { rank: rank }), timeRange: weekI18n?.weekDates }}
          components={{ b: <b />, span: <span /> }}
        />
      }
      title={t('tgp.modal.congrat')}
      centerTitle={t('tgp.modal.luckyDraw.centerTitle')}
      centerNum={`${formatNumber(prize || 0, 0)} ${tgpConfig.prizeCurrency}`}>
      <div className="syn-tgp-rank-claim-modal-content">
        <TGPTwitterDiscord
          onConfirm={() => toggleModal(false)}
          type={type}
          week={week}
          isMaster={isMaster}
          modalStatus={'claim'}
        />
      </div>
    </TGPModal>
  );
};

export default TGPRankClaimModal;
