/**
 * @description Component-SpotRoute
 */
import './index.less';

import { spotDexInfos } from '@/constants/spot';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { Route } from '@synfutures/sdks-aggregator';
import BN from 'bignumber.js';
import classNames from 'classnames';
import _ from 'lodash';
export default function SpotMobilePool({ route }: { route: Route }) {
  return (
    <div
      style={{ borderColor: _.get(spotDexInfos, [route.poolType])?.color }}
      className={classNames('syn-spot-mobile-route-pool')}>
      <span className="ratio">{WrappedBigNumber.from(route.ratio).formatPercentageString(true, 0, BN.ROUND_UP)}</span>
      <div className="pool-info">
        <img key={route.poolType} width={14} height={14} src={_.get(spotDexInfos, [route.poolType, 'imageSrc'])} />
        {_.get(spotDexInfos, [route.poolType])?.version}({WrappedBigNumber.from(route.fee).formatPercentageString()})
      </div>
    </div>
  );
}
