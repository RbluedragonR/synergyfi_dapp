import { CHAIN_ID } from '@derivation-tech/context';
import _ from 'lodash';

import { IMetaAccount } from '@/types/account';
import { bigNumberObjectCheck } from '@/utils';
import { getAccountId } from '@/utils/transform/transformId';

import { WrappedInstrument } from './WrappedInstrument';
import { WrappedPortfolio } from './WrappedPortfolio';

export class WrappedAccount {
  static instances: { [chainId: number]: { [accountId: string]: WrappedAccount } } = {}; // chainId -> accountId -> WrappedAccount
  rootInstrument: WrappedInstrument;
  metaAccount: IMetaAccount;
  portfolioMap: Record<string, WrappedPortfolio> = {};
  userAddr: string;

  constructor(rootInstrument: WrappedInstrument, metaAccount: IMetaAccount) {
    this.rootInstrument = rootInstrument;
    this.metaAccount = metaAccount;
    this.userAddr = metaAccount.userAddr;
  }

  static getInstance(accountId: string | undefined, chainId: CHAIN_ID | undefined): WrappedAccount | undefined {
    return accountId && chainId ? _.get(WrappedAccount.instances, [chainId, accountId]) : undefined;
  }

  static getInstanceMap(chainId: CHAIN_ID | undefined): { [accountId: string]: WrappedAccount } | undefined {
    return chainId ? _.get(WrappedAccount.instances, [chainId], undefined) : undefined;
  }

  static hasAnyInstance(chainId: CHAIN_ID | undefined): boolean {
    return chainId ? _.has(WrappedAccount.instances, [chainId]) : false;
  }

  static wrapInstance({
    metaAccount,
    rootInstrument,
    chainId,
  }: {
    metaAccount: IMetaAccount;
    rootInstrument: WrappedInstrument;
    chainId: CHAIN_ID;
  }): WrappedAccount {
    let account = WrappedAccount.getInstance(metaAccount.id, rootInstrument.chainId);
    if (account) {
      account.fillField(metaAccount);
    } else {
      account = new WrappedAccount(rootInstrument, bigNumberObjectCheck(metaAccount));
      _.set(WrappedAccount.instances, [chainId, metaAccount.id], account);
    }
    return account;
  }

  static fromEmptyAccount(rootInstrument: WrappedInstrument, userAddr: string): WrappedAccount {
    const accountId = getAccountId(userAddr, rootInstrument.instrumentAddr);
    if (WrappedAccount.getInstance(accountId, rootInstrument.chainId)) {
      return WrappedAccount.getInstance(accountId, rootInstrument.chainId) as WrappedAccount;
    }
    return new WrappedAccount(rootInstrument, {
      id: accountId,
      userAddr: userAddr,
      instrumentId: rootInstrument.id,
      portfolioIds: [],
      blockInfo: { timestamp: 0, height: 0 },
    });
  }

  fillField(partialAccount: Partial<IMetaAccount>): void {
    const futures = _.merge({}, this.metaAccount, partialAccount);
    this.metaAccount = bigNumberObjectCheck(futures);
  }

  connectPortfolio(portfolio: WrappedPortfolio): void {
    if (portfolio) {
      this.portfolioMap[portfolio.id] = portfolio;
    }
  }

  /**
   * @returns {string} account id in the format of `${userAddr}-${instrumentAddr}`
   */
  get id(): string {
    return `${this.userAddr}-${this.rootInstrument.id}`.toLowerCase();
  }
}
