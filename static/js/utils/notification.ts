import { Side, TickMath, wdiv } from '@synfutures/sdks-perp';
import { BigNumber } from 'ethers';

import { EVENT_NAMES } from '@/constants/event';
import { OPERATION_TX_TYPE, TX_TRANSFORM_TARGET } from '@/constants/tx';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { IEventSource, IParsedEventLog, IParsedTemplate } from '@/types/transaction';

import SentryService from '@/entities/SentryService';
import _ from 'lodash';
import { getAdjustTradePrice, getAdjustTradeSize } from './pairs';
import { fixBalanceNumberDecimalsTo18 } from './token';

export function parseTxEventLog({
  eventSource,
  instrument,
}: {
  eventSource: IEventSource;
  instrument: {
    quoteSymbol: string;
    baseSymbol: string;
    isInverse: boolean;
    quoteDecimal?: number;
    baseDecimal?: number;
  };
  transformTarget?: TX_TRANSFORM_TARGET;
}): IParsedEventLog {
  const args = eventSource.args;
  // const expiry = BigNumber.from(args?.expiry || 0);
  const result: IParsedEventLog = { eventSource: eventSource, descTemplate: '', templateArgs: {} };
  const baseSymbol = instrument.baseSymbol;
  const quoteSymbol = instrument.quoteSymbol;
  const isInverse = instrument.isInverse;
  try {
    if (eventSource.txType === OPERATION_TX_TYPE.SWAP) {
      if (eventSource.eventName === EVENT_NAMES.OrderHistory) {
        //   fromToken: string;
        // toToken: string;
        // sender: string;
        // fromAmount: BigNumber;
        // returnAmount: BigNumber;
        const amount = WrappedBigNumber.from(
          fixBalanceNumberDecimalsTo18(BigNumber.from(args?.fromAmount || 0), instrument.quoteDecimal || 18),
        );
        const toSize = WrappedBigNumber.from(
          fixBalanceNumberDecimalsTo18(BigNumber.from(args?.returnAmount || 0), instrument.baseDecimal || 18),
        );
        result.descTemplate = 'notification.swap.successDesc';
        result.templateArgs = {
          fromSize: amount.abs().formatDisplayNumber(),
          fromSymbol: instrument.quoteSymbol,
          returnSymbol: instrument.baseSymbol,
          toSize: toSize.abs().formatDisplayNumber(),
        };
      }
    } else if (eventSource.txType === OPERATION_TX_TYPE.NATIVE_SWAP) {
      if (eventSource.eventName === EVENT_NAMES.Withdrawal || eventSource.eventName === EVENT_NAMES.Deposit) {
        const amount = WrappedBigNumber.from(
          fixBalanceNumberDecimalsTo18(BigNumber.from(args?.wad), instrument.quoteDecimal || 18),
        );
        result.descTemplate = 'notification.swap.successDesc';
        result.templateArgs = {
          fromSize: amount.formatDisplayNumber(),
          toSize: amount.formatDisplayNumber(),
          fromSymbol: instrument.quoteSymbol,
          returnSymbol: instrument.baseSymbol,
        };
      }
    } else {
      if (eventSource.eventName === EVENT_NAMES.Deposit || eventSource.eventName === EVENT_NAMES.Withdraw) {
        const amount = WrappedBigNumber.from(
          fixBalanceNumberDecimalsTo18(BigNumber.from(args?.quantity || args?.amount), instrument.quoteDecimal || 18),
        );
        result.descTemplate =
          eventSource.eventName === EVENT_NAMES.Deposit
            ? 'notification.deposit.successDesc'
            : 'notification.withdraw.successDesc';
        result.templateArgs = {
          quantity: amount.formatDisplayNumber(),
          quote: quoteSymbol,
        };
      }
      if (eventSource.eventName === EVENT_NAMES.Trade) {
        const takeSize = getAdjustTradeSize(BigNumber.from(args?.size), isInverse);
        const tradePriceB = wdiv(BigNumber.from(args?.entryNotional), BigNumber.from(args?.size).abs());
        const price = getAdjustTradePrice(WrappedBigNumber.from(tradePriceB), isInverse);

        const tradeType = takeSize.gt(0) ? 'common.bought' : 'common.sold';
        result.descTemplate = `notification.trade.successDesc`;
        result.templateArgs = {
          base: baseSymbol || '',
          size: takeSize.abs().formatDisplayNumber(),
          tradeType: tradeType,
          limitPrice: price.abs().formatDisplayNumber({ type: 'price' }),
        };
      }
      if (eventSource.eventName === EVENT_NAMES.Adjust) {
        const amount = WrappedBigNumber.from(BigNumber.from(args?.net));
        console.log('🚀 ~ file: notification.ts:56 ~ amount:', amount);
        const type = amount.gt(0) ? 'common.toppedUp' : 'common.reduced';
        result.descTemplate = 'notification.adjustMargin.successDesc';
        result.templateArgs = {
          type: type,
          amount: amount.abs().formatDisplayNumber(),
          quote: quoteSymbol,
        };
      }
      if (eventSource.eventName === EVENT_NAMES.Place) {
        const tickPrice = getAdjustTradePrice(TickMath.getWadAtTick(Number(args?.tick)), isInverse);
        const size = getAdjustTradeSize(BigNumber.from(args?.order?.size), isInverse);
        result.descTemplate = 'notification.placeOrder.successDesc';
        const tradeType = size.gt(0) ? 'common.buy' : 'common.sell';
        result.templateArgs = {
          tickPrice: tickPrice.formatDisplayNumber({ type: 'price' }),
          size: size.abs().formatDisplayNumber(),
          base: baseSymbol,
          tradeType: tradeType,
        };
      }
      if (eventSource.eventName === EVENT_NAMES.Cancel) {
        const tickPrice = getAdjustTradePrice(TickMath.getWadAtTick(Number(args?.tick)), isInverse);
        result.descTemplate = 'notification.cancelOrder.successDesc';
        result.templateArgs = {
          tickPrice: tickPrice.formatDisplayNumber({ type: 'price' }),
        };
      }
      if (eventSource.eventName === EVENT_NAMES.Fill) {
        //  expiry: number;
        //  trader: string;
        //  tick: number;
        //  nonce: number;
        //  fee: BigNumber;
        //  pic: PositionCacheStructOutput;
        //  operator: string;
        //  tip: BigNumber;
        console.log('notification event [Fill] args:', args);
        const tickPrice = getAdjustTradePrice(TickMath.getWadAtTick(Number(args?.tick)), isInverse);
        const size = getAdjustTradeSize(BigNumber.from(args?.pic?.size), isInverse);
        const tradeType = size.gt(0) ? 'common.bought' : 'common.sold';
        result.descTemplate = 'notification.fillOrder.successDesc';
        result.templateArgs = {
          tickPrice: tickPrice.formatDisplayNumber({ type: 'price' }),
          size: size.abs().formatDisplayNumber(),
          tradeType,
          base: baseSymbol,
        };
      }
      if (eventSource.eventName === EVENT_NAMES.Settle) {
        const balance = WrappedBigNumber.from(BigNumber.from(args?.balance));
        result.descTemplate = 'notification.settle.successDesc';
        result.templateArgs = {
          balance: balance.formatDisplayNumber(),
          quote: quoteSymbol,
        };
      }
      if (eventSource.eventName === EVENT_NAMES.Add) {
        const rangeBalance = WrappedBigNumber.from(BigNumber.from(args?.range?.balance));
        const upperPrice = getAdjustTradePrice(
          TickMath.getWadAtTick(Number(args?.tickUpper)),
          isInverse,
        ).formatDisplayNumber({ type: 'price' });
        const lowerPrice = getAdjustTradePrice(
          TickMath.getWadAtTick(Number(args?.tickLower)),
          isInverse,
        ).formatDisplayNumber({ type: 'price' });
        result.descTemplate = 'notification.addLiquidity.successDesc';
        result.templateArgs = {
          rangeBalance: rangeBalance.formatDisplayNumber(),
          quote: quoteSymbol,
          tickLowerPrice: isInverse ? upperPrice : lowerPrice,
          tickUpperPrice: isInverse ? lowerPrice : upperPrice,
        };
      }
      if (eventSource.eventName === EVENT_NAMES.Remove) {
        const picBalance = WrappedBigNumber.from(BigNumber.from(args?.pic?.balance));
        const upperPrice = getAdjustTradePrice(
          TickMath.getWadAtTick(Number(args?.tickUpper)),
          isInverse,
        ).formatDisplayNumber({ type: 'price' });
        const lowerPrice = getAdjustTradePrice(
          TickMath.getWadAtTick(Number(args?.tickLower)),
          isInverse,
        ).formatDisplayNumber({ type: 'price' });
        result.descTemplate = 'notification.removeLiquidity.successDesc';
        result.templateArgs = {
          picBalance: picBalance.formatDisplayNumber(),
          quote: quoteSymbol,
          tickLowerPrice: isInverse ? upperPrice : lowerPrice,
          tickUpperPrice: isInverse ? lowerPrice : upperPrice,
        };
      }
      // vault deposit
      if (eventSource.eventName === EVENT_NAMES.VaultDeposit) {
        // user: string;native: boolean;quantity: BigNumber;
        const amount = WrappedBigNumber.from(
          fixBalanceNumberDecimalsTo18(
            BigNumber.from(args?.quantity || args?.amount || 0),
            instrument.quoteDecimal || 18,
          ),
        );
        result.descTemplate = 'notification.vaultDeposit.successDesc';
        result.templateArgs = {
          quantity: amount.abs().formatDisplayNumber(),
          quote: quoteSymbol,
        };
      }
      // vault   withdraw
      if (eventSource.eventName === EVENT_NAMES.VaultWithdraw) {
        //// user: string;native: boolean;quantity: BigNumber;
        const amount = WrappedBigNumber.from(
          fixBalanceNumberDecimalsTo18(
            BigNumber.from(args?.quantity || args?.amount || 0),
            instrument.quoteDecimal || 18,
          ),
        );
        result.descTemplate = 'notification.vaultWithdraw.successDesc';
        result.templateArgs = {
          quantity: amount.abs().formatDisplayNumber(),
          quote: quoteSymbol,
        };
      }

      // aggregator   swap
    }
  } catch (error) {
    SentryService.captureException(error, {
      name: `function:parseTxEventLog`,
      instrument,
      eventSource: _.omit(eventSource, ['args']),
      args: JSON.stringify(args),
    });
    console.error(error);
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseSendingTxMessageMapping: { [type in OPERATION_TX_TYPE]?: (...args: any) => IParsedTemplate } = {
  [OPERATION_TX_TYPE.REFERRAL_AFFILIATES_CLAIM]: (totalUSD?: WrappedBigNumber): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    result.descTemplate = 'notification.referralAffiliatesClaim.infoDesc';
    result.templateArgs = {
      amount: totalUSD?.formatDisplayNumber() || '',
    };
    return result;
  },
  [OPERATION_TX_TYPE.REFERRAL_TRADER_CLAIM]: (totalUSD?: WrappedBigNumber): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    result.descTemplate = 'notification.referralTraderClaim.infoDesc';
    result.templateArgs = {
      amount: totalUSD?.formatDisplayNumber() || '',
    };
    return result;
  },
  [OPERATION_TX_TYPE.SWAP]: (
    amount: WrappedBigNumber,
    buySymbol: string,
    sellSymbol: string,
    toSize: WrappedBigNumber,
  ): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    result.descTemplate = 'notification.swap.infoDesc';
    result.templateArgs = {
      fromSize: amount?.formatDisplayNumber() || '',
      fromSymbol: sellSymbol,
      returnSymbol: buySymbol,
      toSize: toSize?.formatDisplayNumber() || '',
    };
    return result;
  },
  [OPERATION_TX_TYPE.DEPOSIT]: (amount: WrappedBigNumber, quoteSymbol: string): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    result.descTemplate = 'notification.deposit.infoDesc';
    result.templateArgs = {
      quantity: amount?.formatDisplayNumber() || '',
      quote: quoteSymbol,
    };
    return result;
  },
  [OPERATION_TX_TYPE.WITHDRAW]: (amount: WrappedBigNumber, quoteSymbol: string): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    result.descTemplate = 'notification.withdraw.infoDesc';
    result.templateArgs = {
      quantity: amount?.formatDisplayNumber() || '',
      quote: quoteSymbol,
    };
    return result;
  },
  [OPERATION_TX_TYPE.TRADE]: (
    baseAmount: BigNumber,
    side: Side,
    tradePrice: WrappedBigNumber,
    baseSymbol: string,
    isInverse: boolean,
  ): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    const takeSize = getAdjustTradeSize(baseAmount, isInverse);
    // const tradePrice = getAdjustTradePrice(sqrtX96ToWad(BigNumber.from(args?.sqrtPX96)), isInverse);
    const tradeType = side === Side.LONG ? 'common.buying' : 'common.selling';
    result.descTemplate = `notification.trade.infoDesc`;
    result.templateArgs = {
      base: baseSymbol || '',
      size: takeSize.abs().formatDisplayNumber(),
      tradeType: tradeType,
      limitPrice: tradePrice.formatDisplayNumber({ type: 'price' }),
    };
    return result;
  },
  [OPERATION_TX_TYPE.ADJUST_MARGIN]: (amount: BigNumber, transferIn: boolean, quoteSymbol: string): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    const type = transferIn ? 'common.toppingUp' : 'common.reducing';
    result.descTemplate = 'notification.adjustMargin.infoDesc';
    result.templateArgs = {
      type: type,
      amount: WrappedBigNumber.from(amount).abs().formatDisplayNumber(),
      quote: quoteSymbol,
    };
    return result;
  },
  [OPERATION_TX_TYPE.PLACE_ORDER]: (
    baseSymbol: string,
    tickNumber: number,
    baseSize: BigNumber,
    isInverse: boolean,
    side: Side,
  ): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    const tickPrice = getAdjustTradePrice(TickMath.getWadAtTick(tickNumber), isInverse);
    const size = getAdjustTradeSize(baseSize, isInverse);
    const tradeType = side === Side.LONG ? 'common.buy' : 'common.sell';
    result.descTemplate = 'notification.placeOrder.infoDesc';
    result.templateArgs = {
      tickPrice: tickPrice.formatDisplayNumber({ type: 'price' }),
      size: size.abs().formatDisplayNumber(),
      base: baseSymbol,
      tradeType: tradeType,
    };
    return result;
  },
  [OPERATION_TX_TYPE.CANCEL_ORDER]: (tickNumber: number, isInverse: boolean): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    const tickPrice = getAdjustTradePrice(TickMath.getWadAtTick(tickNumber), isInverse);
    result.descTemplate = 'notification.cancelOrder.infoDesc';
    result.templateArgs = {
      tickPrice: tickPrice.formatDisplayNumber({ type: 'price' }),
    };
    return result;
  },
  [OPERATION_TX_TYPE.FILL_ORDER]: (tickNumber: number, isInverse: boolean): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    const tickPrice = getAdjustTradePrice(TickMath.getWadAtTick(tickNumber), isInverse);
    result.descTemplate = 'notification.fillOrder.infoDesc';
    result.templateArgs = {
      tickPrice: tickPrice.formatDisplayNumber({ type: 'price' }),
    };
    return result;
  },
  [OPERATION_TX_TYPE.SETTLE]: (): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    result.descTemplate = 'notification.settle.infoDesc';
    result.templateArgs = {};
    return result;
  },
  [OPERATION_TX_TYPE.ADD_LIQUIDITY]: (
    quoteSymbol: string,
    balance: string,
    upperPrice: WrappedBigNumber,
    lowerPrice: WrappedBigNumber,
  ): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    const rangeBalance = WrappedBigNumber.from(balance);
    const adjustUpperPrice = upperPrice.formatDisplayNumber({
      type: 'price',
    });
    const adjustLowerPrice = lowerPrice.formatDisplayNumber({
      type: 'price',
    });
    result.descTemplate = 'notification.addLiquidity.infoDesc';
    result.templateArgs = {
      rangeBalance: rangeBalance.formatDisplayNumber(),
      quote: quoteSymbol,
      tickLowerPrice: adjustLowerPrice,
      tickUpperPrice: adjustUpperPrice,
    };
    return result;
  },
  [OPERATION_TX_TYPE.REMOVE_LIQUIDITY]: (
    quoteSymbol: string,
    balance: BigNumber,
    upperPrice: WrappedBigNumber,
    lowerPrice: WrappedBigNumber,
  ): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    const picBalance = WrappedBigNumber.from(balance);
    const adjustUpperPrice = upperPrice.formatDisplayNumber({
      type: 'price',
    });
    const adjustLowerPrice = lowerPrice.formatDisplayNumber({
      type: 'price',
    });
    result.descTemplate = 'notification.removeLiquidity.infoDesc';
    result.templateArgs = {
      picBalance: picBalance.formatDisplayNumber(),
      quote: quoteSymbol,
      tickLowerPrice: adjustLowerPrice,
      tickUpperPrice: adjustUpperPrice,
    };
    return result;
  },
  [OPERATION_TX_TYPE.CLAIM_WITHDRAW]: (amount: WrappedBigNumber, quoteSymbol: string): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    result.descTemplate = 'notification.claimWithdraw.infoDesc';
    result.templateArgs = {
      quantity: amount?.formatDisplayNumber() || '',
      quote: quoteSymbol,
    };
    return result;
  },
  [OPERATION_TX_TYPE.CLAIM_OO_TOKEN]: (amount: WrappedBigNumber): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    result.descTemplate = 'notification.claimOOToken.infoDesc';
    result.templateArgs = {
      amount: amount.formatNormalNumberString(2),
    };
    return result;
  },
  [OPERATION_TX_TYPE.BATCH_PLACE_SCALED_ORDER]: (
    baseSymbol: string,
    upperPriceO: string,
    lowerPriceO: string,
    baseSize: BigNumber,
    isInverse: boolean,
    side: Side,
    orderCount: number,
  ): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    let upperPrice = WrappedBigNumber.from(upperPriceO);
    let lowerPrice = WrappedBigNumber.from(lowerPriceO);
    if (upperPrice.lt(lowerPrice)) {
      [upperPrice, lowerPrice] = [lowerPrice, upperPrice];
    }
    const size = WrappedBigNumber.from(baseSize);
    const tradeType = side === Side.LONG ? 'common.buy' : 'common.sell';
    result.descTemplate = 'notification.placeScaledOrder.infoDesc';
    result.templateArgs = {
      tickPrice: upperPrice.formatDisplayNumber({ type: 'price' }),
      size: size.abs().formatDisplayNumber(),
      base: baseSymbol,
      tradeType: tradeType,
      lowerPrice: lowerPrice.formatPriceString(),
      upperPrice: upperPrice.formatPriceString(),
      orderCount: orderCount.toString(),
    };
    return result;
  },
  [OPERATION_TX_TYPE.PLACE_CROSS_MARKET_ORDER]: (
    baseSymbol: string,
    tradePrice: WrappedBigNumber,
    baseSize: WrappedBigNumber,
    isInverse: boolean,
    side: Side,
  ): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    const tickPrice = tradePrice;
    const size = WrappedBigNumber.from(baseSize);
    const tradeType = side === Side.LONG ? 'common.buy' : 'common.sell';
    result.descTemplate = 'notification.placeCrossMarketOrder.infoDesc';
    result.templateArgs = {
      tickPrice: tickPrice.formatDisplayNumber({ type: 'price' }),
      size: size.abs().formatDisplayNumber(),
      base: baseSymbol,
      tradeType: tradeType,
    };
    return result;
  },
  [OPERATION_TX_TYPE.VAULT_DEPOSIT]: (amount: WrappedBigNumber, quoteSymbol: string): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    result.descTemplate = 'notification.vaultDeposit.infoDesc';
    result.templateArgs = {
      quantity: amount?.formatDisplayNumber() || '',
      quote: quoteSymbol,
    };
    return result;
  },
  [OPERATION_TX_TYPE.VAULT_WITHDRAW]: (amount: WrappedBigNumber, quoteSymbol: string): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    result.descTemplate = 'notification.vaultWithdraw.infoDesc';
    result.templateArgs = {
      quantity: amount?.formatDisplayNumber() || '',
      quote: quoteSymbol,
    };
    return result;
  },
  [OPERATION_TX_TYPE.VAULT_CLAIM]: (amount: WrappedBigNumber, quoteSymbol: string): IParsedTemplate => {
    const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
    result.descTemplate = 'notification.claimVaultWithdraw.infoDesc';
    result.templateArgs = {
      quantity: amount?.formatDisplayNumber() || '',
      quote: quoteSymbol,
    };
    return result;
  },
};

export function mapObjectValue(
  obj: { [key: string]: string },
  objValueType: string,
  mappingFn: (val: string) => string,
): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (typeof val === objValueType) {
      result[key] = mappingFn(val);
    }
  });
  return result;
}
