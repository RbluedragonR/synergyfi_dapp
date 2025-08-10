/**
 * @description Component-PointsEarned
 */
import './index.less';

import classNames from 'classnames';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { EARN_POINTS_TYPE, ODYSSEY_SHARED_ON_TWITTER } from '@/constants/odyssey';
import { claimExtraPointsAction } from '@/features/odyssey/actions';
import { useOdysseyProfile, useTwitterLink } from '@/features/odyssey/hooks';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { ReactComponent as CloseIcon } from '@/pages/Odyssey/assets/svg/icon_close_linear.svg';
import { USER_STATUS } from '@/types/odyssey';
import { formatNumber } from '@/utils/numberUtil';

import claimStar from '../../assets/svg/illus_modal_stars.svg';
import OdysseyButton from '../OdysseyButton';

interface IPropTypes {
  className?: string;
  onClose: () => void;
  pointsEarned: number;
  superSpins?: number;
  type?: EARN_POINTS_TYPE;
  total: number;
  firstTime?: boolean;
  numbersRemain?: number;
  onResume: () => void;
  estimatedExtraPoints?: number;
}
const PointsEarned: FC<IPropTypes> = function ({
  onClose,
  pointsEarned,
  type = EARN_POINTS_TYPE.BOX,
  total,
  numbersRemain,
  onResume,
  superSpins,
  firstTime,
  estimatedExtraPoints,
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userAddr = useUserAddr();
  const chainId = useChainId();
  const getTwitterLink = useTwitterLink(userAddr);
  const profile = useOdysseyProfile(userAddr, chainId);
  const [extraPoints, setExtraPoints] = useState(0);
  const [sharedOnTwitter, setSharedOnTwitter] = useState(false);
  const pointsToShow = useMemo(() => {
    return pointsEarned ? formatNumber(pointsEarned + (extraPoints || 0), 0, false) : undefined;
  }, [extraPoints, pointsEarned]);
  const claimExtraPoints = useCallback(async () => {
    if (userAddr && chainId) {
      try {
        const result = await dispatch(claimExtraPointsAction({ userAddr, chainId })).unwrap();
        if (result) {
          setExtraPoints(result);
          localStorage.setItem(`${ODYSSEY_SHARED_ON_TWITTER}-${userAddr}-${chainId}`, 'true');
        }
        // await dispatch(getUserProfile({ userAddr, chainId })).unwrap();
      } catch (error) {
        //TODO: claim extra points error handle
        // await dispatch(getUserProfile({ userAddr, chainId })).unwrap();
      }
    }
  }, [dispatch, userAddr, chainId]);
  useEffect(() => {
    setSharedOnTwitter(!!localStorage.getItem(`${ODYSSEY_SHARED_ON_TWITTER}-${userAddr}-${chainId}`));
  }, [chainId, userAddr]);
  return (
    <div className="syn-points-earned">
      <div className="syn-points-earned-row">
        <div className="syn-points-earned-container">
          <CloseIcon className="syn-points-earned-close" onClick={onClose} />
          <img width={286} src={claimStar} />
          <div className="syn-points-earned-container-points">
            <div className="syn-points-earned-container-points-top">
              <div className="syn-points-earned-container-points-top-number">
                {pointsToShow && (
                  <div className="syn-points-earned-container-points-top-number-big">
                    {pointsToShow}
                    {!!estimatedExtraPoints &&
                      estimatedExtraPoints > 0 &&
                      sharedOnTwitter &&
                      profile?.status !== USER_STATUS.EXTRA_POINTS_CLAIMED && (
                        <div className="syn-points-earned-container-points-top-number-sub">+{estimatedExtraPoints}</div>
                      )}
                  </div>
                )}
              </div>
              <div className="syn-points-earned-container-points-top-text">{t('odyssey.earnP.points')}</div>
            </div>
            <div className={classNames('syn-points-earned-container-points-bottom', { shared: extraPoints })}>
              {profile && (profile?.status === USER_STATUS.EXTRA_POINTS_CLAIMED || type === EARN_POINTS_TYPE.SPIN) ? (
                <>
                  {total > 1 && (
                    <div className="syn-points-earned-container-points-bottom-text shared">
                      <Trans
                        i18nKey={
                          type === EARN_POINTS_TYPE.BOX
                            ? 'odyssey.earnP.totalBoxesLine'
                            : 'odyssey.earnP.totalSpinsLine'
                        }
                        components={{ b: <b /> }}
                        values={{
                          total,
                        }}
                      />
                      {!!superSpins && (
                        <>
                          <span className="divider">/</span>{' '}
                          <Trans
                            i18nKey="odyssey.earnP.superSpinsLine"
                            components={{ b: <b /> }}
                            values={{
                              superSpins,
                            }}
                          />
                        </>
                      )}
                    </div>
                  )}
                  {numbersRemain && numbersRemain > 1 ? (
                    <OdysseyButton className="primary xl" onClick={onResume} type="primary">
                      {t('odyssey.earnP.resume')}
                    </OdysseyButton>
                  ) : (
                    <OdysseyButton className="primary xl" onClick={onClose} type="primary">
                      {t('odyssey.earnP.done')}
                    </OdysseyButton>
                  )}
                </>
              ) : (
                <>
                  {sharedOnTwitter ? (
                    <>
                      <OdysseyButton className="primary xl" onClick={claimExtraPoints} type="primary">
                        {t('odyssey.earnP.claimRewards')}
                      </OdysseyButton>
                      <a
                        className="syn-points-earned-container-points-bottom-link"
                        onClick={() => {
                          setSharedOnTwitter(true);
                          if (firstTime) {
                            gtag('event', 'share_on_twitter_when_open_first_box', {
                              click_action: 'click',
                            });
                          }
                          window.open(getTwitterLink(), '_blank');
                        }}>
                        {t('odyssey.earnP.shareAgain')}
                      </a>
                    </>
                  ) : (
                    <>
                      <OdysseyButton
                        className="primary xl"
                        onClick={() => {
                          setSharedOnTwitter(true);
                          if (firstTime) {
                            gtag('event', 'share_on_twitter_when_open_first_box', {
                              click_action: 'click',
                            });
                          }
                          window.open(getTwitterLink(), '_blank');
                        }}
                        type="primary">
                        {t('odyssey.earnP.shareOnT')}
                      </OdysseyButton>
                      <div className="syn-points-earned-container-points-bottom-text">
                        <Trans
                          i18nKey="odyssey.earnP.shareOnTLine"
                          values={{
                            points: estimatedExtraPoints || '',
                          }}
                          components={{ b: <b /> }}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsEarned;
