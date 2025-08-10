import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { IGateBalanceInfo } from '@/types/balance';
import { BlockyResult } from '@/types/worker';
import { bigNumberObjectCheck, debounceRequest } from '@/utils';
import { axiosGet } from '@/utils/axios';
import { fixBalanceNumberDecimalsTo18, getTokenInfo } from '@/utils/token';
import { Context, TokenInfo as Token } from '@derivation-tech/context';
import { NATIVE_TOKEN_ADDRESS } from '@synfutures/sdks-perp';
import { BigNumber } from 'ethers';

export async function getGateBalanceFromChain(
  sdk: Context,
  userAddr: string,
  tokens: Token[],
  block?: number,
): Promise<
  | BlockyResult<
      {
        token: Token;
        balance: BigNumber;
        block: number;
      }[]
    >
  | undefined
> {
  if (!sdk) return;
  if (tokens.length === 0) {
    return;
  }

  tokens = tokens.map((token) =>
    token.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() ? sdk.wrappedNativeToken : token,
  );

  const quotes = tokens.map((t) => t.address);

  const [balances, blockInfo] = await sdk.perp.contracts.observer.getVaultBalances(userAddr, quotes, {
    blockTag: block,
  });
  if (blockInfo) {
    block = blockInfo[1];
  }

  return {
    block: block || 0,
    data: tokens.map((token, index) => {
      return {
        token: { ...token, address: token.address.toLowerCase() },
        balance: balances[index],
        block: block || 0,
      };
    }),
  };
}

export const fetchUserGateBalance = debounceRequest(
  async (chainId: number, userAddress: string): Promise<IGateBalanceInfo[] | null> => {
    const res = await axiosGet({
      url: '/v3/public/perp/market/user/gateValue',
      config: { params: { chainId, userAddress: userAddress } },
    });
    if (res?.data?.data) {
      const data = bigNumberObjectCheck(res.data.data);
      if (data?.length) {
        return data.map((d: IGateBalanceInfo) => {
          const info = {
            ...d,
            balance: WrappedBigNumber.from(fixBalanceNumberDecimalsTo18(BigNumber.from(d.balance), d.decimals)),
            decimals: Number(d.decimals),
            address: d.address.toLowerCase(),
          };
          return getTokenInfo(info, chainId);
        });
      }
    }
    return null;
  },
  500,
);
