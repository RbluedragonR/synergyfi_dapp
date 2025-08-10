import { axiosGet } from '@/utils/axios';
import { ITokenPrice, ITokenPriceMap } from './type';

export const getTokenPriceMap = async ({ chainId }: { chainId?: number }): Promise<ITokenPriceMap> => {
  const response = await axiosGet({
    url: `/v3/public/token/allPrice?chainId=${chainId}`,
  });

  const tokenPrices = response?.data?.data as ITokenPrice[];
  const tokenPriceMap: ITokenPriceMap = {};

  for (const price of tokenPrices) {
    if (price.address) {
      tokenPriceMap[price.address] = { ...price, priceChangePercentage24h: price.priceChangePercentage24h / 100 };
    }
  }

  return tokenPriceMap;
};
