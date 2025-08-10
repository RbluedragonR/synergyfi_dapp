/**
 * @description Component-TGP
 */
import './index.less';

import { FC, useEffect } from 'react';

import { useHandleTwitterErrorMsg } from '@/features/odyssey/hooks';
import {
  useFetchTGPMasters,
  useFetchTGPUser,
  useIsRegistered,
  useIsTGPEnded,
  useTGPSeason,
} from '@/features/tgp/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import { CHAIN_ID } from '@/constants/chain';
import { useTheme } from '@/features/global/hooks';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import TGPBanner from './TGPBanner';
import TGPCommunity from './TGPCommunity';
import TGPLeaderBoard from './TGPLeaderBoard';
import TGPLuckyDraw from './TGPLuckyDraw';
import TGPTicketModal from './components/TGPTicketModal';
interface IPropTypes {
  className?: string;
}
const TGP: FC<IPropTypes> = function ({}) {
  useFetchTGPUser();
  useFetchTGPMasters();
  useHandleTwitterErrorMsg();
  const userAddr = useUserAddr();
  const season = useTGPSeason();
  const tgpEnded = useIsTGPEnded(season, userAddr);
  const isRegistered = useIsRegistered(userAddr);
  const chainId = useChainId();
  const navigate = useNavigate();
  const theme = useTheme();
  useEffect(() => {
    if (chainId !== CHAIN_ID.BLAST) {
      navigate('/', { replace: true });
    }
  }, [chainId, navigate]);

  return (
    <div id="tgp" className="syn-tgp">
      <div className={classNames('syn-tgp-container-wrap', theme.dataTheme)}>
        <div className="syn-tgp-container">
          <div className="syn-tgp-section">
            <TGPBanner />
          </div>
          <div className="syn-tgp-section">
            <TGPLeaderBoard />
          </div>
          {(!tgpEnded || isRegistered) && (
            <div className="syn-tgp-section">
              <TGPLuckyDraw />
            </div>
          )}
          <div className="syn-tgp-section">
            <TGPCommunity />
          </div>
        </div>
      </div>
      <TGPTicketModal />
    </div>
  );
};

export default TGP;
