/**
 * @description Component-RankClaimBtn
 */
import './index.less';

import moment from 'moment';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useTGPDappConfig } from '@/features/tgp/hooks';
import TGPRankClaimModal from '@/pages/TGP/components/TGPModal/TGPClaimModal';
import { ITGPBannerScore } from '@/types/tgp';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  showClaim: boolean;
  allHide?: boolean;
  item?: ITGPBannerScore;
  week: number;
}
const RankClaimBtn: FC<IPropTypes> = function ({ showClaim, allHide, item, week }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const tgpConfig = useTGPDappConfig();
  const isShowClaim = useMemo(() => {
    if (!showClaim) return false;
    if (tgpConfig) {
      const weekC = tgpConfig.weeks.find((w) => w.week === week);
      return weekC?.endTs && moment().utc().isAfter(moment.utc(weekC?.endTs));
    }
    return true;
  }, [showClaim, tgpConfig, week]);
  if (allHide) return null;
  if (!isShowClaim) return <div className="syn-rank-claim-btn-wrap"></div>;
  return (
    <>
      <button
        className="syn-rank-claim-btn"
        onClick={() => {
          setOpen(true);
        }}>
        {t('tgp.Claim')}
      </button>
      <TGPRankClaimModal
        open={open}
        rank={item?.rank}
        toggleModal={(open) => {
          setOpen(open);
        }}
        isMaster={false}
        week={week}
        prize={item?.prize}
      />
    </>
  );
};

export default RankClaimBtn;
