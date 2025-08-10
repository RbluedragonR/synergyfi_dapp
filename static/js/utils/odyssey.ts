import moment from 'moment';

import { WrappedPair } from '@/entities/WrappedPair';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { InstrumentPointConfigParam, ODYSSEY_STEP, USER_STATUS } from '@/types/odyssey';
import { TGP_USER_STATUS } from '@/types/tgp';
import { Context } from '@derivation-tech/context';
import {
  INITIAL_MARGIN_RATIO,
  InstrumentIdentifier,
  Q96,
  TickMath,
  WAD,
  ZERO,
  r2w,
  wadToSqrtX96,
  wmul,
} from '@synfutures/sdks-perp';
import { BigNumber } from 'ethers';
import { toWad } from './numberUtil';
import { isWrappedPairType } from './pair';

export function getStepByUserStatus(status: USER_STATUS): ODYSSEY_STEP {
  switch (status) {
    case USER_STATUS.DEFAULT:
      return ODYSSEY_STEP.CONNECTED_WALLET;
      break;
    case USER_STATUS.TWITTER_CONNECTED:
      return ODYSSEY_STEP.LINKED_TWITTER;
      break;
    case USER_STATUS.DISCORD_CONNECTED:
      return ODYSSEY_STEP.FOLLOWED_DISCORD;
      break;
    case USER_STATUS.EMAIL_CONNECTED:
      return ODYSSEY_STEP.FILLED_EMAIL;
      break;
    case USER_STATUS.FIRST_BOX_OPENED:
      return ODYSSEY_STEP.DONE;
      break;
    default:
      return ODYSSEY_STEP.INIT;
      break;
  }
}

export function getStepByTGPUserStatus(status: TGP_USER_STATUS): ODYSSEY_STEP {
  switch (status) {
    case TGP_USER_STATUS.DEFAULT:
      return ODYSSEY_STEP.CONNECTED_WALLET;
      break;
    case TGP_USER_STATUS.TWITTER_CONNECTED:
      return ODYSSEY_STEP.LINKED_TWITTER;
      break;
    case TGP_USER_STATUS.DISCORD_CONNECTED:
      return ODYSSEY_STEP.FOLLOWED_DISCORD;
      break;
    case TGP_USER_STATUS.EMAIL_CONNECTED:
      return ODYSSEY_STEP.FILLED_EMAIL;
      break;
    default:
      return ODYSSEY_STEP.INIT;
      break;
  }
}
/**
 * get next distribution timestamp
 * @param spinDistributionIntervalType // 0: every hour, 1: every day, 2: every week;
 * @returns timestamp of milliseconds
 */
export function getSpinNextDistributionTimestamp(spinDistributionIntervalType: 0 | 1 | 2): number {
  let nowDate = moment().utc();
  switch (spinDistributionIntervalType) {
    case 0:
      nowDate = nowDate.add(1, 'hours').set('minutes', 0).set('seconds', 0);
      break;
    case 1:
      nowDate = nowDate.add(1, 'days').set('hours', 0).set('minutes', 0).set('seconds', 0);
      break;
    default:
      const day = nowDate.weekday();
      if (day === 0) {
        nowDate = nowDate.day(1).set('hours', 0).set('minutes', 0).set('seconds', 0);
      } else {
        nowDate = nowDate.day(8).set('hours', 0).set('minutes', 0).set('seconds', 0);
      }

      break;
  }
  return nowDate.valueOf();
}

// @param alphaWad: decimal 18 units 1.3e18 means 1.3
// @param liquidity: can get from simulateAddLiquidity
// @param accountBoost : 10000 means 1
// @param poolFactor : 10000 means 1
// @param quotePriceWad : 1e18 means price 1 usd
export async function simulateRangePointPerDay({
  instrument,
  expiry,
  alphaWad,
  liquidity,
  balance,
  accountBoost,
  poolFactor,
  quotePriceWad,
  isStable = false,
  sdk,
  pair,
}: {
  instrument: InstrumentIdentifier;
  expiry: number;
  alphaWad: BigNumber;
  liquidity: BigNumber;
  balance: BigNumber;
  accountBoost: number;
  poolFactor: number;
  quotePriceWad: BigNumber;
  isStable: boolean;
  sdk: Context;
  pair?: WrappedPair;
}): Promise<BigNumber> {
  let initialMarginRatio: number;
  let currentSqrtPX96: BigNumber;
  const isLivePair = isWrappedPairType(pair);
  if (isLivePair && pair) {
    initialMarginRatio = pair.rootInstrument.initialMarginRatio;
    currentSqrtPX96 = pair.sqrtPX96;
  } else {
    initialMarginRatio = INITIAL_MARGIN_RATIO;
    const benchmarkPrice = await sdk.perp.simulate.simulateBenchmarkPrice(instrument, expiry);
    currentSqrtPX96 = wadToSqrtX96(benchmarkPrice);
  }

  return calculateRangePointPerDay(
    liquidity,
    currentSqrtPX96,
    balance,
    alphaWad,
    initialMarginRatio,
    accountBoost,
    poolFactor,
    quotePriceWad,
    isStable,
  );
}

export function calculateRangePointPerDay(
  liquidity: BigNumber,
  entrySqrtX96: BigNumber,
  balance: BigNumber,
  alphaWad: BigNumber,
  initialMarginRatio: number,
  accountBoost: number,
  poolFactor: number,
  quotePriceWad: BigNumber,
  isStable: boolean,
): BigNumber {
  // liquidity = sqrt(vx * vy) = sqrt(vx * vy)  = sqrt(vy*vy/ entryPrice)
  // liquidity = vy/ sqrt(entryPrice)
  // vy = liquidity * sqrt(entryPrice) = liquidity * sqrtPriceX96 / 2^96
  const vy = liquidity.mul(entrySqrtX96).div(Q96);
  // we can directly use wad here, because mul then div will not change the value
  let pointPower = BigNumber.from(0);
  if (initialMarginRatio === 100 || isStable) {
    // 100x leverage pair use simple formula
    pointPower = balance.div(86400).div(365);
  } else {
    pointPower = vy.mul(2).mul(r2w(initialMarginRatio)).div(capAlphaWad(alphaWad).sub(WAD)).div(86400).div(365);
  }

  let pointPerDay = pointPower.mul(86400);
  pointPerDay = wmul(pointPerDay, r2w(accountBoost));
  pointPerDay = wmul(pointPerDay, r2w(poolFactor));
  pointPerDay = wmul(pointPerDay, quotePriceWad);
  return pointPerDay;
}

export function capAlphaWad(alphaWad: BigNumber): BigNumber {
  const TWO_WAD: BigNumber = toWad('2');
  return alphaWad.gt(TWO_WAD) ? TWO_WAD : alphaWad;
}

// @param accountBoost : 10000 means 1
// @param poolFactor : 10000 means 1
// @param quotePriceWad : 1e18 means price 1 usd
export async function simulateOrderPointPerDay(
  targetTick: number,
  baseSize: BigNumber,
  accountBoost: number,
  poolFactor: number,
  quotePriceWad: BigNumber,
): Promise<BigNumber> {
  const pointPower = wmul(TickMath.getWadAtTick(targetTick), baseSize.abs()).div(86400).div(365);

  let pointPerDay = pointPower.mul(86400); // 1 day
  pointPerDay = wmul(pointPerDay, r2w(accountBoost));
  pointPerDay = wmul(pointPerDay, r2w(poolFactor));
  pointPerDay = wmul(pointPerDay, quotePriceWad);
  return pointPerDay;
}

export async function simulatePortfolioPointPerDay(
  portfolios: WrappedPortfolio[],
  accountBoost: number,
  pointConfigMetaMap: Map<string, InstrumentPointConfigParam>,
): Promise<BigNumber> {
  let totalPointPerDay = ZERO;
  const lowerCaseConfigMap = new Map<string, InstrumentPointConfigParam>();
  pointConfigMetaMap.forEach((value, key) => {
    lowerCaseConfigMap.set(key.toLowerCase(), value);
  });

  for (let i = 0; i < portfolios.length; i++) {
    const portfolio = portfolios[i];
    let pointConf = lowerCaseConfigMap.get(portfolio.rootInstrument.instrumentAddr.toLowerCase());
    if (!pointConf) {
      pointConf = { isStable: false, quotePriceWad: ZERO, poolFactorMap: new Map<number, number>() };
    }
    if (portfolio) {
      const expiry = portfolio.expiry;
      // get all ranges
      const poolFactor = pointConf!.poolFactorMap.get(expiry) ? pointConf!.poolFactorMap.get(expiry) : 0;
      const quotePriceWad = pointConf!.quotePriceWad;
      const isStable = pointConf!.isStable;

      if (poolFactor === 0 || quotePriceWad === ZERO) continue;
      for (const range of Object.values(portfolio.rangeMap)) {
        // must use abs range difference
        const equivalentAlpha = TickMath.getWadAtTick(Math.abs(~~(range.tickUpper - range.tickLower) / 2));
        const pointPerDay = await calculateRangePointPerDay(
          range.liquidity,
          range.sqrtEntryPX96,
          range.balance,
          equivalentAlpha,
          portfolio.rootInstrument.setting.initialMarginRatio,
          accountBoost,
          poolFactor!,
          quotePriceWad,
          isStable,
        );
        totalPointPerDay = totalPointPerDay.add(pointPerDay);
      }
      for (const order of Object.values(portfolio.orderMap)) {
        const pointPerDay = await simulateOrderPointPerDay(
          order.tick,
          order.size,
          accountBoost,
          poolFactor!,
          quotePriceWad,
        );
        totalPointPerDay = totalPointPerDay.add(pointPerDay);
      }
    }
  }
  return totalPointPerDay;
}
