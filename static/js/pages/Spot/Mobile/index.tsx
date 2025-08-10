import { SPOT_KLINE_INTERVAL } from '@/constants/spot';
import { useSpotState } from '@/features/spot/store';
import SpotChart from '../SpotChart';
import SpotHistory from '../SpotHistory';
import SpotSwapDetail from '../SpotSwap/SpotSwapDetail';
import SpotSwapFormContent from '../SpotSwap/SpotSwapFormContent';
import SwapFooter from '../SpotSwap/SwapFooter';
import SpotMobileDexTable from './SpotMobileDexTable';
import SpotMobileRoute from './SpotMobileRoute';
import SpotMobileTitle from './SpotMobileTitle';
import './index.less';
export default function SpotMobile() {
  const { mobileGraphOpen } = useSpotState();

  return (
    <div className="syn-spot-mobile">
      <div className="syn-spot-mobile-swap">
        <SpotMobileTitle />
        {mobileGraphOpen && <SpotChart isMobile={true} defaultSpotKlineInterval={SPOT_KLINE_INTERVAL.D_1} />}
        <SpotSwapFormContent />
        <SpotSwapDetail />
        <SwapFooter />
        <SpotMobileRoute />
      </div>
      <div className="syn-spot-mobile-bottom">
        <SpotMobileDexTable />
        <SpotHistory />
      </div>
    </div>
  );
}
