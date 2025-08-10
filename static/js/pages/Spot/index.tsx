/**
 * @description Component-Spot
 */
import './index.less';

import { Default, Mobile } from '@/components/MediaQuery';
import SpotGlobalEffect from '@/features/spot/globalEffect';
import { FC } from 'react';
import SpotMobile from './Mobile';
import SpotChart from './SpotChart';
import SpotDexTable from './SpotDexTable';
import SpotHistory from './SpotHistory';
import SpotInfo from './SpotInfo';
import SpotOrderbook from './SpotOrderbook';
import SpotRoute from './SpotRoute';
import SpotSwap from './SpotSwap';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const Spot: FC<IPropTypes> = function ({}) {
  return (
    <div className="syn-spot">
      <Default>
        <div className="syn-spot-wrapper">
          <div className="syn-spot-left">
            <div className="syn-spot-left-top">
              <div className="syn-spot-left-top-top">
                <SpotInfo />
              </div>
              <div className="syn-spot-left-top-bottom">
                <SpotChart />
                <SpotOrderbook />
              </div>
            </div>
            <SpotRoute />
            <SpotDexTable />
          </div>
          <div className="syn-spot-right">
            <SpotSwap />
            <SpotHistory />
          </div>
        </div>
      </Default>
      <Mobile>
        <SpotMobile />
      </Mobile>
      <SpotGlobalEffect />
    </div>
  );
};

export default Spot;
