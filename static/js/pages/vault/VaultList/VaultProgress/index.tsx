/**
 * @description Component-VaultProgress
 */
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { ReactComponent as TargetIcon } from '@/pages/vault/assets/svg/GPS.svg';

import './index.less';

import { FormatNumberWithTooltipType } from '@/components/NumberFormat';
import { Flex, Progress } from 'antd';
import classNames from 'classnames';
import { FC, useMemo } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  targetTvl: WrappedBigNumber;
  tvl: WrappedBigNumber;
  vaultTokenSymbol?: string;
  type?: 'horizontal' | 'vertical';
}
const VaultProgress: FC<IPropTypes> = function ({ targetTvl, tvl, type = 'horizontal' }) {
  const progress = useMemo(() => {
    return tvl.mul(100).div(targetTvl);
  }, [targetTvl, tvl]);
  return (
    <Flex align="center" className={classNames('syn-vault-progress', `syn-vault-progress-${type}`)}>
      {/* <div className="syn-vault-progress-left">
        {tvl.formatNumberWithTooltip({
          isShowTBMK: true,
          prefix: type === 'horizontal' ? '$' : undefined,
          suffix: type === 'vertical' ? vaultTokenSymbol : undefined,
        })}
      </div> */}
      <Progress
        showInfo={type === 'vertical' && false}
        strokeColor={{
          from: '#40BFBF',
          to: '#85E094',
        }}
        trailColor="#C3E7E7"
        format={(percent) => percent + '%'}
        percent={progress.toNumber()}
      />
      {/* <Flex align="center" gap={4} className="syn-vault-progress-right">
        <TargetIcon />
        {targetTvl.formatNumberWithTooltip({
          isShowTBMK: true,
          prefix: type === 'horizontal' ? '$' : undefined,
          suffix: type === 'vertical' ? vaultTokenSymbol : undefined,
        })}
      </Flex> */}
    </Flex>
  );
};

export const LaunchTarget: FC<
  IPropTypes & {
    targetDisplayProps?: Omit<FormatNumberWithTooltipType, 'num'>;
  }
> = function ({ targetTvl, targetDisplayProps }) {
  // const progress = useMemo(() => {
  //   return tvl.mul(100).div(targetTvl);
  // }, [targetTvl, tvl]);

  return (
    <Flex gap={4} align="center" className={classNames('syn-vault-progress-without-tvl')}>
      <TargetIcon />
      {targetTvl.formatNumberWithTooltip({
        isShowTBMK: true,
        prefix: '$',
        ...targetDisplayProps,
      })}
      {/* <Progress
        className="syn-vault-progress-without-tvl-progress"
        strokeWidth={27}
        size={16}
        type="circle"
        percent={progress.toNumber()}
        showInfo={false}
        trailColor={'#C3E7E7'}
        strokeColor={'#00BFBF'}
      />
      <span className="syn-vault-progress-without-tvl-percentage">{Math.floor(progress.toNumber())}%</span> */}
    </Flex>
  );
};

export default VaultProgress;
