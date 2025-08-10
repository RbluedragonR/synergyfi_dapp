/**
 * @description Component-BuildOnNetworkCard
 */
import { useChainId, useChainShortName } from '@/hooks/web3/useChain';
import { ReactComponent as BuiltOnBase } from './assets/built_on_base.svg';
import { ReactComponent as BuiltOnBlast } from './assets/built_on_blast.svg';
import { ReactComponent as BuiltOnBlastLight } from './assets/built_on_blast_light.svg';
import './index.less';

import { THEME_ENUM } from '@/constants';
import { CHAIN_ID, SHOW_BUILD_CHAIN } from '@/constants/chain';
import { useTheme } from '@/features/global/hooks';
import classNames from 'classnames';
import { FC } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const BuildOnNetworkCard: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const chainShortName = useChainShortName(chainId);
  const { dataTheme } = useTheme();

  if (chainId && !SHOW_BUILD_CHAIN.includes(chainId)) return null;
  return (
    <div className={classNames('syn-build-on-network-card', chainShortName)}>
      <div className="syn-build-on-network-card-img">
        {chainId === CHAIN_ID.BASE ? (
          <BuiltOnBase />
        ) : dataTheme === THEME_ENUM.LIGHT ? (
          <BuiltOnBlastLight />
        ) : (
          <BuiltOnBlast />
        )}
      </div>
    </div>
  );
};

export default BuildOnNetworkCard;
