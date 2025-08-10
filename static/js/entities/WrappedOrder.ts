import { BlockInfo, CHAIN_ID } from '@derivation-tech/context';
import { BigNumber } from 'ethers';
import _ from 'lodash';

import { PAIR_RATIO_BASE } from '@/constants/global';
import { IMetaOrder } from '@/types/account';
import { bigNumberObjectCheck } from '@/utils';

import { calcQuoteSizeByBase, calcTradeValue } from '@/utils/trade';
import { Order as OrderInterface, Side, utils } from '@synfutures/sdks-perp';
import { WrappedBigNumber } from './WrappedBigNumber';
import { WrappedInstrument } from './WrappedInstrument';
import { WrappedPair } from './WrappedPair';
import { WrappedPortfolio } from './WrappedPortfolio';

export class WrappedOrder implements OrderInterface {
  // basic fields
  balance: BigNumber;
  size: BigNumber;
  taken: BigNumber;
  tick: number;
  nonce: number;
  // redundant fields
  instrumentAddr: string;
  expiry: number;
  traderAddr: string;

  // additional fields
  oid: number;
  side: Side;
  limitPrice: BigNumber;

  blockInfo?: BlockInfo;
  static instances: { [chainId: number]: { [orderId: string]: WrappedOrder } } = {}; // chainId -> orderId -> WrappedOrder
  createTimestamp: number | undefined;
  rootPortfolio: WrappedPortfolio;
  metaOrder: IMetaOrder;
  rootPair: WrappedPair;
  constructor(metaOrder: IMetaOrder, rootPortfolio: WrappedPortfolio) {
    this.balance = metaOrder.balance;
    this.size = metaOrder.size;
    this.taken = metaOrder.taken;
    this.tick = metaOrder.tick;
    this.nonce = metaOrder.nonce;
    this.instrumentAddr = metaOrder.instrumentAddr;
    this.expiry = metaOrder.expiry;
    this.traderAddr = metaOrder.traderAddr;
    this.oid = metaOrder.oid;
    this.side = metaOrder.side;
    this.limitPrice = metaOrder.limitPrice;
    this.blockInfo = metaOrder.blockInfo;

    this.metaOrder = metaOrder;
    this.rootPortfolio = rootPortfolio;
    this.rootPair = rootPortfolio.rootPair;
  }

  static getInstance(orderId: string, chainId: CHAIN_ID | undefined): WrappedOrder | undefined {
    return orderId && chainId ? _.get(WrappedOrder.instances, [chainId, orderId]) : undefined;
  }

  static wrapInstance({
    metaOrder,
    rootPortfolio,
  }: {
    metaOrder: IMetaOrder;
    rootPortfolio: WrappedPortfolio;
  }): WrappedOrder {
    let instance = WrappedOrder.getInstance(metaOrder.id, rootPortfolio.rootPair.chainId);
    if (instance) {
      instance.fillField(bigNumberObjectCheck(metaOrder));
    } else {
      instance = new WrappedOrder(bigNumberObjectCheck(metaOrder), rootPortfolio);
      _.set(WrappedOrder.instances, [rootPortfolio.rootPair.chainId, metaOrder.id], instance);
    }
    return instance;
  }

  static getInstanceMap(chainId: CHAIN_ID | undefined): { [orderId: string]: WrappedOrder } | undefined {
    return chainId ? _.get(WrappedOrder.instances, [chainId], undefined) : undefined;
  }

  setMetaData(metaOrder: IMetaOrder): void {
    this.balance = metaOrder.balance;
    this.size = metaOrder.size;
    this.taken = metaOrder.taken;
    this.tick = metaOrder.tick;
    this.nonce = metaOrder.nonce;
    this.instrumentAddr = metaOrder.instrumentAddr;
    this.expiry = metaOrder.expiry;
    this.traderAddr = metaOrder.traderAddr;
    this.oid = metaOrder.oid;
    this.side = metaOrder.side;
    this.limitPrice = metaOrder.limitPrice;
  }
  setCreateTimestamp(createTimestamp: number): void {
    this.createTimestamp = createTimestamp;
  }

  fillField(partialOrder: Partial<IMetaOrder>): void {
    const order = _.merge({}, this.metaOrder, bigNumberObjectCheck(partialOrder));
    this.metaOrder = order;
    this.setMetaData(order);
  }
  wrapAttribute(prop: keyof WrappedOrder): WrappedBigNumber {
    if (BigNumber.isBigNumber(this[prop])) {
      let bn = WrappedBigNumber.from(this[prop] as BigNumber);
      if (this.rootInstrument.isInverse) {
        if (['size'].includes(prop)) {
          // bn = bn.mul(-1);
        }
        if (['limitPrice'].includes(prop)) {
          // bn = getAdjustTradePrice(bn, this.rootPair.isInverse);
        }
      }
      if (['taken'].includes(prop)) {
        // taken should not be larger than size
        if (bn.abs().gt(this.wrapAttribute('size').abs())) {
          bn = this.wrapAttribute('size');
        }
      }
      return bn;
    } else if (typeof this[prop] === 'string' || typeof this[prop] === 'number') {
      return WrappedBigNumber.from(this[prop] as unknown as string | number);
    }
    return WrappedBigNumber.ZERO;
  }

  /**
   * @returns {string} order id in the format of `${userAddr}-${instrumentAddr}-${expiry}-${tick}-${nonce}`
   */
  get id(): string {
    return this.metaOrder.id.toLowerCase();
  }
  getInstrumentAddrTickSizeId(): string {
    return `${this.rootInstrument.id}_${this.tick}_${this.size.abs().toString()}`.toLowerCase();
  }

  get rootInstrument(): WrappedInstrument {
    return this.rootPair.rootInstrument;
  }

  get wrappedSide(): Side {
    return this.side;
  }
  get tradeValue(): WrappedBigNumber {
    return calcTradeValue(this.size, this.limitPrice, this.isInverse);
  }
  get rebateFee(): WrappedBigNumber {
    return this.tradeValue.mul(this.rootInstrument.setting.quoteParam.tradingFeeRatio).div(PAIR_RATIO_BASE);
  }

  get leverageWad(): BigNumber {
    return utils.orderLeverage(this, this.rootPair);
  }

  get wrappedQuoteSize(): WrappedBigNumber {
    return calcQuoteSizeByBase(this.size, this.limitPrice, this.isInverse);
  }

  get wrappedFilledSize(): WrappedBigNumber {
    return calcQuoteSizeByBase(this.taken, this.limitPrice, this.isInverse);
  }

  get isInverse(): boolean {
    return this.rootInstrument.isInverse;
  }

  toJSON(): IMetaOrder {
    return this.metaOrder;
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
