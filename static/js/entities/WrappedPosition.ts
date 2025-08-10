import { PriceBasisForPnl } from '@/constants/trade/priceBasisForPnl';
import { IMetaPosition } from '@/types/account';
import { bigNumberObjectCheck } from '@/utils';
import { getAccountId, getPortfolioId } from '@/utils/transform/transformId';
import { BlockInfo, CHAIN_ID, ZERO } from '@derivation-tech/context';
import { BigNumber } from 'ethers';
import _ from 'lodash';

import { calcPositionLiquidationPrice } from '@/utils/position';
import { calcQuoteSizeByBase } from '@/utils/trade';
import { Position as PositionInterface, Side, utils } from '@synfutures/sdks-perp';
import { WrappedBigNumber } from './WrappedBigNumber';
import { WrappedInstrument } from './WrappedInstrument';
import { WrappedPair } from './WrappedPair';
import { WrappedPortfolio } from './WrappedPortfolio';

export class WrappedPosition implements PositionInterface {
  // basic fields
  balance: BigNumber;
  size: BigNumber;
  entryNotional: BigNumber;
  entrySocialLossIndex: BigNumber;
  entryFundingIndex: BigNumber;
  // redundant fields
  instrumentAddr: string;
  expiry: number;
  traderAddr: string;

  // additional fields
  side: Side;
  entryPrice: BigNumber;
  blockInfo?: BlockInfo;
  static instances: { [chainId: number]: { [positionId: string]: WrappedPosition } } = {}; // chainId -> positionId -> WrappedPosition
  rootPortfolio: WrappedPortfolio;
  metaPosition: IMetaPosition;
  rootPair: WrappedPair;
  constructor(metaPosition: IMetaPosition, rootPortfolio: WrappedPortfolio) {
    this.balance = metaPosition.balance;
    this.size = metaPosition.size;
    this.entryNotional = metaPosition.entryNotional;
    this.entrySocialLossIndex = metaPosition.entrySocialLossIndex;
    this.entryFundingIndex = metaPosition.entryFundingIndex;
    this.instrumentAddr = metaPosition.instrumentAddr;
    this.expiry = metaPosition.expiry;
    this.traderAddr = metaPosition.traderAddr;
    this.side = metaPosition.side;
    this.entryPrice = metaPosition.entryPrice;
    this.blockInfo = metaPosition.blockInfo;

    this.metaPosition = metaPosition;
    this.rootPortfolio = rootPortfolio;
    this.rootPair = rootPortfolio.rootPair;
  }

  static getInstance(positionId: string, chainId: CHAIN_ID | undefined): WrappedPosition | undefined {
    return positionId && chainId ? _.get(WrappedPosition.instances, [chainId, positionId]) : undefined;
  }

  static wrapInstance({
    metaPosition,
    rootPortfolio,
    chainId,
  }: {
    metaPosition: IMetaPosition;
    rootPortfolio: WrappedPortfolio;
    chainId: CHAIN_ID;
  }): WrappedPosition {
    let instance = WrappedPosition.getInstance(metaPosition.id, chainId);
    if (instance) {
      instance.fillField(bigNumberObjectCheck(metaPosition));
    } else {
      instance = new WrappedPosition(bigNumberObjectCheck(metaPosition), rootPortfolio);
      _.set(WrappedPosition.instances, [chainId, metaPosition.id], instance);
    }
    return instance;
  }

  static getInstanceMap(chainId: CHAIN_ID | undefined): { [positionId: string]: WrappedPosition } | undefined {
    return chainId ? _.get(WrappedPosition.instances, [chainId], undefined) : undefined;
  }

  static hasAnyInstance(chainId: CHAIN_ID | undefined): boolean {
    return chainId ? _.has(WrappedPosition.instances, [chainId]) : false;
  }

  public static fromEmptyWrappedPosition(
    rootPair: WrappedPair,
    useAddr: string,
    rootPortfolio?: WrappedPortfolio,
  ): WrappedPosition {
    const accountId = getAccountId(useAddr, rootPair.rootInstrument.instrumentAddr);
    const portfolioId = getPortfolioId(accountId, rootPair.expiry);
    const positionId = portfolioId;
    if (WrappedPosition.getInstance(positionId, rootPair.chainId)) {
      return WrappedPosition.getInstance(positionId, rootPair.chainId) as WrappedPosition;
    }

    const metaPosition: IMetaPosition = {
      id: positionId,
      instrumentId: rootPair.rootInstrument.id,
      pairId: rootPair.id,
      accountId: accountId,
      portfolioId: portfolioId,
      balance: ZERO,
      size: ZERO,
      entryNotional: ZERO,
      entrySocialLossIndex: ZERO,
      entryFundingIndex: ZERO,
      instrumentAddr: rootPair.rootInstrument.instrumentAddr,
      expiry: rootPair.expiry,
      traderAddr: useAddr,
      side: Side.FLAT,
      entryPrice: ZERO,
      blockInfo: {
        timestamp: 0,
        height: 0,
      },
    };
    const wrappedPortfolio = rootPortfolio ?? WrappedPortfolio.fromEmptyPortfolio(rootPair, useAddr);
    return new WrappedPosition(metaPosition, wrappedPortfolio);
  }

  setMetaData(metaPosition: IMetaPosition): void {
    this.balance = metaPosition.balance;
    this.size = metaPosition.size;
    this.entryNotional = metaPosition.entryNotional;
    this.entrySocialLossIndex = metaPosition.entrySocialLossIndex;
    this.entryFundingIndex = metaPosition.entryFundingIndex;
    this.instrumentAddr = metaPosition.instrumentAddr;
    this.expiry = metaPosition.expiry;
    this.traderAddr = metaPosition.traderAddr;
    this.side = metaPosition.side;
    this.entryPrice = metaPosition.entryPrice;
  }

  fillField(partialPosition: Partial<IMetaPosition>): void {
    const position = _.merge({}, this.metaPosition, bigNumberObjectCheck(partialPosition));
    this.metaPosition = position;
    this.setMetaData(position);
  }
  wrapAttribute(prop: keyof WrappedPosition): WrappedBigNumber {
    if (BigNumber.isBigNumber(this[prop])) {
      const bn = WrappedBigNumber.from(this[prop] as BigNumber);
      if (this.rootPair.isInverse) {
        if (['entryPrice', 'liquidationPrice'].includes(prop)) {
          // bn = toReciprocalNumber(bn);
        }
        if (['size'].includes(prop)) {
          // bn = bn.mul(-1);
        }
      }
      return bn;
    } else if (typeof this[prop] === 'string' || typeof this[prop] === 'number') {
      return WrappedBigNumber.from(this[prop] as unknown as string | number);
    }
    return WrappedBigNumber.ZERO;
  }

  /**
   * @returns {string} position id in the format of `${userAddr}-${instrumentAddr}-${expiry}`
   */
  get id(): string {
    return this.metaPosition.id.toLowerCase();
  }

  get rootInstrument(): WrappedInstrument {
    return this.rootPair.rootInstrument;
  }
  get wrappedSize(): WrappedBigNumber {
    return this.wrapAttribute('size');
  }
  get sizeInQuoteToken(): WrappedBigNumber {
    return calcQuoteSizeByBase(this.size, this.rootPair.fairPrice, this.isInverse);
  }
  get wrappedSide(): Side {
    return this.side;
  }

  get hasPosition(): boolean {
    return this?.size && !this?.size?.eq(0) && !this?.balance?.eq(0);
  }

  get equity(): WrappedBigNumber {
    const equity = utils.positionEquity(this, this.rootPair);
    return WrappedBigNumber.from(equity);
  }

  get unrealizedPnlByFairPrice(): WrappedBigNumber {
    const pnl = utils.positionUnrealizedPnlByFairPrice(this, this.rootPair);
    return WrappedBigNumber.from(pnl);
  }

  get unrealizedPnl(): WrappedBigNumber {
    const pnl = utils.positionUnrealizedPnl(this, this.rootPair);
    return WrappedBigNumber.from(pnl);
  }

  get unrealizedFundingFee(): WrappedBigNumber {
    return WrappedBigNumber.from(utils.positionUnrealizedFundingFee(this, this.rootPair));
  }

  // calculate the desired mark price
  get liquidationPrice(): WrappedBigNumber {
    const liqPrice = calcPositionLiquidationPrice(this.rootPair, this, this.rootInstrument.maintenanceMarginRatio);
    // return getAdjustTradePrice(liqPrice, this.rootPair.isInverse);
    return WrappedBigNumber.from(liqPrice);
  }

  get leverageWad(): BigNumber {
    const leverage = utils.positionLeverage(this, this.rootPair);
    return leverage;
  }

  get leverage(): WrappedBigNumber {
    return WrappedBigNumber.from(this.leverageWad);
  }

  getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl: PriceBasisForPnl): WrappedBigNumber {
    const pnl =
      priceBasisForPnl === PriceBasisForPnl.MARK_PRICE
        ? // default is MARK_PRICE from sdk
          WrappedBigNumber.from(this.unrealizedPnl)
        : this.unrealizedPnlByFairPrice;
    return pnl.min(this.unrealizedFundingFee);
  }

  getUnrealizedPnlWithoutFunding(priceBasisForPnl: PriceBasisForPnl): WrappedBigNumber {
    return this.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl).add(this.unrealizedSocialLoss);
  }
  getUnrealizedPnlPercentage(priceBasisForPnl: PriceBasisForPnl): WrappedBigNumber {
    // if marign(equity) <=0, which means it is waiting for bot liquidation we set unrealizedPnl to -100
    if (this.equity.lte(0)) {
      return new WrappedBigNumber(-100);
    }
    const unrealizedPnl = this.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl);
    // unrealizedPnlRatio =  unrealizedPnl / (margin - unrealizedPnl)
    const ratio = unrealizedPnl.div(this.equity.min(unrealizedPnl));
    return ratio;
  }
  // If social loss is 10, sdk will return 10 instead of -10
  get unrealizedSocialLoss(): WrappedBigNumber {
    const socialLoss = utils.positionUnrealizedSocialLoss(this, this.rootPortfolio.rootPair);
    return new WrappedBigNumber(socialLoss);
  }

  get isInverse(): boolean {
    return this.rootInstrument.isInverse;
  }

  toJSON() {
    return {
      ...this.metaPosition,
      balance: this.balance._hex,
      size: this.size._hex,
      entryNotional: this.entryNotional._hex,
      entrySocialLossIndex: this.entrySocialLossIndex._hex,
      entryFundingIndex: this.entryFundingIndex._hex,
      entryPrice: this.entryPrice._hex,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
