/**
 * @description Component-SpotInfo
 */
import './index.less';

import { ReactComponent as SwapIcon } from '@/assets/svg/icon_swap.svg';
import { useMockDevTool } from '@/components/Mock';
import { SkeletonButton } from '@/components/Skeleton';
import { useSwitchToken } from '@/features/spot/hooks';
import { useSpotPairPrice } from '@/features/spot/query';
import { useSpotState } from '@/features/spot/store';
import { useChainId } from '@/hooks/web3/useChain';
import { Flex } from 'antd';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SpotPair from './SpotPair';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const SpotInfo: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const { token1, token0 } = useSpotState();
  const { data: pairPrice, isLoading } = useSpotPairPrice(chainId, token0?.address, token1?.address);
  const { isMockSkeleton } = useMockDevTool();
  const loading = isLoading || isMockSkeleton;
  const { switchToken } = useSwitchToken();
  return (
    <div className="syn-spot-info">
      <div className="syn-spot-info-top">
        <SpotPair baseToken={token0} quoteToken={token1} size={40} />
        <SwapIcon className="syn-spot-info-top-swap" onClick={switchToken} />
      </div>

      <div className="syn-spot-info-bottom">
        {loading ? (
          <Flex align="center" gap={24}>
            <Flex gap={16} align="center">
              <SkeletonButton width={112} height={36} />
              <SkeletonButton width={43} height={16} />
            </Flex>
            <Flex vertical gap={8}>
              <SkeletonButton width={56} height={16} />
              <SkeletonButton width={56} height={16} />
            </Flex>
            <Flex vertical gap={8}>
              <SkeletonButton width={56} height={16} />
              <SkeletonButton width={43} height={16} />
            </Flex>
            <Flex vertical gap={8}>
              <SkeletonButton width={70} height={16} />
              <SkeletonButton width={39} height={16} />
            </Flex>
            <Flex vertical gap={8}>
              <SkeletonButton width={70} height={16} />
              <SkeletonButton width={39} height={16} />
            </Flex>
          </Flex>
        ) : (
          !!pairPrice && (
            <div className="syn-spot-info-bottom-left">
              <div className="syn-spot-info-bottom-middle">
                <dl>
                  <dt>{t('common.price')}</dt>
                  <dd className="price">{pairPrice?.price.formatPriceNumberWithTooltip()}</dd>
                </dl>
                <dl>
                  <dt>{t('common.24HC')}</dt>
                  <dd>
                    {pairPrice?._24hChanged.formatPercentage({
                      decimals: 2,
                      isColorShaderWhiteIfZero: true,
                    })}
                  </dd>
                </dl>
                <dl>
                  <dt>{t('common.24HH')}</dt>
                  <dd>{pairPrice?._24hHigh.formatPriceNumberWithTooltip()}</dd>
                </dl>
                <dl>
                  <dt>{t('common.24HL')}</dt>
                  <dd>{pairPrice?._24hLow.formatPriceNumberWithTooltip()}</dd>
                </dl>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SpotInfo;
