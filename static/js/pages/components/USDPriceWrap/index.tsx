/**
 * @description Component-USDPriceWrap
 */
import { CHAIN_ID } from '@derivation-tech/context';
import { FC, memo, useCallback, useEffect, useMemo } from 'react';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedQuote } from '@/entities/WrappedQuote';
import { useTokenPrice, useTokenPrices } from '@/features/global/query';
import { TokenInfo } from '@/types/token';
interface IPropTypes {
  chainId: CHAIN_ID | undefined;
  value: WrappedBigNumber | undefined;
  colorShader?: boolean;
  isShowTBMK?: boolean;
  prefix?: string;
  isLoading?: boolean;
  marginToken: TokenInfo;
  needTransfer?: boolean;
}
const USDPriceWrap: FC<IPropTypes> = function ({
  chainId,
  value,
  colorShader,
  isShowTBMK,
  marginToken,
  prefix = '$',
  isLoading,
  needTransfer = true,
}) {
  const { isLoading: isLoadingTokenPrices } = useTokenPrices({ chainId: marginToken?.chainId || chainId });
  const tokenPriceInfo = useTokenPrice({
    chainId: marginToken?.chainId || chainId,
    tokenAddress: marginToken?.address,
  });
  useEffect(() => {
    if (marginToken && marginToken instanceof WrappedQuote) {
      tokenPriceInfo && marginToken.setTokenPrice(tokenPriceInfo);
    }
  }, [marginToken, tokenPriceInfo]);

  const coinPriceBN = useMemo(() => {
    if (tokenPriceInfo?.current) {
      return WrappedBigNumber.from(tokenPriceInfo?.current);
    }
    return WrappedBigNumber.ZERO;
  }, [tokenPriceInfo]);

  const getUSDValue = useCallback(
    (value: WrappedBigNumber | undefined) => {
      if (coinPriceBN && value) {
        return value.mul(coinPriceBN);
      }

      return WrappedBigNumber.ZERO;
    },
    [coinPriceBN],
  );
  const usdPriceBN = useMemo(() => {
    return needTransfer ? getUSDValue(value) : WrappedBigNumber.from(value || 0);
  }, [getUSDValue, needTransfer, value]);

  return (
    <EmptyDataWrap isLoading={isLoading || isLoadingTokenPrices || !tokenPriceInfo?.current}>
      <span>
        {usdPriceBN.formatNumberWithTooltip({
          isShowTBMK,
          colorShader,
          prefix,
          isShowApproximatelyEqualTo: false,
        })}
      </span>
    </EmptyDataWrap>
  );
};

export default memo(USDPriceWrap);
