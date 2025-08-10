import { BlockInfo, CHAIN_ID } from '@derivation-tech/context';
import _ from 'lodash';

import { IMetaPortfolio } from '@/types/account';
import { bigNumberObjectCheck } from '@/utils';
import { getAccountId, getPortfolioId } from '@/utils/transform/transformId';

import { WrappedAccount } from './WrappedAccount';
import { WrappedInstrument } from './WrappedInstrument';
import { WrappedOrder } from './WrappedOrder';
import { WrappedPair } from './WrappedPair';
import { WrappedPosition } from './WrappedPosition';
import { WrappedRange } from './WrappedRange';

import { getEmptySDKPosition } from '@/utils/portfolio';
import {
  Order as OrderInterface,
  Portfolio as PortfolioInterface,
  Position as PositionInterface,
  Range as RangeInterface,
} from '@synfutures/sdks-perp';

export class WrappedPortfolio implements PortfolioInterface {
  instrumentAddr: string;
  expiry: number;
  traderAddr: string;
  isEmpty: boolean;

  // oid->order
  orders: Map<number, OrderInterface>;
  // rid->range
  ranges: Map<number, RangeInterface>;
  position: PositionInterface;

  blockInfo?: BlockInfo;

  static instances: { [chainId: number]: { [portfolioId: string]: WrappedPortfolio } } = {}; // chainId -> portfolioId -> WrappedPortfolio
  rootPair: WrappedPair;
  rootAccount: WrappedAccount;
  positionMap: Record<string, WrappedPosition> = {};
  orderMap: Record<string, WrappedOrder> = {};
  rangeMap: Record<string, WrappedRange> = {};
  metaPortfolio: IMetaPortfolio;
  constructor(metaPortfolio: IMetaPortfolio, rootPair: WrappedPair, rootAccount: WrappedAccount) {
    this.instrumentAddr = metaPortfolio.instrumentAddr;
    this.expiry = metaPortfolio.expiry;
    this.traderAddr = metaPortfolio.traderAddr;
    this.orders = new Map();
    metaPortfolio.orders.forEach((order, key) => {
      this.orders.set(key, bigNumberObjectCheck(order));
    });
    this.ranges = new Map();
    metaPortfolio.ranges.forEach((range, key) => {
      this.ranges.set(key, bigNumberObjectCheck(range));
    });

    this.position = metaPortfolio.position;
    this.isEmpty = metaPortfolio.isEmpty;
    this.blockInfo = metaPortfolio.blockInfo;

    this.metaPortfolio = metaPortfolio;
    this.rootPair = rootPair;
    this.rootAccount = rootAccount;
  }

  static getInstance(portfolioId: string, chainId: CHAIN_ID | undefined): WrappedPortfolio | undefined {
    return portfolioId && chainId ? _.get(WrappedPortfolio.instances, [chainId, portfolioId]) : undefined;
  }

  static wrapInstance({
    metaPortfolio,
    rootPair,
    rootAccount,
  }: {
    metaPortfolio: IMetaPortfolio;
    rootPair: WrappedPair;
    rootAccount: WrappedAccount;
  }): WrappedPortfolio {
    let instance = WrappedPortfolio.getInstance(metaPortfolio.id, rootPair.chainId);
    if (instance) {
      instance.fillField(metaPortfolio);
    } else {
      instance = new WrappedPortfolio(bigNumberObjectCheck(metaPortfolio), rootPair, rootAccount);
      _.set(WrappedPortfolio.instances, [rootPair.chainId, metaPortfolio.id], instance);
    }
    return instance;
  }

  static getInstanceMap(chainId: CHAIN_ID | undefined): { [portfolioId: string]: WrappedPortfolio } | undefined {
    return chainId ? _.get(WrappedPortfolio.instances, [chainId], undefined) : undefined;
  }

  static hasAnyInstance(chainId: CHAIN_ID | undefined): boolean {
    return chainId ? _.has(WrappedPortfolio.instances, [chainId]) : false;
  }

  static fromEmptyPortfolio(rootPair: WrappedPair, userAddr: string): WrappedPortfolio {
    const accountId = getAccountId(userAddr, rootPair.rootInstrument.instrumentAddr);
    const portfolioId = getPortfolioId(accountId, rootPair.expiry);
    if (WrappedPortfolio.getInstance(portfolioId, rootPair.chainId)) {
      return WrappedPortfolio.getInstance(portfolioId, rootPair.chainId) as WrappedPortfolio;
    }
    const account = WrappedAccount.fromEmptyAccount(rootPair.rootInstrument, userAddr);
    const metaPortfolio: IMetaPortfolio = {
      id: portfolioId,
      instrumentId: rootPair.rootInstrument.id,
      pairId: rootPair.id,
      accountId: accountId,
      blockInfo: {
        timestamp: 0,
        height: 0,
      },
      instrumentAddr: rootPair.rootInstrument.instrumentAddr,
      expiry: rootPair.expiry,
      traderAddr: userAddr,
      orders: new Map(),
      ranges: new Map(),
      position: getEmptySDKPosition(rootPair, userAddr),
      isEmpty: true,
    };
    return new WrappedPortfolio(metaPortfolio, rootPair, account);
  }

  // setMetaData(metaPortfolio: IPortfolioCore): void {

  // }

  removePosition(positionId: string): void {
    // remove settled position
    _.unset(this.positionMap, [positionId]);
  }

  removeOrder(orderId: string): void {
    // remove order
    const order = this.orderMap[orderId];

    if (order && this.orders.get(order.oid)) {
      this.orders.delete(order.oid);
    }
    _.unset(this.orderMap, [orderId]);
  }

  removeRange(rangeId: string): void {
    // remove range
    const range = this.rangeMap[rangeId];
    if (range && this.ranges.get(range.rid)) {
      this.ranges.delete(range.rid);
    }
    _.unset(this.rangeMap, [rangeId]);
  }

  fillField(partialPortfolio: Partial<IMetaPortfolio>): void {
    const portfolio = _.merge({}, this.metaPortfolio, partialPortfolio);

    this.metaPortfolio = portfolio;
    // this.setMetaData(portfolio);
  }

  connectPosition(position: WrappedPosition): void {
    if (position) {
      this.positionMap[position.id] = position;
      this.position = position;
    }
  }

  connectOrder(order: WrappedOrder): void {
    if (order) {
      this.orderMap[order.id] = order;
      if (!this.orders.get(order.oid)) {
        this.orders.set(order.oid, order);
        // this.oids = [...this.oids, order.oid];
      }
    }
  }

  connectRange(range: WrappedRange): void {
    if (range) {
      this.rangeMap[range.id] = range;
      if (!this.ranges.get(range.rid)) {
        this.ranges.set(range.rid, range);
        // this.rids = [...this.rids, range.rid];
      }
    }
  }

  /**
   * @returns {string} portfolio id in the format of `${userAddr}-${instrumentAddr}-${expiry}`
   */
  get id(): string {
    return `${this.rootAccount.id}-${this.rootPair.expiry}`.toLowerCase();
  }

  get rootInstrument(): WrappedInstrument {
    return this.rootPair.rootInstrument;
  }

  toJSON(): IMetaPortfolio {
    return this.metaPortfolio;
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
