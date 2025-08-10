import { CHAIN_ID } from '@derivation-tech/context';
import _ from 'lodash';

import { TokenInfo } from '@/types/token';
import { bigNumberObjectCheck } from '@/utils';

import { IVaultInfo, IVaultTag } from '@/types/vault';
import { fixBalanceNumberDecimalsTo18 } from '@/utils/token';
import { Stage } from '@synfutures/sdks-perp-launchpad';
import { DepositInfo } from '@synfutures/sdks-perp-launchpad-datasource';
import { constants } from 'ethers';
import { WrappedBigNumber } from './WrappedBigNumber';
import { WrappedToken } from './WrappedToken';

export class WrappedVault implements IVaultInfo {
  static instances: { [chainId: number]: { [vaultAddr: string]: WrappedVault } } = {}; // chainId -> vaultAddr -> WrappedVault
  quoteToken: WrappedToken;
  //metaVault: WrappedVaultInfo;
  vaultAddress: string;
  name: string;
  status: Stage;
  minQuoteAmount: WrappedBigNumber;
  liveThreshold: WrappedBigNumber;
  tokenInfo: TokenInfo;
  assetPair: string;
  assetPairLink: string;
  tokenTvl: WrappedBigNumber;
  tokenUsdTvl: WrappedBigNumber;
  ooPoints: WrappedBigNumber;
  ooPointsEpoch: number;
  stageForUi: Stage;

  tags: IVaultTag[];

  depositInfo: { [userAddr: string]: DepositInfo | undefined };

  _userAddr?: string;
  constructor(chainId: CHAIN_ID, vaultInfo: IVaultInfo) {
    this.quoteToken = new WrappedToken(vaultInfo.tokenInfo);
    this.vaultAddress = vaultInfo.vaultAddress;
    this.name = vaultInfo.name;
    this.status = vaultInfo.status;
    this.liveThreshold = vaultInfo.liveThreshold;
    this.minQuoteAmount = vaultInfo.minQuoteAmount;
    this.stageForUi = vaultInfo.stageForUi;
    this.tokenInfo = vaultInfo.tokenInfo;
    this.assetPair = vaultInfo.assetPair;
    this.assetPairLink = vaultInfo.assetPairLink;
    this.tokenTvl = WrappedBigNumber.from(vaultInfo.tokenTvl);
    this.tokenUsdTvl = WrappedBigNumber.from(vaultInfo.tokenUsdTvl);
    this.ooPoints = WrappedBigNumber.from(vaultInfo.ooPoints);
    this.ooPointsEpoch = vaultInfo.ooPointsEpoch;
    this.tags = vaultInfo.tags;

    this.depositInfo = {};
  }

  setMetaVault(props: IVaultInfo) {
    this.vaultAddress = props.vaultAddress;
    this.name = props.name;
    this.status = props.status;
    this.stageForUi = props.stageForUi;

    this.tokenInfo = props.tokenInfo;
    this.assetPair = props.assetPair;
    this.assetPairLink = props.assetPairLink;
    this.tokenTvl = props.tokenTvl;
    this.tokenUsdTvl = props.tokenUsdTvl;
    this.ooPoints = props.ooPoints;
    this.ooPointsEpoch = props.ooPointsEpoch;

    this.liveThreshold = props.liveThreshold;
    this.minQuoteAmount = props.minQuoteAmount;
    this.stageForUi = props.stageForUi;
  }
  static getInstance(vaultAddr: string | undefined, chainId: CHAIN_ID | undefined): WrappedVault | undefined {
    return vaultAddr && chainId ? _.get(WrappedVault.instances, [chainId, vaultAddr]) : undefined;
  }

  static wrapInstance({
    metaVault,
    chainId,
    depositInfo,
  }: {
    metaVault: IVaultInfo;
    chainId: CHAIN_ID;
    depositInfo?: DepositInfo;
  }): WrappedVault {
    let vault = WrappedVault.getInstance(metaVault.vaultAddress, chainId);
    if (vault) {
      //   quote.fillField(bigNumberObjectCheck(metaToken));
      vault.setDepositInfo(depositInfo);
    } else {
      vault = new WrappedVault(chainId, bigNumberObjectCheck(metaVault));
      vault.setDepositInfo(depositInfo);
      _.set(WrappedVault.instances, [chainId, metaVault.vaultAddress], vault);
    }
    // vault.ooPoints = ooPointsInfo?.distributedVaultPoints || 0;
    // vault.epoch = ooPointsInfo?.epoch;

    return vault;
  }
  static getInstanceMap(chainId: CHAIN_ID | undefined): { [quoteId: string]: WrappedVault } | undefined {
    return chainId ? _.get(WrappedVault.instances, [chainId], undefined) : undefined;
  }
  setDepositInfo(info: DepositInfo | undefined) {
    info && _.set(this.depositInfo, [info?.user], info);
  }
  // if current tvl > target tvl stage will be live no matter smart contract is incoming or live.

  get tvlUSD(): WrappedBigNumber {
    return this.tokenUsdTvl;
  }

  get tvl(): WrappedBigNumber {
    return this.tokenTvl;
  }
  get targetTvl(): WrappedBigNumber {
    return this.liveThreshold;
  }
  get targetTvlUSD(): WrappedBigNumber {
    return this.liveThreshold.mul(this.quoteToken.price || '');
  }

  getUserDepositUSD(userAddr: string | undefined): WrappedBigNumber {
    return userAddr
      ? WrappedBigNumber.from(
          fixBalanceNumberDecimalsTo18(
            this.depositInfo[userAddr]?.holdingValue || constants.Zero,
            this.quoteToken.decimals,
          ),
        ).mul(this.quoteToken.price || '')
      : WrappedBigNumber.ZERO;
  }

  getUserDeposit(userAddr?: string | undefined): WrappedBigNumber {
    userAddr = this._userAddr;
    return userAddr
      ? WrappedBigNumber.from(
          fixBalanceNumberDecimalsTo18(
            this.depositInfo[userAddr]?.holdingValue || constants.Zero,
            this.quoteToken.decimals,
          ),
        )
      : WrappedBigNumber.ZERO;
  }

  get userDeposit(): WrappedBigNumber {
    return this._userAddr
      ? WrappedBigNumber.from(
          fixBalanceNumberDecimalsTo18(
            this.depositInfo[this._userAddr]?.holdingValue || constants.Zero,
            this.quoteToken.decimals,
          ),
        )
      : WrappedBigNumber.ZERO;
  }

  get userDepositUSD(): WrappedBigNumber {
    return this._userAddr ? this.userDeposit.mul(this.quoteToken.price || '') : WrappedBigNumber.ZERO;
  }

  getUserAllTimeEarned(userAddr?: string | undefined): WrappedBigNumber {
    return userAddr
      ? WrappedBigNumber.from(
          fixBalanceNumberDecimalsTo18(
            this.depositInfo[userAddr]?.allTimeEarned || constants.Zero,
            this.quoteToken.decimals,
          ),
        )
      : WrappedBigNumber.ZERO;
  }

  getUserAllTimeEarnedUSD(userAddr?: string | undefined): WrappedBigNumber {
    return this.getUserAllTimeEarned(userAddr).mul(this.quoteToken.price || 0);
  }

  getLaunchProgressPercentage(): WrappedBigNumber {
    return WrappedBigNumber.from(this.tokenTvl).div(WrappedBigNumber.from(this.liveThreshold));
  }

  setUserAddr(userAddr: string) {
    this._userAddr = userAddr;
  }

  toJSON(): {
    quoteToken: TokenInfo & {
      price?: WrappedBigNumber;
    };
    vaultAddress: string;
  } & IVaultInfo {
    return {
      quoteToken: this.quoteToken.toJSON(),
      vaultAddress: this.vaultAddress,
      name: this.name,
      status: this.status,
      minQuoteAmount: this.minQuoteAmount,
      liveThreshold: this.liveThreshold,
      tokenInfo: this.tokenInfo,
      assetPair: this.assetPair,
      assetPairLink: this.assetPairLink,
      tokenTvl: this.tokenTvl,
      tokenUsdTvl: this.tokenUsdTvl,
      ooPoints: this.ooPoints,
      ooPointsEpoch: this.ooPointsEpoch,
      stageForUi: this.stageForUi,
      tags: this.tags,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
