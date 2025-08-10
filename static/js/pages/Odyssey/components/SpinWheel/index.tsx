/**
 * @description Component-SpinWheel
 */
import './index.less';

import { useDebounceFn } from 'ahooks';
import classNames from 'classnames';
import { FC, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GlobalModalType } from '@/constants';
import { EARN_POINTS_TYPE, MYSTERY_STAGES } from '@/constants/odyssey';
import { useModalOpen, useToggleModal } from '@/features/global/hooks';
import { spinAction } from '@/features/odyssey/actions';
import { useSignUp, useUserDashboard, useUserOdysseyJWT } from '@/features/odyssey/hooks';
import { useAppDispatch } from '@/hooks';
import { ReactComponent as CloseIcon } from '@/pages/Odyssey/assets/svg/icon_close_linear.svg';
import { ReactComponent as VoiceOffIcon } from '@/pages/Odyssey/assets/svg/icon_music_off.svg';
import { ReactComponent as VoiceOnIcon } from '@/pages/Odyssey/assets/svg/icon_music_on.svg';
import { ISpinResult } from '@/types/odyssey';
import { formatNumber } from '@/utils/numberUtil';

import Modal from '@/components/Modal';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import lightTicker from '../../assets/images/light_ticker.png';
import pie from '../../assets/images/pie.png';
import spinCenter from '../../assets/images/spin_center.png';
import OdysseyButton from '../OdysseyButton';
import PointsEarned from '../PointsEarned';
import StarBg from '../StarBg';
interface IPropTypes {
  className?: string;
}
const SpinWheel: FC<IPropTypes> = function () {
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  const [spinning, setSpinning] = useState(false);
  const [stage, setStage] = useState(MYSTERY_STAGES.INIT);
  const [voiceOn, setVoiceOn] = useState(true);
  const [spinCount, setSpinCount] = useState(0);
  const [spinResults, setSpinResults] = useState<ISpinResult | undefined>(undefined);
  const chainId = useChainId();
  const audioRef = useRef<HTMLAudioElement>(null);
  const dashboard = useUserDashboard(userAddr, chainId);
  const modalOpen = useModalOpen(GlobalModalType.SPIN_WHEEL);
  const toggleModal = useToggleModal(GlobalModalType.SPIN_WHEEL);
  const jwt = useUserOdysseyJWT(userAddr, chainId);
  const signup = useSignUp();
  const spinAnimate = useCallback(() => {
    if (voiceOn) {
      audioRef.current?.play();
    }
    setTimeout(() => {
      setSpinning(false);
      setStage(MYSTERY_STAGES.CLAIM);
    }, 5300);
  }, [voiceOn, audioRef]);
  const { run: spin } = useDebounceFn(
    async (spins: number) => {
      if (userAddr && chainId) {
        try {
          if (!jwt) {
            const result = await signup();
            if (!result) {
              return;
            }
          }
          spinAnimate();
          setSpinning(true);
          setSpinCount(spins);
          const result = await dispatch(
            spinAction({
              userAddr,
              count: spins,
              chainId,
            }),
          ).unwrap();
          if (result) {
            setSpinResults(result);
          }
        } catch (error) {
          //TOOD: spin error handle
        }
      }
    },
    {
      wait: 200,
    },
  );
  const close = useCallback(() => {
    toggleModal();
    setSpinning(false);
    setStage(MYSTERY_STAGES.INIT);
  }, [toggleModal]);

  return (
    <Modal
      width={552}
      centered={true}
      styles={{ body: { height: 472 } }}
      open={modalOpen}
      onCancel={close}
      className={classNames('syn-spin-wheel')}>
      <audio ref={audioRef}>
        <source src="/audio/audio_all.mp3" type="audio/mp3" />
      </audio>
      {(stage !== MYSTERY_STAGES.INIT || spinning) && <StarBg />}
      {stage === MYSTERY_STAGES.INIT && (
        <div className="syn-spin-wheel-content">
          {' '}
          {!spinning && (
            <div className="syn-spin-wheel-voice-control">
              {!voiceOn ? (
                <VoiceOffIcon onClick={() => setVoiceOn(true)} />
              ) : (
                <VoiceOnIcon onClick={() => setVoiceOn(false)} />
              )}
              <CloseIcon onClick={close} className="syn-spin-wheel-close" />
            </div>
          )}
          <div className={classNames('syn-spin-wheel-container', { spin: spinning })}>
            <img height={104} src={lightTicker} className="syn-spin-wheel-arrow" />
            <div className="syn-spin-wheel-container-inner">
              <img
                className={classNames('syn-spin-wheel-container-bg', { spinning: spinning })}
                width={138}
                height={138}
                src={pie}
              />
              <img className="syn-spin-wheel-container-center" src={spinCenter} width={60} height={60} />
            </div>
          </div>
          {!spinning && (
            <div className="syn-spin-wheel-bottom">
              <div className="syn-spin-wheel-bottom-text">
                {t('odyssey.earnP.spins')}
                <span className="highlight">{formatNumber(dashboard?.spins || '', 2, false)}</span>
              </div>
              <div className="syn-spin-wheel-bottom-btns">
                <OdysseyButton className="primary xl" onClick={() => spin(1)} type="primary">
                  {' '}
                  {t('odyssey.earnP.spinO')}
                </OdysseyButton>
                <OdysseyButton
                  className="primary xl ghost"
                  onClick={() => spin(Math.floor(dashboard?.spins || 1))}
                  ghost>
                  {' '}
                  {t('odyssey.earnP.spinA')}
                </OdysseyButton>
              </div>
            </div>
          )}
        </div>
      )}
      {stage === MYSTERY_STAGES.CLAIM && (
        <PointsEarned
          onResume={() => setStage(MYSTERY_STAGES.INIT)}
          numbersRemain={dashboard?.spins}
          total={spinCount}
          type={EARN_POINTS_TYPE.SPIN}
          pointsEarned={spinResults?.points || 0}
          superSpins={spinResults?.superSpins}
          onClose={close}
        />
      )}
    </Modal>
  );
};

export default SpinWheel;
