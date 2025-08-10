import { BigNumber } from 'ethers';
import _ from 'lodash';
import moment from 'moment';

import { CHAIN_ID } from '@/constants/chain';
import { DEFAULT_HISTORY_PAGE_SIZE, HISTORY_RANGE, HISTORY_TYPE } from '@/constants/history';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { IFundingHistory, IGraphPairBasicInfo, ILiquidityHistory, ITransferHistory } from '@/types/graph';

import { DEFAULT_DECIMALS } from '@/constants/global';
import { TokenInfoMap } from '@/types/token';
import { Context } from '@derivation-tech/context';
import { Side } from '@synfutures/sdks-perp';
import {
  AccountBalanceHistory,
  OrderHistory,
  OrderStatus,
  VirtualTradeHistory,
} from '@synfutures/sdks-perp-datasource';
import { formatEther } from './numberUtil';
import { retryGeneralPromise } from './retry';
import { fixBalanceNumberDecimalsTo18 } from './token';
import { getPairId } from './transform/transformId';

export function getStartEndTimeByRangeType(rangeType: HISTORY_RANGE): { startTime: number; endTime: number } {
  const utcNow = moment.utc();
  const endTime = utcNow.unix();
  if (rangeType === HISTORY_RANGE.D_1) {
    const startTime = utcNow.add(-1, 'd').unix();
    return { startTime, endTime };
  } else if (rangeType === HISTORY_RANGE.D_7) {
    const startTime = utcNow.add(-7, 'd').unix();
    return { startTime, endTime };
  } else if (rangeType === HISTORY_RANGE.M_1) {
    const startTime = utcNow.add(-1, 'month').unix();
    return { startTime, endTime };
  } else if (rangeType === HISTORY_RANGE.M_3) {
    const startTime = utcNow.add(-3, 'month').unix();
    return { startTime, endTime };
  }

  const startTime = 0;
  return { startTime, endTime };
}

export const getOrdersHistoryFromSDK = async ({
  chainId,
  userAddr,
  instrumentAddr,
  expiry,
  timeRange,
  page,
  pageSize = DEFAULT_HISTORY_PAGE_SIZE,
  requiredAllData = false,
  requiredOpenDataOnly = false,
  sdk,
}: {
  isPolling?: boolean;
  chainId: CHAIN_ID;
  userAddr: string;
  instrumentAddr?: string;
  expiry?: number;
  timeRange: HISTORY_RANGE;
  page?: number;
  pageSize?: number;
  requiredAllData?: boolean;
  requiredOpenDataOnly?: boolean;
  sdk: Context;
}): Promise<OrderHistory[] | undefined> => {
  const { startTime, endTime } = getStartEndTimeByRangeType(timeRange);
  let orderHistoryList = await retryGeneralPromise(
    sdk.perpDataSource.history.getOrderHistory({
      instrumentAddr: instrumentAddr,
      expiry,
      traders: [userAddr],
      startTs: startTime,
      endTs: endTime,
      page,
      size: requiredAllData ? undefined : pageSize,
    }),
  );
  if (orderHistoryList) {
    if (requiredOpenDataOnly) {
      orderHistoryList = orderHistoryList.filter((o) => o.status == OrderStatus.OPEN);
    } else {
      orderHistoryList = orderHistoryList.filter((o) => o.status !== OrderStatus.OPEN);
    }
  }
  console.record('graph', `Query [getOrderHistory]`, orderHistoryList, {
    chainId,
    userAddr,
  });
  return _.orderBy(
    orderHistoryList.map((o) => ({ ...o, logIndex: o.fillTxLogIndex || o.cancelTxLogIndex || o.placeTxLogIndex })),
    ['createdTimestamp'],
    ['desc'],
  );
};

type TtransformHistoryDataToCsvData = { pairBasicInfos: { [pairId: string]: IGraphPairBasicInfo } | undefined } & (
  | {
      type: HISTORY_TYPE.TRADE;
      data: VirtualTradeHistory[];
    }
  | {
      type: HISTORY_TYPE.ORDERS;
      data: OrderHistory[];
    }
  | {
      type: HISTORY_TYPE.LIQUIDITY;
      data: ILiquidityHistory[];
    }
  | {
      type: HISTORY_TYPE.FUNDING;
      data: IFundingHistory[];
    }
  | {
      type: HISTORY_TYPE.TRANSFERS;
      data: ITransferHistory[];
    }
  | {
      type: HISTORY_TYPE.ACCOUNT;
      data: AccountBalanceHistory[];
      marginTokenMap: TokenInfoMap | undefined;
    }
);

export const getSymbolAndTimeAndPair = (
  item: { instrumentAddr: string; expiry: number; timestamp: number },
  pairBasicInfos:
    | {
        [pairId: string]: IGraphPairBasicInfo;
      }
    | undefined,
) => {
  const pair = _.get(pairBasicInfos, [getPairId(item.instrumentAddr, item.expiry)]);

  return {
    pair,
    symbolAndTime: {
      time: new Date(item.timestamp * 1000).toLocaleString('en-GB'),
      'pair symbol': pair?.symbol,
      'base symbol': pair?.rootInstrument.baseToken.symbol,
      'quote symbol': pair?.rootInstrument.quoteToken.symbol,
    },
  };
};
export const transformHistoryDataToCsvData = (props: TtransformHistoryDataToCsvData): object[] => {
  if (props.type === HISTORY_TYPE.TRADE) {
    const { data, pairBasicInfos } = props;
    return data.map((item) => {
      const { symbolAndTime } = getSymbolAndTimeAndPair(item, pairBasicInfos);
      // const side = getAdjustTradeSide(item.size.gte(0) ? Side.LONG : Side.SHORT, pair?.isInverse || false, {
      //   fee: item.fee,
      //   type: item.type,
      // });
      const side = item.side;
      return {
        ...symbolAndTime,
        'tx hash': item.txHash,
        side: {
          [Side.LONG]: 'LONG',
          [Side.SHORT]: 'SHORT',
          [Side.FLAT]: 'FLAT',
        }[side],
        size: formatEther(item.size.abs()),
        price: formatEther(item.price),
        'trade value': formatEther(item.tradeValue.abs()),
        fee: formatEther(item.fee),
        type: item.type,
      };
    });
  }
  if (props.type === HISTORY_TYPE.ORDERS) {
    const { data, pairBasicInfos } = props;
    return data.map((item) => {
      const { symbolAndTime } = getSymbolAndTimeAndPair(item, pairBasicInfos);
      // const side = getAdjustTradeSide(item.size.gte(0) ? Side.LONG : Side.SHORT, pair?.isInverse || false);
      const side = item.side;
      // const oPrice = item.status === OrderStatus.CANCELLED ? TickMath.getWadAtTick(item.tick) : item.price;
      const oPrice = item.price;
      return {
        'tx hash': item.placeTxHash,
        ...symbolAndTime,
        side: {
          [Side.LONG]: 'LONG',
          [Side.SHORT]: 'SHORT',
          [Side.FLAT]: 'FLAT',
        }[side],
        size: formatEther(item.size.abs()),
        'filled size': formatEther(item.filledSize.abs()),
        'order price': formatEther(oPrice),
        'fee rebate': formatEther(item.fee),
        'trade value': WrappedBigNumber.from(item.tradeValue)?.stringValue,
        status: item.status,
      };
    });
  }
  if (props.type === HISTORY_TYPE.LIQUIDITY) {
    const { data, pairBasicInfos } = props;
    return data.flatMap((item) => {
      if (item.instrumentAddr && item.expiry !== undefined) {
        const { symbolAndTime } = getSymbolAndTimeAndPair(
          item as { instrumentAddr: string; expiry: number; timestamp: number },
          pairBasicInfos,
        );
        return [
          {
            'tx hash': item.txHash,
            ...symbolAndTime,
            type: item.type,
            'fair price': WrappedBigNumber.from(item.fairPrice).formatPriceString(),
            'upper price': formatEther(item.upperPrice.abs()),
            'lower price': formatEther(item.lowerPrice.abs()),
            amount: formatEther(item.amount.abs()),
            'fees earned': formatEther((item.feeEarned || BigNumber.from(0)).abs()),
          },
        ];
      }
      return [];
    });
  }
  if (props.type === HISTORY_TYPE.FUNDING) {
    const { data, pairBasicInfos } = props;
    return data.flatMap((item) => {
      if (item.instrumentAddr && item.expiry !== undefined) {
        const { symbolAndTime } = getSymbolAndTimeAndPair(
          item as { instrumentAddr: string; expiry: number; timestamp: number },
          pairBasicInfos,
        );
        return [
          {
            'tx hash': item.txHash,
            ...symbolAndTime,
            action: item.type,
            amount: formatEther(item.funding.abs()),
          },
        ];
      }
      return [];
    });
  }
  if (props.type === HISTORY_TYPE.TRANSFERS) {
    const { data, pairBasicInfos } = props;
    const result = data.flatMap((item) => {
      if (item.instrumentAddr && item.expiry !== undefined) {
        const { symbolAndTime, pair } = getSymbolAndTimeAndPair(
          item as { instrumentAddr: string; expiry: number; timestamp: number },
          pairBasicInfos,
        );
        return [
          {
            'tx hash': item.txHash,
            ...symbolAndTime,
            direction: item.isTransferIn ? 'Transfer In' : 'Transfer Out',
            amount: WrappedBigNumber.from(
              fixBalanceNumberDecimalsTo18(item.amount, pair?.rootInstrument?.quoteToken.decimals || DEFAULT_DECIMALS),
            ).abs().stringValue,
          },
        ];
      }

      return [];
    });

    return result;
  }
  if (props.type === HISTORY_TYPE.ACCOUNT) {
    const { data } = props;
    console.log(`account history data`, data);

    return data.map((item) => {
      return {
        time: item.timestamp ? new Date(item.timestamp * 1000).toLocaleString('en-GB') : item.timestamp,
        'tx hash': item.txHash,
        account: props.marginTokenMap?.[item.quoteAddr]?.symbol,
        type: item.type,
        amount: WrappedBigNumber.from(
          fixBalanceNumberDecimalsTo18(
            item.amount,
            props.marginTokenMap?.[item.quoteAddr]?.decimals || DEFAULT_DECIMALS,
          ),
        )?.stringValue,
      };
    });
  }
  return [];
};
