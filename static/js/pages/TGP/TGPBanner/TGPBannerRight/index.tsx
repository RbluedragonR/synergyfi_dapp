/**
 * @description Component-TGPBannerRight
 */
import './index.less';

import moment from 'moment';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { FETCHING_STATUS } from '@/constants';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import {
  useCurrentTGPWeek,
  useIsMaster,
  useTGPDappConfig,
  useTGPUser,
  useTGPUserStatus,
  useUserCheckStatus,
  useUserJWTToken,
  useUserJWTTokenStatus,
} from '@/features/tgp/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import { TGP_USER_STATUS } from '@/types/tgp';
import { getChainShortName } from '@/utils/chain';

import TGPRankClaimModal from '../../components/TGPModal/TGPClaimModal';
import TGPName from '../../components/TGPName';
import TGPBannerWalletConnect from '../TGPBannerWalletConnect';
import TGPBannerBtn from './TGPBannerBtn';
import TGPBannerRank from './TGPBannerRank';
import TGPBannerRightSeasons from './TGPBannerRightSeasons';
import TGPBannerRule from './TGPBannerRule';
import TGPBannerSkeleton from './TGPBannerSkeleton';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPBannerRight: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  const jwtToken = useUserJWTToken(userAddr);

  const jwtTokenStatus = useUserJWTTokenStatus(userAddr);
  const tgpUser = useTGPUser(userAddr);
  const dappConfig = useTGPDappConfig();
  const navigate = useNavigate();
  const [openMaster, setOpenMaster] = useState(false);
  const isMaster = useIsMaster(userAddr);
  const tgpUserStatus = useTGPUserStatus(userAddr);
  const isMasterStatus = useUserCheckStatus(userAddr);
  const hasJoinTGP = useMemo(() => {
    return !!tgpUser && tgpUser.status >= TGP_USER_STATUS.DEFAULT;
  }, [tgpUser]);

  const claimValue = useMemo(() => {
    return tgpUser && tgpUser?.rankings?.master?.prize;
  }, [tgpUser]);

  const showClaim = useMemo(() => {
    const res =
      isMaster &&
      tgpUser?.rankings?.master?.claimed !== true &&
      WrappedBigNumber.from(tgpUser?.rankings?.master?.prize || 0).gt(0);
    if (dappConfig.weeks.length) {
      const lastWeek = isMaster ? dappConfig.weeks[3] : dappConfig.weeks[dappConfig.weeks.length - 1];

      if (moment().utc().isBefore(moment.utc(lastWeek?.endTs))) {
        return false;
      }
    }
    return res;
  }, [dappConfig.weeks, isMaster, tgpUser?.rankings?.master?.claimed, tgpUser?.rankings?.master?.prize]);

  const onClickTradeNow = useCallback(() => {
    if (dappConfig) {
      const defaultPair = dappConfig.trade?.defaultPair;
      const defaultChainId = dappConfig.trade?.defaultChainId;
      const chainShortName = getChainShortName(defaultChainId);
      navigate(`/trade/${chainShortName}/${defaultPair}`);
    }
  }, [dappConfig, navigate]);

  const currentWeek = useCurrentTGPWeek();

  const isShowSkeleton = useMemo(() => {
    return (
      jwtTokenStatus !== FETCHING_STATUS.DONE ||
      isMasterStatus !== FETCHING_STATUS.DONE ||
      (jwtToken && tgpUserStatus === FETCHING_STATUS.INIT)
    );
  }, [isMasterStatus, jwtToken, jwtTokenStatus, tgpUserStatus]);

  const isShowUserInfo = useMemo(() => {
    return userAddr && jwtToken && hasJoinTGP && tgpUserStatus !== FETCHING_STATUS.INIT;
  }, [hasJoinTGP, jwtToken, tgpUserStatus, userAddr]);

  const hasClaimed = useMemo(() => {
    if (isMaster) {
      return tgpUser?.rankings?.master?.claimed;
    }
    return false;
  }, [isMaster, tgpUser?.rankings?.master?.claimed]);

  const showTrade = useMemo(() => {
    return !isMaster || !showClaim;
  }, [isMaster, showClaim]);

  return (
    <div className="syn-tgp-banner-right">
      <div className="syn-tgp-banner-right-container">
        {isShowSkeleton ? (
          <TGPBannerSkeleton />
        ) : (
          <>
            {isShowUserInfo ? (
              <>
                <TGPName userAddr={userAddr} />
                <div className="syn-tgp-banner-right-type">
                  <div className="syn-tgp-banner-right-type-left">
                    <span>{isMaster ? t('tgp.banner.rank.rankMaster') : t('tgp.banner.rank.rankOpen')}</span>
                    <TGPBannerRule />
                  </div>
                  <div className="syn-tgp-banner-right-type-right">
                    {false && (
                      <TGPBannerBtn
                        hasClaimed={hasClaimed}
                        showClaim={showClaim || hasClaimed}
                        showTrade={showTrade}
                        claimValue={claimValue}
                        onClick={() => {
                          if (hasClaimed) return;
                          if (showTrade) {
                            onClickTradeNow();
                          } else {
                            // show claim modal
                            setOpenMaster(true);
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
                {!isMaster && <TGPBannerRightSeasons />}
                <TGPBannerRank isMaster={isMaster} />
              </>
            ) : (
              <TGPBannerWalletConnect jwtToken={jwtToken} isMaster={isMaster} />
            )}
          </>
        )}

        {isMaster && showClaim && (
          <TGPRankClaimModal
            open={openMaster}
            rank={tgpUser?.rankings?.master?.rank}
            toggleModal={(open) => {
              setOpenMaster(open);
            }}
            isMaster={isMaster}
            prize={claimValue}
            week={currentWeek}
          />
        )}
      </div>
    </div>
  );
};

export default TGPBannerRight;
