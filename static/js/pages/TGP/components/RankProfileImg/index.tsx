/**
 * @description Component-RankProfileImg
 */
import './index.less';

import { Jazzicon } from '@uktvs/jazzicon-react';
import _ from 'lodash';
import { FC, useMemo } from 'react';

import bronzeRing from '@/pages/TGP/assets/images/avatar_frame_bronze.png';
import goldRing from '@/pages/TGP/assets/images/avatar_frame_gold.png';
import silverRing from '@/pages/TGP/assets/images/avatar_frame_silver.png';
interface IPropTypes {
  realRank: number;
  className?: string;
  imgUrl: string | undefined;
  isOpen?: boolean;
  userId: string | undefined;
}
const rankMap = { 1: goldRing, 2: silverRing, 3: bronzeRing };
const RankProfileImg: FC<IPropTypes> = function ({ realRank, imgUrl, isOpen, userId }) {
  const rankImg = useMemo(() => _.get(rankMap, [realRank]), [realRank]);
  return (
    <div className="syn-rank-profile-img">
      {rankImg && <img src={rankImg} width={24} height={24} className="rank-bg" />}
      {isOpen ? (
        <div className="identicon">
          <Jazzicon address={userId || ''} />
        </div>
      ) : (
        <img
          src={imgUrl || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'}
          width={24}
          height={24}
        />
      )}
    </div>
  );
};

export default RankProfileImg;
