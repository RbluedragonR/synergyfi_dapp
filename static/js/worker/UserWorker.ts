import './initWorker';

import { CHAIN_ID, TokenInfo as Token } from '@derivation-tech/context';
import { ERC20__factory } from '@derivation-tech/contracts';
import { BaseContract, BigNumber, ethers } from 'ethers';

import _ from 'lodash';

import { DEFAULT_EMPTY_ACCOUNT } from '@/constants/global';
import {
  BlockyResult,
  WorkerAllowanceResult,
  WorkerBalanceEventResult,
  WorkerEvent,
  WorkerEventNames,
} from '@/types/worker';
import { pollingFunc } from '@/utils';
import { isNativeTokenAddr } from '@/utils/token';

// import { Contract as MulticallContract, Provider as MulticallProvider } from 'ethers-multicall';
import { CHAIN_HTTP_RPC_URLS } from '@/constants/rpc';
import { getFallbackProvider } from '@/utils/chain';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ChainContextWorker } from './ChainContextWorker';
import { ERC20Worker } from './ERC20Worker';
import { emitWorkerEvent } from './helper';

export type BalanceInBlock = {
  balance: BigNumber;
  block: number;
};

export type AllowanceInBlock = {
  allowance: BigNumber;
  block: number;
};

class ChainUserWorker {
  private static instances: Record<string, ChainUserWorker> = {};
  chainId: CHAIN_ID;
  chainContextWorker: ChainContextWorker;
  erc20Worker: ERC20Worker;
  nativeTokenBalanceInBlock?: BalanceInBlock;
  erc20TokenBalanceMap: Record<string, BalanceInBlock>; // tokenAddr -> balance
  erc20AllowanceMap: Record<string, Record<string, BlockyResult<BigNumber>>>; // tokenAddr -> spender -> allowance

  listeningEvent: { [contractName: string]: { [listeningKey: string]: { [eventName: string]: boolean } } }; // contractName => listeningKey(user address/token address) => event name => listening

  isRequestBalance: {
    [userAddr: string]: {
      [tokenAddr: string]: {
        [block: number]: boolean;
      };
    };
  } = {};
  isRequestAllowance: {
    [userAddr: string]: {
      [tokenAddr: string]: {
        [block: number]: boolean;
      };
    };
  } = {};

  constructor(chainId: CHAIN_ID) {
    this.chainId = chainId;
    const provider = getFallbackProvider(chainId, CHAIN_HTTP_RPC_URLS?.[chainId]) as unknown as JsonRpcProvider;
    this.chainContextWorker = new ChainContextWorker(chainId, provider);
    this.erc20Worker = ERC20Worker.getInstance(chainId);
    this.erc20TokenBalanceMap = {};
    this.erc20AllowanceMap = {};
    this.listeningEvent = {};
  }

  public static async getInstance(chainId: CHAIN_ID): Promise<ChainUserWorker> {
    let instance = this.instances[`${chainId}`];
    if (!instance) {
      instance = new ChainUserWorker(chainId);
      this.instances[`${chainId}`] = instance;
      await instance.init();
    }
    return instance;
  }

  async init(): Promise<void> {
    await this.chainContextWorker.readProviderFromLocalOrSetting();
  }

  get chainContext() {
    return this.chainContextWorker.chainContext;
  }

  get provider() {
    return this.chainContextWorker.provider;
  }

  get chainInfo() {
    return this.chainContext.info;
  }

  getERC20Contract = (tokenAddr: string) => {
    return this.erc20Worker.getERC20Contract(tokenAddr, this.provider);
  };

  getWrappedNativeContract = (tokenAddr: string) => {
    return this.erc20Worker.getWrappedNativeContract(tokenAddr, this.provider);
  };

  async fetchNativeTokenBalance(userAddr: string, block?: number): Promise<BalanceInBlock | undefined> {
    if (!block) {
      // block = await this.provider.getBlockNumber();
    }
    // const nativeToken = this.chainContext.nativeToken;
    // // if the balance is already requested, block this request
    // const isRequest = _.get(this.isRequestBalance, [this.userAddr, nativeToken.address, block || 0]);
    // if (!isRequest) {
    //   _.set(this.isRequestBalance, [this.userAddr, nativeToken.address, block || 0], true);
    // } else {
    //   return undefined;
    // }
    const walletBalance = await this.provider.getBalance(userAddr, block);

    // if (!block) block = this.provider.blockNumber;
    const nativeTokenBalance = walletBalance;
    const balanceInfo = {
      balance: nativeTokenBalance,
      block: block || 0,
    };
    // if the block height is lower than the current block height, we don't need to update the state
    if (this.nativeTokenBalanceInBlock && (balanceInfo.block || 0) < (this.nativeTokenBalanceInBlock?.block || 0)) {
      return this.nativeTokenBalanceInBlock;
    }

    // if balance changed, emit event
    if (!balanceInfo.balance.eq(this.nativeTokenBalanceInBlock?.balance || -1)) {
      emitWorkerEvent<WorkerBalanceEventResult>(WorkerEventNames.NativeBalanceEvent, {
        balanceInfo: {
          ...balanceInfo,
          // balance: balanceInfo.balance.toString(),
        },
        chainId: this.chainId,
        userAddr: userAddr,
        token: this.chainContext.nativeToken,
        block: block || 0,
      });
    }

    this.nativeTokenBalanceInBlock = balanceInfo;

    return balanceInfo;
  }

  fetchTokenBalance = async (token: Token, userAddr: string, block?: number): Promise<BalanceInBlock | undefined> => {
    if (!block) {
      block = await this.provider.getBlockNumber();
    }

    // if the balance is already requested, block this request
    const isRequest = _.get(this.isRequestBalance, [userAddr, token.address, block]);
    if (!isRequest) {
      _.set(this.isRequestBalance, [userAddr, token.address, block], true);
    } else {
      return undefined;
    }

    const erc20 = this.getERC20Contract(token.address);
    const erc20Balance = await erc20.balanceOf(userAddr, {
      blockTag: block,
    });

    // if the block height is lower than the current block height, we don't need to update the state
    if (this.erc20TokenBalanceMap && block < this.erc20TokenBalanceMap[token.address]?.block) {
      return this.erc20TokenBalanceMap[token.address];
    }

    const res = this.updateBalanceCache({ userAddr, token, balance: erc20Balance, block });
    return res;
  };

  watchERC20Balance = async (token: Token, userAddr: string) => {
    const chainId = this.chainId;
    if (isNativeTokenAddr(token.address)) {
      return;
    }
    const erc20Contract = this.getERC20Contract(token.address);

    (erc20Contract as BaseContract).on(
      {
        topics: [
          [
            // from me event
            erc20Contract.interface.getEventTopic('Transfer'),
            erc20Contract.interface.getEventTopic('Deposit'),
            erc20Contract.interface.getEventTopic('Withdrawal'),
            erc20Contract.interface.getEventTopic('Approval'),
          ],
          ethers.utils.hexZeroPad(userAddr, 32),
        ],
      },
      (event) => {
        const parsedLog = erc20Contract.interface.parseLog(event);
        console.log('erc20Contract event:', parsedLog.name, 'args:', parsedLog.args);

        this.fetchTokenBalance(token, userAddr, event.blockNumber);

        if ('Approval' === parsedLog.name) {
          const to = parsedLog.args.to;
          const amount = parsedLog.args.amount;
          emitWorkerEvent<WorkerAllowanceResult>(WorkerEventNames.ApprovalEvent, {
            chainId,
            userAddr,
            block: event.blockNumber,
            token,
            allowanceInfo: {
              spender: to.toLowerCase(),
              allowance: amount,
            },
          });
        }
      },
    );
  };

  callERC20Allowance = async ({
    token,
    spender,
    userAddr,
    block,
  }: {
    token: Token;
    spender: string;
    userAddr: string;
    block?: number;
  }): Promise<BlockyResult<BigNumber | undefined>> => {
    if (!block) {
      block = await this.provider.getBlockNumber();
    }
    if (!token?.address) {
      return { data: undefined, block };
    }
    // if the pair is already requested, block this request
    const isRequest = _.get(this.isRequestAllowance, [userAddr, token.address.toLowerCase(), block]);
    if (!isRequest) {
      _.set(this.isRequestAllowance, [userAddr, token.address.toLowerCase(), block], true);
    } else {
      return { data: undefined, block };
    }
    const erc20Contract = this.getERC20Contract(token.address);

    const allowance = await erc20Contract.allowance(userAddr, spender);

    // if the block height is lower than the current block height, we don't need to update the state
    const cachedAllowanceInfo = _.get(this.erc20AllowanceMap, [token.address, spender]);
    if (cachedAllowanceInfo && block < cachedAllowanceInfo?.block) {
      return cachedAllowanceInfo;
    }

    this.updateAllowanceCache({ userAddr, token, spender, allowance, block });

    return {
      data: allowance,
      block,
    };
  };

  multicallBalance = async (
    tokens: Token[],
    userAddr: string,
    block?: number,
  ): Promise<BlockyResult<{ token: Token; balance: BigNumber }[]>> => {
    const balanceMap = tokens;
    // const tokenArr = _.sortBy(Object.values(balanceMap), ['address']);
    const balancesRes = await this.chainContext.tokenAssistant.balanceOfTokenBatch(
      balanceMap.map((token) => token.address),
      [userAddr],
      {
        blockTag: block,
      },
    );

    const balanceInfos = balanceMap.map((token, i) => {
      return {
        token,
        balance: balancesRes.balances[0][i] as BigNumber,
      };
    });
    if (balancesRes?.blockInfo) {
      block = balancesRes.blockInfo?.height?.toNumber();
    }
    if (balanceInfos?.length) {
      balanceInfos.forEach((balanceInfo) => {
        this.updateBalanceCache({
          userAddr,
          token: balanceInfo.token,
          balance: balanceInfo.balance,
          block: block || 0,
        });
      });
    }

    return {
      block: block || 0,
      data: balanceInfos,
    };
  };

  // multicallBalance2 = async (
  //   tokens: Token[],
  //   userAddr: string,
  //   block: number,
  // ): Promise<BlockyResult<{ token: Token; balance: BigNumber }[]>> => {
  //   const chainId = this.chainId;

  //   const ethcallProvider = new MulticallProvider(this.provider, chainId);
  //   const balanceMap = tokens;
  //   const tokenArr = _.sortBy(Object.values(balanceMap), ['address']);
  //   const balanceCalls = tokenArr.map((token) => {
  //     if (isNativeTokenAddr(token?.address)) {
  //       return ethcallProvider.getEthBalance(userAddr);
  //     }
  //     const erc20 = new MulticallContract(token.address, ERC20__factory.abi);
  //     return erc20.balanceOf(userAddr);
  //   });

  //   const balanceArr = await ethcallProvider.all(balanceCalls);
  //   const balanceInfos = tokenArr.map((token, i) => {
  //     return {
  //       token,
  //       balance: balanceArr[i] as BigNumber,
  //     };
  //   });
  //   return {
  //     block: block,
  //     data: balanceInfos,
  //   };
  // };

  updateBalanceCache({
    userAddr,
    balance,
    token,
    block,
  }: {
    userAddr: string;
    balance: BigNumber;
    token: Token;
    block: number;
  }): { block: number; balance: BigNumber } | undefined {
    if (!balance || !token?.address) return;

    // erc20Balance = fixBalanceNumberDecimalsTo18(erc20Balance, token);
    const res = {
      block: block,
      balance: balance,
    };
    // if balance changed, emit event
    if (!res.balance.eq(this.erc20TokenBalanceMap[token.address]?.balance || -1)) {
      const eventName = WorkerEventNames.BalanceEvent;
      emitWorkerEvent<WorkerBalanceEventResult>(eventName, {
        balanceInfo: {
          ...res,
          // balance: res.balance.toString(),
        },
        chainId: this.chainId,
        userAddr: userAddr,
        token: token,
        block: block,
      });
    }
    _.set(this.erc20TokenBalanceMap, [token.address], res);

    return res;
  }

  multicallAllowance = async (
    tokens: Token[],
    spender: string,
    userAddr: string,
    block?: number,
  ): Promise<BlockyResult<{ token: Token; allowance: BigNumber }[]> | undefined> => {
    if (!tokens?.length || !userAddr) return;
    const callMapping = tokens.map((t) => {
      const contract = ERC20__factory.connect(t.address, this.provider);
      return {
        callData: contract.interface.encodeFunctionData('allowance', [userAddr, spender]),
        contract,
        token: t,
      };
    });

    const res = await this.chainContext.multiCall3.callStatic.aggregate3(
      callMapping.map((t) => {
        return {
          target: t.token.address,
          callData: t.callData,
          allowFailure: false,
        };
      }),
    );

    const allowanceInfos = callMapping.map((t, i) => {
      const contract = t.contract;
      const [allowance] = contract.interface.decodeFunctionResult('allowance', res[i].returnData) as [BigNumber];
      return {
        token: t.token,
        allowance,
      };
    });

    if (allowanceInfos?.length) {
      allowanceInfos.forEach((allowanceInfo) => {
        this.updateAllowanceCache({
          userAddr,
          token: allowanceInfo.token,
          spender,
          allowance: allowanceInfo.allowance,
          block: block || 0,
        });
      });
    }

    return {
      block: block || 0,
      data: allowanceInfos,
    };
  };

  updateAllowanceCache({
    userAddr,
    token,
    spender,
    allowance,
    block,
  }: {
    userAddr: string;
    token: Token;
    spender: string;
    allowance: BigNumber;
    block: number;
  }): void {
    if (!allowance || !token?.address || !spender) return;
    const cachedAllowanceInfo = _.get(this.erc20AllowanceMap, [token.address, spender]);

    // if allowance changed, emit event
    if (!cachedAllowanceInfo || !allowance.eq(cachedAllowanceInfo?.data || 0)) {
      emitWorkerEvent<WorkerAllowanceResult>(WorkerEventNames.UpdateTokenAllowanceEvent, {
        chainId: this.chainId,
        userAddr,
        block: block,
        token,
        allowanceInfo: {
          spender: spender,
          allowance: allowance,
        },
      });
    }
    _.set(this.erc20AllowanceMap, [token.address, spender], {
      data: allowance,
      block,
    });
  }
}

export class UserWorker {
  static instances: Map<number, UserWorker> = new Map();

  [chainId: number]: ChainUserWorker;

  polling?: NodeJS.Timeout;

  public static async getInstance(chainId: number): Promise<UserWorker> {
    let instance = this.instances.get(chainId);
    if (!instance) {
      instance = new UserWorker();
      this.instances.set(chainId, instance);
    }
    return instance;
  }
  getChainInstance(chainId: CHAIN_ID): ChainUserWorker {
    let chainInstance = this[chainId];
    if (!chainInstance) {
      chainInstance = new ChainUserWorker(chainId);
      this[chainId] = chainInstance;
    }
    return chainInstance;
  }

  clearPolling(): void {
    if (this.polling) {
      clearInterval(this.polling);
    }
  }
  pollingFetchNativeTokenBalance = async (chainId: number, userAddr: string): Promise<void> => {
    this.clearPolling();
    const chainInstance = this.getChainInstance(chainId);
    this.polling = pollingFunc(
      async () => {
        // const blockNumber = await chainInstance.provider.getBlockNumber();
        chainInstance.fetchNativeTokenBalance(userAddr);
        // chainInstance.fetchNativeTokenBalance(blockNumber);
      },
      5000,
      true,
    );
  };

  watchERC20Balance = async (chainId: number, userAddr: string, token: Token): Promise<void> => {
    const chainInstance = this.getChainInstance(chainId);
    chainInstance.watchERC20Balance(token, userAddr);
  };

  multicallBalance = async ({
    chainId,
    tokens,
    userAddr,
    block,
  }: {
    chainId: number;
    tokens: Token[];
    userAddr: string;
    block?: number;
  }): Promise<BlockyResult<{ token: Token; balance: BigNumber }[]>> => {
    const chainInstance = this.getChainInstance(chainId);
    if (!block) {
      // block = await chainInstance.provider.getBlockNumber();
    }
    const balanceInfos = await chainInstance.multicallBalance(tokens, userAddr, block);

    return balanceInfos;
  };

  // multicallBalance2 = async ({
  //   chainId,
  //   tokens,
  //   userAddr,
  //   block,
  // }: {
  //   chainId: number;
  //   tokens: Token[];
  //   userAddr: string;
  //   block?: number;
  // }): Promise<BlockyResult<{ token: Token; balance: BigNumber }[]>> => {
  //   const chainInstance = this.getChainInstance(chainId);
  //   if (!block) {
  //     block = await chainInstance.provider.getBlockNumber();
  //   }
  //   const balanceInfos = await chainInstance.multicallBalance2(tokens, userAddr, block);

  //   return balanceInfos;
  // };

  multicallAllowance = async ({
    chainId,
    tokens,
    userAddr,
    spender,
    block,
  }: {
    chainId: number;
    tokens: Token[];
    userAddr: string;
    spender: string;
    block?: number;
  }): Promise<
    | BlockyResult<
        {
          token: Token;
          allowance: BigNumber;
        }[]
      >
    | undefined
  > => {
    const chainInstance = this.getChainInstance(chainId);
    if (!block) {
      block = await chainInstance.provider.getBlockNumber();
    }
    const allowances = await chainInstance.multicallAllowance(tokens, spender, userAddr, block);

    return allowances;
  };

  callERC20Allowance = async ({
    chainId,
    token,
    spender,
    userAddr,
    block,
  }: {
    chainId: number;
    token: Token;
    spender: string;
    userAddr: string;
    block?: number;
  }): Promise<BlockyResult<BigNumber | undefined>> => {
    const chainInstance = this.getChainInstance(chainId);
    if (!block) {
      block = await chainInstance.provider.getBlockNumber();
    }
    const allowanceInfo = await chainInstance.callERC20Allowance({
      token,
      spender,
      userAddr,
      block,
    });
    return allowanceInfo;
  };
}

onmessage = async (e) => {
  try {
    const event = e.data as WorkerEvent;
    if (event.eventName === WorkerEventNames.BalanceEvent) {
      const { chainId, userAddr, token } = event.data;
      if (userAddr === DEFAULT_EMPTY_ACCOUNT) return;
      const userWorker = await UserWorker.getInstance(chainId);
      if (token) {
        if (isNativeTokenAddr(token.address)) {
          // UserWorker.instances.forEach((userWorker) => {
          //   userWorker.clearPolling();
          // });
          // userWorker.pollingFetchNativeTokenBalance(chainId);
        } else {
          userWorker.watchERC20Balance(chainId, userAddr, event.data.token);
        }
      }
    } else if (event.eventName === WorkerEventNames.MulticallTokensAllowance) {
      const { chainId, tokens, spender, userAddr, block } = event.data;
      if (userAddr === DEFAULT_EMPTY_ACCOUNT) return;
      const userWorker = await UserWorker.getInstance(chainId);
      if (tokens?.length) {
        userWorker.multicallAllowance({ chainId, tokens, userAddr, spender, block });
      }
    } else if (event.eventName === WorkerEventNames.MulticallBalance) {
      const { chainId, userAddr, tokens } = event.data;
      if (userAddr === DEFAULT_EMPTY_ACCOUNT) return;
      const userWorker = await UserWorker.getInstance(chainId);
      if (tokens?.length) {
        userWorker.multicallBalance({ chainId, userAddr, tokens });
      }
    }
  } catch (error) {
    console.log('🚀 ~ file: UserWorker.ts:462 ~ error:', error);
  }
};
