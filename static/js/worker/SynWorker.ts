import './initWorker';

import { CHAIN_ID, Context, TokenInfo as Token } from '@derivation-tech/context';
import { DefaultEthGasEstimator, txPlugin } from '@derivation-tech/tx-plugin';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BaseContract, BigNumber, ethers } from 'ethers';
import _, { debounce } from 'lodash';

import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { POLLING_INSTRUMENT_SPOT_RAW_PRICE } from '@/constants/polling';
import { ISpotState } from '@/types/spot';
// import { fixBalanceNumberDecimalsTo18 } from '@/utils/token';
// import { pollingFunc } from '@/utils';
// import { emitWorkerEvent } from './helper';
import {
  BlockyResult,
  WorkerDispatchGateEventResult,
  WorkerDispatchInstrumentEventResult,
  WorkerDispatchPortfolioEventResult,
  WorkerEvent,
  // WorkerFuturesListResult,
  WorkerEventNames,
  WorkerFuturesResult,
  WorkerGateBalanceResult,
  WorkerInstrumentSpotRawPriceMapResult,
  WorkerInstrumentSpotStateMapResult,
  WorkerMarketPairInfoResult,
  WorkerOnInstrumentOrderUpdateResult,
  WorkerPortfolioResult,
} from '@/types/worker';
import { bigNumberObjectCheck, pollingFunc } from '@/utils';
import { reducePortfolio } from '@/utils/portfolio';
import { reduceFuturesForWorker } from '@/utils/worker';

import { ChainContextWorker } from './ChainContextWorker';
// import { BlockInfo } from '@derivation-tech/context';
import {
  Amm,
  FetchInstrumentParam,
  Instrument,
  MarketType,
  NATIVE_TOKEN_ADDRESS,
  Order,
  PERP_EXPIRY,
  Portfolio,
  Position,
  Range,
} from '@synfutures/sdks-perp';
import { Instrument as InstrumentContract, Instrument__factory } from '@synfutures/sdks-perp/dist/typechain';

import { vaultConfig } from '@/constants/launchpad/vault';
import { SPOT_HISTORY_GRAPH } from '@/constants/spot';
import SocketService from '@/entities/SocketService';
import { fetchFuturesInstrument, fetchFuturesPairInfo } from '@/features/futures/api';
import { IFuturesInstrument } from '@/types/futures';
import { IMarketPair } from '@/types/pair';

import {
  ISocketPerpEvent,
  ISocketPerpEventResult,
  MESSAGE_TYPE,
  SUBSCRIBE_TYPE,
  UNSUBSCRIBE_TYPE,
} from '@/types/socket';
import { aggregatorPlugin as aggregatorPlugin3 } from '@synfutures/sdks-aggregator';
import { aggregatorDataSourcePlugin as aggregatorDataSourcePlugin3 } from '@synfutures/sdks-aggregator-datasource';
import { perpPlugin } from '@synfutures/sdks-perp';
import { perpDataSourcePlugin } from '@synfutures/sdks-perp-datasource';
import { perpLaunchpadPlugin } from '@synfutures/sdks-perp-launchpad';
import { perpLaunchpadDataSourcePlugin } from '@synfutures/sdks-perp-launchpad-datasource';
import { emitWorkerEvent } from './helper';

const DEBOUNCE_API_TIME = 300;

const CALL_API_ON_WORKER = false;

export class ChainSynWorker {
  private static instances: Record<number, ChainSynWorker> = {};
  chainId: CHAIN_ID;
  chainContextWorker: ChainContextWorker;
  sdk?: Context;
  socketInstance: SocketService;

  instrumentMap: BlockyResult<Record<string, Instrument>>; // instrument address => instrument

  instrumentSpotStateMap: { [instrumentAddr: string]: BlockyResult<ISpotState> }; // instrument address => spot state

  gateBalanceMap: { [userAddr: string]: { [quoteAddr: string]: BlockyResult<BigNumber> } }; // user address => quote => gate balance

  instrumentSpotRawPriceMap: { [instrumentAddr: string]: BlockyResult<BigNumber> }; // instrument address => raw price

  portfolioMap: {
    [userAddr: string]: { [instrumentAddr: string]: { [expiry: number]: BlockyResult<Portfolio> } };
  }; // user address => futures address => expiry => portfolio

  listeningEvent: { [contractName: string]: { [listeningKey: string]: boolean } }; // contractName => listeningKey(user address/token address)  => listening

  instrumentContractMap: { [instrumentAddr: string]: InstrumentContract };

  marketPairInfo: { [pairId: string]: IMarketPair } = {};

  isRequestPair: {
    [pairId: string]: {
      [block: number]: boolean;
    };
  } = {};

  isRequestPortfolio: {
    [portfolioId: string]: {
      [block: number]: boolean;
    };
  } = {};

  isRequestBalance: {
    [userAddr: string]: {
      [tokenAddr: string]: {
        [block: number]: boolean;
      };
    };
  } = {};
  pollingTimers: { [key: string]: NodeJS.Timeout } = {};

  private blockNumberCache: { blockNumber: number; timestamp: number } | null = null;
  private readonly cacheDuration: number;
  watcherInstrumentAddr?: string;
  watcherAddr?: string;

  constructor(chainId: CHAIN_ID, cacheDuration = 500) {
    this.chainId = chainId;
    this.chainContextWorker = ChainContextWorker.getInstance(chainId);

    this.instrumentMap = {
      block: 0,
      data: {},
    };
    this.gateBalanceMap = {};
    this.listeningEvent = {};
    this.instrumentContractMap = {};
    this.portfolioMap = {};
    this.instrumentSpotStateMap = {};
    this.instrumentSpotRawPriceMap = {};
    this.cacheDuration = cacheDuration;
    this.socketInstance = this.initSocketInstance();
  }

  private async initSDK(chainId: CHAIN_ID) {
    const dappConfig = DAPP_CHAIN_CONFIGS[chainId];
    const vaultGraphAddr = (
      vaultConfig.chainConfig as unknown as {
        [id in CHAIN_ID]?: {
          chainId: number;
          tokens: string[];
          graphAddr: string;
        };
      }
    )[chainId]?.graphAddr;

    const ctx = new Context(chainId)
      .use(perpPlugin({ inverse: true }))
      .use(txPlugin({ gasLimitMultiple: 1.7, gasEstimator: new DefaultEthGasEstimator() }))
      .use(
        perpDataSourcePlugin({ endpoint: dappConfig.subgraph, inverse: true }), // dataSourcePlugin
      )
      .use(perpLaunchpadPlugin()) // vaultPlugin
      .use(perpLaunchpadDataSourcePlugin(vaultGraphAddr || '')) // vaultDataSourcePlugin
      .use(aggregatorPlugin3())
      .use(
        aggregatorDataSourcePlugin3(SPOT_HISTORY_GRAPH), // aggregatorDataSourcePlugin
      );
    ctx.setProvider(this.provider);
    await ctx.init();
    return ctx;
  }

  async init(): Promise<void> {
    await this.chainContextWorker.readProviderFromLocalOrSetting();
    this.sdk = await this.initSDK(this.chainId);
    this.sdk.setProvider(this.provider);
  }

  public static async getInstance(chainId: CHAIN_ID): Promise<ChainSynWorker> {
    let instance = this.instances[chainId];
    if (!instance) {
      instance = new ChainSynWorker(chainId);
      this.instances[chainId] = instance;
      await instance.init();
    }

    return instance;
  }

  get chainContext(): Context {
    return this.chainContextWorker.chainContext;
  }

  get provider(): JsonRpcProvider {
    return this.chainContextWorker.provider;
  }

  async getBlockNumber(): Promise<number> {
    const now = Date.now();

    // Check if the cache is valid
    if (this.blockNumberCache && now - this.blockNumberCache.timestamp < this.cacheDuration) {
      return this.blockNumberCache.blockNumber;
    }

    // If the cache is not valid, request the block number
    const blockNumber = await this.provider.getBlockNumber();

    // Update the cache
    this.blockNumberCache = {
      blockNumber,
      timestamp: now,
    };

    return blockNumber;
  }

  /**
   * Retrieves all futures from the chain.
   *
   * @param block - The block number to fetch futures from. If not provided, the latest block number will be used.
   * @returns A promise that resolves to a `BlockyResult` containing a record of futures indexed by their addresses and the block number.
   */
  async getAllFuturesFromChain(block?: number): Promise<BlockyResult<Record<string, Instrument>> | undefined> {
    if (!block) {
      block = await this.getBlockNumber();
    }
    if (!this.sdk) return;
    const futuresList = await this.sdk.perp.observer.getAllInstruments({ blockTag: block });
    if (futuresList.length > 0) {
      const futuresItem = futuresList[0];

      // if the block height is lower than the current block height, we don't need to update the state
      if ((futuresItem.blockInfo?.height || 0) < this.instrumentMap.block) {
        return this.instrumentMap;
      }
      block = futuresItem.blockInfo?.height || 0;
    }

    const futuresMap = futuresList.reduce((acc, futures) => {
      acc[futures.instrumentAddr.toLowerCase()] = futures;
      return acc;
    }, {} as Record<string, Instrument>);
    this.instrumentMap = { data: futuresMap, block };
    return { data: futuresMap, block };
  }

  /**
   * Retrieves an instrument from the chain.
   *
   * @param instrumentAddr - The address of the instrument.
   * @param expiry - The expiry of the instrument (optional).
   * @param block - The block number (optional).
   * @returns A promise that resolves to a `BlockyResult` containing the instrument model or `undefined`.
   */
  async getInstrumentFromChain(
    instrumentAddr: string,
    expiry?: number,
    block?: number,
  ): Promise<BlockyResult<Instrument | undefined>> {
    if (!block) {
      block = await this.getBlockNumber();
    }

    if (block) {
      // if the pair is already requested, block this request
      const isRequest = _.get(this.isRequestPair, [`${instrumentAddr}-${expiry}`.toLowerCase(), block]);
      if (!isRequest) {
        _.set(this.isRequestPair, [`${instrumentAddr}-${expiry}`.toLowerCase(), block], true);
      } else {
        return { data: undefined, block };
      }
    }

    if (this.sdk) {
      const instrumentList = await this.sdk.perp.observer.getInstrument(
        [
          {
            instrument: instrumentAddr,
            expiries: expiry ? [expiry] : [],
          },
        ],
        { blockTag: block },
      );
      if (instrumentList.length > 0) {
        const futuresItem = instrumentList[0];
        const cachedFuturesItem = _.get(this.instrumentMap, ['data', instrumentAddr]);
        // if the block height is lower than the current block height, we don't need to update the state
        if ((futuresItem.blockInfo?.height || 0) < this.instrumentMap.block) {
          return {
            data: cachedFuturesItem,
            block: this.instrumentMap.block,
          };
        }
        block = futuresItem.blockInfo?.height || 0;

        // if futures changed, emit event
        this.updateInstrumentCache(futuresItem, block);

        return {
          data: futuresItem,
          block,
        };
      }
    }
    return { data: undefined, block: block || 0 };
  }

  async batchInstrumentFromChain(
    params: FetchInstrumentParam[],
    block?: number,
  ): Promise<BlockyResult<Instrument[] | undefined>> {
    if (!block) {
      block = await this.getBlockNumber();
    }
    if (!params?.length) return { data: undefined, block };
    if (block && params?.length) {
      const firstPair = params[0];
      if (firstPair.expiries?.length) {
        // if the pair is already requested, block this request
        const isRequest = _.get(this.isRequestPair, [
          `${firstPair.instrument}-${firstPair.expiries.join('_')}`.toLowerCase(),
          block,
        ]);
        if (!isRequest) {
          _.set(
            this.isRequestPair,
            [`${firstPair.instrument}-${firstPair.expiries.join('_')}`.toLowerCase(), block],
            true,
          );
        } else {
          return { data: undefined, block };
        }
      }
    }

    if (this.sdk) {
      const instrumentList = await this.sdk.perp.observer.getInstrument(params, { blockTag: block });
      if (instrumentList.length > 0) {
        instrumentList.forEach((futuresItem) => {
          block = futuresItem.blockInfo?.height || 0;

          // if futures changed, emit event
          this.updateInstrumentCache(futuresItem, block);
        });

        return {
          data: instrumentList,
          block: this.instrumentMap.block,
        };
      }
    }
    return { data: undefined, block: block || 0 };
  }

  /**
   * Retrieves the spot state of an instrument from the blockchain.
   *
   * @param {Object} params - The parameters for retrieving the spot state.
   * @param {string} params.instrumentAddr - The address of the instrument.
   * @param {InstrumentModel} [params.instrument] - The instrument model.
   * @param {MarketType} [params.marketType] - The market type.
   * @param {number} [params.block] - The block number.
   * @returns {Promise<undefined>} A promise that resolves to undefined.
   */
  async getInstrumentSpotStateFromChain({
    instrumentAddr,
    instrument,
    marketType,
    block,
  }: {
    instrumentAddr: string;
    instrument?: Instrument;
    marketType?: MarketType;
    block?: number;
  }): Promise<undefined> {
    if (!this.sdk) return;
    if (!block) {
      block = await this.getBlockNumber();
    }
    if (!instrument) {
      instrument = _.get(this.instrumentMap, ['data', instrumentAddr]);
    }
    if (!marketType && instrument) {
      marketType = instrument.market.info.type as MarketType;
    }
    if (!instrument && !marketType) return;

    if (marketType) {
      const marketContract = this.sdk.perp.contracts.marketContracts[marketType];
      if (marketContract) {
        const spotState = await marketContract.market.getSpotState(instrumentAddr, { blockTag: block });
        this.updateSpotStateCache(instrumentAddr.toLowerCase(), spotState, block);
      }
    }
  }

  /**
   * Retrieves the raw spot price of an instrument from the chain.
   *
   * @param instrument - The instrument for which to retrieve the spot price.
   * @param block - The block number to use for retrieving the spot price. If not provided, the current block number will be used.
   * @returns A promise that resolves to a `BlockyResult` object containing the spot price and the block number, or `undefined` if the spot price is not available.
   */
  async getInstrumentRawSpotPriceFromChain(
    instrument: Instrument,
    block?: number,
  ): Promise<BlockyResult<BigNumber> | undefined> {
    try {
      if (!this.sdk) return;
      if (!block) {
        block = await this.getBlockNumber();
      }
      const cachedSpotPrice = _.get(this.instrumentSpotRawPriceMap, [instrument.instrumentAddr.toLowerCase()]);
      if (cachedSpotPrice?.block >= block) {
        return { data: cachedSpotPrice.data, block: cachedSpotPrice.block };
      }
      if (instrument) {
        const spotPrice = await this.sdk.perp.observer.getRawSpotPrice({
          marketType: instrument.market.info.type as MarketType,
          baseSymbol: instrument.base,
          quoteSymbol: instrument.quote,
        });
        _.set(this.instrumentSpotRawPriceMap, [instrument.instrumentAddr.toLowerCase()], { data: spotPrice, block });
        emitWorkerEvent<WorkerInstrumentSpotRawPriceMapResult>(WorkerEventNames.UpdateRawSpotPriceEvent, {
          instrumentSpotRawPriceMap: this.instrumentSpotRawPriceMap,
          block,
          chainId: this.chainId,
        });
        return { data: spotPrice, block };
      }
    } catch (error) {
      console.error('getInstrumentRawSpotPriceFromChain error:', error);
    }
  }

  updateInstrumentCache(instrument: Instrument, block: number): void {
    _.set(this.instrumentMap, ['block'], block);
    const instrumentAddr = instrument.instrumentAddr.toLowerCase();
    _.set(this.instrumentMap, ['data', instrumentAddr], instrument);
    const futuresRecord = reduceFuturesForWorker(this.chainId, {
      [instrument.instrumentAddr.toLowerCase()]: instrument,
    });

    // if futures changed, emit event
    emitWorkerEvent<WorkerFuturesResult>(WorkerEventNames.UpdateFuturesEvent, {
      futures: instrument,
      block,
      chainId: this.chainId,
      pairList: Array.from(instrument?.amms.values() || []),
      futuresRecord,
    });
  }

  updatePairCache(instrumentAddr: string, amm: Amm): void {
    const cachedFuturesItem = _.get(this.instrumentMap, ['data', instrumentAddr]);
    if (cachedFuturesItem) {
      const expiry = amm.expiry;
      cachedFuturesItem.amms.set(expiry, amm);
    }
  }

  updateSpotStateCache(instrumentAddr: string, spotState: ISpotState, block: number): void {
    spotState = bigNumberObjectCheck({
      raw: spotState.raw,
      spot: spotState.spot,
      time: spotState.time,
    });
    const cachedSpotState = _.get(this.instrumentSpotStateMap, [instrumentAddr]);
    if (!cachedSpotState) {
      _.set(this.instrumentSpotStateMap, [instrumentAddr, 'data'], spotState);
      _.set(this.instrumentSpotStateMap, [instrumentAddr, 'block'], block);
    } else {
      if (cachedSpotState.block < block) {
        _.set(this.instrumentSpotStateMap, [instrumentAddr, 'data'], spotState);
        _.set(this.instrumentSpotStateMap, [instrumentAddr, 'block'], block);
      }
    }
    // if futures changed, emit event
    emitWorkerEvent<WorkerInstrumentSpotStateMapResult>(WorkerEventNames.UpdateSpotStateEvent, {
      instrumentSpotStateMap: this.instrumentSpotStateMap,
      block,
      chainId: this.chainId,
    });
  }

  async getPortfolio({
    userAddr,
    instrumentAddr,
    expiry,
    block,
  }: {
    userAddr: string;
    instrumentAddr: string;
    expiry: number;
    block?: number;
  }): Promise<BlockyResult<Portfolio> | undefined> {
    try {
      if (!this.sdk) return;
      // if (!block) {
      //   block = await this.getBlockNumber();
      // }
      if (!instrumentAddr || !expiry) return;

      // if account is already requested, block this request
      const isRequest = _.get(this.isRequestPair, [
        `${userAddr}-${instrumentAddr}-${expiry}`.toLowerCase(),
        block || 0,
      ]);
      if (!isRequest) {
        _.set(this.isRequestPair, [`${userAddr}-${instrumentAddr}-${expiry}`.toLowerCase(), block || 0], true);
      } else {
        return undefined;
      }

      const portfolio = await this.sdk.perp.observer.getPortfolio(
        { traderAddr: userAddr, instrumentAddr, expiry },
        { blockTag: block },
      );
      // if the block height is lower than the current block height, we don't need to update the state
      const cachedPortfolio = _.get(this.portfolioMap, [userAddr, instrumentAddr, expiry]);

      if ((block || 0) < (cachedPortfolio?.block || 0)) {
        return cachedPortfolio;
      }
      // if pair level account changed, emit event
      this.updatePortfolioCache({
        userAddr,
        instrumentAddr,
        expiry,
        portfolio: portfolio,
        block: portfolio.blockInfo?.height || 0,
      });
    } catch (error) {
      console.error(`SynWorker  getPortfolio error`, error, {
        userAddr,
        instrumentAddr,
        expiry,
        block,
      });
    }
  }
  /**
   * Retrieves the portfolio list for a given user address.
   *
   * @param userAddr - The user address.
   * @param block - Optional block number.
   * @returns A promise that resolves to a `BlockyResult` containing a record of portfolios indexed by their addresses and the block number.
   */
  async getPortfolioList(
    userAddr: string,
    block?: number,
    needFetchInstruments?: boolean,
  ): Promise<BlockyResult<Record<string, Portfolio>> | undefined> {
    try {
      if (!this.sdk) return;
      if (!block) {
        block = await this.getBlockNumber();
      }

      // If instrumentMap is empty, fetch all futures from the chain
      if (Object.keys(this.instrumentMap.data).length === 0 || needFetchInstruments) {
        await this.getAllFuturesFromChain(block);
      }

      const instruments = Object.keys(this.instrumentMap.data);
      const fetchParams = instruments.map((instrumentAddr) => ({
        traderAddr: userAddr,
        instrumentAddr,
        expiry: PERP_EXPIRY, // Assuming perpetual expiry for all instruments
      }));

      let portfolioList = await this.sdk.perp.observer.getPortfolio(fetchParams, { blockTag: block });
      if (portfolioList && (portfolioList as unknown as Portfolio)?.instrumentAddr) {
        portfolioList = [portfolioList as unknown as Portfolio];
      }
      if (portfolioList.length > 0) {
        const portfolioItem = portfolioList[0];
        block = portfolioItem.blockInfo?.height || 0;
      }

      portfolioList.forEach((portfolio) => {
        const instrumentAddr = portfolio.instrumentAddr.toLowerCase();
        const expiry = portfolio.expiry;
        // if the block height is lower than the current block height, we don't need to update the state
        const cachedPortfolio = _.get(this.portfolioMap, [userAddr, instrumentAddr, expiry]);

        if ((block || 0) < (cachedPortfolio?.block || 0)) {
          return;
        }
        // if pair level account changed, emit event
        this.updatePortfolioCache({
          userAddr,
          instrumentAddr,
          expiry,
          portfolio: portfolio,
          block: block || portfolio.blockInfo?.height || 0,
        });
      });

      const portfolioMap = portfolioList.reduce((acc, portfolio) => {
        acc[portfolio.instrumentAddr.toLowerCase()] = portfolio;
        return acc;
      }, {} as Record<string, Portfolio>);
      return { data: portfolioMap, block };
    } catch (error) {
      console.error('getPortfolioList error:', error);
    }
  }

  updatePortfolioCache({
    userAddr,
    instrumentAddr,
    expiry,
    portfolio: portfolio,
    block,
  }: {
    userAddr: string;
    instrumentAddr: string;
    expiry: number;
    portfolio: Portfolio;
    block: number;
  }): void {
    if (!portfolio) return;

    _.set(this.portfolioMap, [userAddr, instrumentAddr, expiry, 'block'], block);

    _.set(this.portfolioMap, [userAddr, instrumentAddr, expiry, 'data'], portfolio);

    const reducedPortfolio = reducePortfolio(this.chainId, userAddr, instrumentAddr, portfolio);

    // if pair level account changed, emit event
    emitWorkerEvent<WorkerPortfolioResult>(WorkerEventNames.UpdatePortfolioEvent, {
      reducedPortfolio,
      block,
      chainId: this.chainId,
      userAddr,
      instrumentAddr,
      expiry,
    });
  }

  //TODO: remove unused function
  updatePositionCache({
    userAddr,
    instrumentAddr,
    expiry,
    position,
  }: {
    userAddr: string;
    instrumentAddr: string;
    expiry: number;
    position: Position;
  }): void {
    const cachedPortfolio = _.get(this.portfolioMap, [userAddr, instrumentAddr, expiry, 'data']);
    if (cachedPortfolio) {
      cachedPortfolio.position = position;
    }
  }
  //TODO: remove unused function
  updateOrderCache({
    userAddr,
    instrumentAddr,
    expiry,
    order,
  }: {
    userAddr: string;
    instrumentAddr: string;
    expiry: number;
    order: Order;
  }): void {
    const cachedPortfolio = _.get(this.portfolioMap, [userAddr, instrumentAddr, expiry, 'data']);
    if (cachedPortfolio) {
      if (!cachedPortfolio.orders) {
        cachedPortfolio.orders = new Map<number, Order>();
      }
      cachedPortfolio.orders.set(order.oid, order);
    }
  }
  //TODO: remove unused function
  updateRangeCache(userAddr: string, instrumentAddr: string, expiry: number, range: Range): void {
    const cachedPortfolio = _.get(this.portfolioMap, [userAddr, instrumentAddr, expiry, 'data']);
    if (cachedPortfolio) {
      if (!cachedPortfolio.ranges) {
        cachedPortfolio.ranges = new Map<number, Range>();
      }
      cachedPortfolio.ranges.set(range.rid, range);
    }
  }

  /**
   * Retrieves the gate balance from the chain for a given user address and tokens.
   *
   * @param userAddr - The user address.
   * @param tokens - An array of tokens.
   * @param block - Optional block number.
   * @returns A promise that resolves to an object containing the token balances and block number, or undefined.
   */
  async getGateBalanceFromChain(
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
    if (!this.sdk) return;
    if (tokens.length === 0) {
      return;
    }

    if (!block) {
      block = await this.getBlockNumber();
    }
    if (tokens.length === 1) {
      // if the balance is already requested, block this request
      const token = tokens[0];
      const isRequest = _.get(this.isRequestBalance, [userAddr, token.address, block]);
      if (!isRequest) {
        _.set(this.isRequestBalance, [userAddr, token.address, block], true);
      } else {
        return undefined;
      }
    }

    tokens = tokens.map((token) =>
      token.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() ? this.chainContext.wrappedNativeToken : token,
    );

    const quotes = tokens.map((t) => t.address);

    const [balances, blockInfo] = await this.sdk.perp.contracts.observer.getVaultBalances(userAddr, quotes, {
      blockTag: block,
    });
    if (blockInfo) {
      block = blockInfo[1];
    }
    tokens.forEach((token, index) => {
      const tokenAddress = token.address.toLowerCase();
      const balance = balances[index];
      // // if the block height is lower than the current block height, we don't need to update the state
      const cachedBalanceInfo = this.gateBalanceMap[userAddr]?.[token.address];

      // if balance changed, emit event
      if (!balance.eq(cachedBalanceInfo?.data || -1)) {
        emitWorkerEvent<WorkerGateBalanceResult>(WorkerEventNames.UpdateGateBalanceEvent, {
          gateBalance: balance,
          chainId: this.chainId,
          userAddr: userAddr,
          token: { ...token, address: tokenAddress },
          block: block || 0,
        });
      }
      _.set(this.gateBalanceMap, [userAddr, tokenAddress], { block, data: balance });
    });

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

  async getToken(tokenAddr: string): Promise<Token> {
    if (tokenAddr.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) return this.chainContext.wrappedNativeToken;
    const cachedToken = this.chainContext.info.erc20.find(
      (token) => token.address?.toLowerCase() === tokenAddr.toLowerCase(),
    );
    if (cachedToken) return { ...cachedToken, address: cachedToken.address.toLowerCase() };

    const token = await this.chainContext.getTokenInfo(tokenAddr);
    if (token) {
      return {
        ...token,
        address: token.address?.toLowerCase(),
      };
    }
    return token;
  }

  /**
   * watch vault contract deposit/withdraw/adjustMargin event
   * @param userAddr
   * @param token
   */
  WatchGateContract(userAddr: string): void {
    if (!this.sdk) return;
    const gateContract = this.sdk.perp.contracts.gate;
    const chainId = this.chainId;

    if (this.listeningEvent['gate']?.[`${chainId}-${userAddr}`.toLowerCase()]) {
      return;
    }

    _.set(this.listeningEvent, ['gate', `${chainId}-${userAddr}`.toLowerCase()], true);

    (gateContract as unknown as BaseContract).once(
      {
        topics: [
          [
            // has trader's event
            gateContract.interface.getEventTopic('Deposit'),
            gateContract.interface.getEventTopic('Withdraw'),
            gateContract.interface.getEventTopic('Scatter'),
            gateContract.interface.getEventTopic('Gather'),
          ],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          null as any,
          ethers.utils.hexZeroPad(userAddr, 32),
        ],
      },
      async (event) => {
        const parsedLog = gateContract.interface.parseLog(event);

        const quote = parsedLog.args.quote;
        const trader = parsedLog.args.trader?.toLowerCase();

        const token = await this.getToken(quote);
        console.log('gateContract event:', parsedLog.name, 'args:', parsedLog.args, token, trader);
        token && trader && this.getGateBalanceFromChain(userAddr, [token], event.blockNumber);
      },
    );

    (gateContract as unknown as BaseContract).once(
      {
        topics: [[gateContract.interface.getEventTopic('NewInstrument')]],
      },
      async (event) => {
        const parsedLog = gateContract.interface.parseLog(event);

        const instrument = parsedLog.args.instrument;

        console.log('gateContract event:', parsedLog.name, 'args:', parsedLog.args, instrument);

        // TODO: check expiry exist
        const instrumentModel = await this.getInstrumentFromChain(instrument, undefined, event.blockNumber);
        if (instrumentModel.data) {
          this.pollingInstrument(instrumentModel.data?.instrumentAddr.toLowerCase());
          this.batchInstrumentFromChain(
            [
              {
                instrument: instrumentModel.data?.instrumentAddr.toLowerCase(),
                expiries: Array.from(instrumentModel.data.amms.values()).map((amm) => amm.expiry),
              },
            ],
            event.blockNumber,
          );
        }
      },
    );
  }

  getInstrumentContract(instrumentAddr: string): InstrumentContract {
    instrumentAddr = instrumentAddr.toLowerCase();
    let instrumentContract = this.instrumentContractMap[instrumentAddr];
    if (!instrumentContract) {
      instrumentContract = Instrument__factory.connect(instrumentAddr, this.provider);
      _.set(this.instrumentContractMap, [instrumentAddr], instrumentContract);
    }

    return instrumentContract;
  }

  watchInstrumentUpdateContract(instrumentAddr: string): void {
    const instrumentContract = this.getInstrumentContract(instrumentAddr);
    const chainId = this.chainId;

    if (this.listeningEvent['instrument']?.[`${chainId}-${instrumentAddr}`.toLowerCase()]) {
      return;
    }
    _.set(this.listeningEvent, ['instrument', `${chainId}-${instrumentAddr}`.toLowerCase()], true);

    (instrumentContract as BaseContract).on(
      {
        topics: [
          [
            // instrument event
            instrumentContract.interface.getEventTopic('UpdateAmmStatus'),
            instrumentContract.interface.getEventTopic('UpdateSocialLossInsuranceFund'),
            // instrumentContract.interface.getEventTopic('UpdateFundingIndex'), // PERP_EXPIRY , temp remove for performance
          ],
        ],
      },
      (event) => {
        const parsedLog = instrumentContract.interface.parseLog(event);

        const expiry = parsedLog.args.expiry;
        const trader = parsedLog.args.trader?.toLowerCase();
        console.log('watchInstrumentUpdateContract event:', parsedLog.name, 'args:', parsedLog.args, expiry, trader);
        expiry && this.getInstrumentFromChain(instrumentAddr, expiry, event.blockNumber);
        if ('UpdateFundingIndex' === parsedLog.name) {
          this.getInstrumentFromChain(instrumentAddr, PERP_EXPIRY, event.blockNumber);
        }
      },
    );
  }

  watchAccountUpdateContact(instrumentAddr: string, userAddr: string): void {
    const instrumentContract = this.getInstrumentContract(instrumentAddr);
    const chainId = this.chainId;

    if (this.listeningEvent['instrument']?.[`${chainId}-${instrumentAddr}-${userAddr}`.toLowerCase()]) {
      return;
    }
    _.set(this.listeningEvent, ['instrument', `${chainId}-${instrumentAddr}-${userAddr}`.toLowerCase()], true);
    const eventFilter = {
      topics: [
        [
          // has trader's event
          instrumentContract.interface.getEventTopic('Place'),
          instrumentContract.interface.getEventTopic('Settle'),
          instrumentContract.interface.getEventTopic('Cancel'),
          instrumentContract.interface.getEventTopic('Fill'),
          instrumentContract.interface.getEventTopic('Adjust'),
          instrumentContract.interface.getEventTopic('Trade'),
          instrumentContract.interface.getEventTopic('Sweep'),
          instrumentContract.interface.getEventTopic('Add'),
          instrumentContract.interface.getEventTopic('Remove'),
          instrumentContract.interface.getEventTopic('Liquidate'),
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        null as any,
        ethers.utils.hexZeroPad(userAddr, 32),
      ],
    };
    (instrumentContract as BaseContract).on(eventFilter, (event) => {
      const parsedLog = instrumentContract.interface.parseLog(event);

      const expiry = parsedLog.args.expiry;
      const trader = parsedLog.args.trader?.toLowerCase();
      console.log('watchAccountUpdateContact event:', parsedLog.name, 'args:', parsedLog.args, expiry, trader);
      if (trader !== userAddr.toLowerCase()) {
        return;
      }
      expiry && trader && this.getPortfolio({ userAddr: trader, instrumentAddr, expiry, block: event.blockNumber });
      if (['Place', 'Cancel', 'Fill'].includes(parsedLog.name)) {
        if (trader === userAddr.toLowerCase()) {
          // emit event
          emitWorkerEvent<WorkerOnInstrumentOrderUpdateResult>(WorkerEventNames.OnInstrumentOrderUpdateEvent, {
            block: event.blockNumber,
            chainId: this.chainId,
            userAddr: trader,
            instrumentAddr,
            expiry,
            eventName: parsedLog.name,
            transactionHash: event.transactionHash,
            // event: event,
            eventArgs: parsedLog.args,
          });
        }
      }
    });
  }

  watchSocketEvent(userAddr: string, watcherInstrumentAddr?: string): void {
    const chainId = this.chainId;
    const socket = this.socketInstance;
    if (!socket || !chainId) return;
    this.watcherAddr = userAddr;
    if (watcherInstrumentAddr) this.watcherInstrumentAddr = watcherInstrumentAddr;
    if (socket?.socket && socket?.socket?.hasListeners(MESSAGE_TYPE.perpEvent)) {
      return;
    } else {
      socket.emit(SUBSCRIBE_TYPE.EVENT, { chainId: chainId });

      socket.on(MESSAGE_TYPE.perpEvent, (data: ISocketPerpEventResult) => {
        // console.record('socket', MESSAGE_TYPE.perpEvent, data);
        if (data.chainId === chainId) {
          data.event.forEach((event) => {
            this.handleSocketEvent({
              contractAddress: event.contractAddress?.toLowerCase(),
              contractType: event.contractType,
              eventName: event.eventName,
              eventArgs: event.eventArgs,
              blockNum: event.blockNum,
              event,
            });
          });
        }
      });
    }
  }

  removeSocketEvent(): void {
    const chainId = this.chainId;
    const socket = this.socketInstance;
    if (!socket || !chainId) return;
    socket.emit(UNSUBSCRIBE_TYPE.EVENT, { chainId: chainId });
    socket.off(MESSAGE_TYPE.perpEvent);
  }

  async handleSocketEvent({
    contractAddress,
    contractType,
    eventName,
    eventArgs,
    blockNum,
    event,
  }: {
    contractAddress: string;
    contractType: 'instrument' | 'gate';
    eventName: string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    eventArgs: any;
    event: ISocketPerpEvent;
    blockNum?: number;
  }) {
    const userAddr = this.watcherAddr;
    const watcherInstrumentAddr = this.watcherInstrumentAddr;
    const trader = eventArgs?.trader?.toLowerCase();

    if (contractType === 'instrument') {
      const expiry = eventArgs?.expiry;

      if (['UpdateAmmStatus', 'UpdateSocialLossInsuranceFund'].includes(eventName)) {
        const expiry = eventArgs?.expiry;
        if (watcherInstrumentAddr && watcherInstrumentAddr !== contractAddress) return;
        // contractAddress && expiry && this.getInstrumentFromChain(contractAddress, expiry, blockNum);
        if (contractAddress && expiry) {
          if (CALL_API_ON_WORKER) this.getInstrumentWithFallback({ instrumentAddr: contractAddress, expiry });
          else
            this.dispatchInstrumentUpdateEvent({
              instrumentAddr: contractAddress,
              expiry,
              eventName,
              eventArgs,
              txHash: event.txHash,
              trader,
            });
        }

        if ('UpdateFundingIndex' === eventName) {
          // contractAddress && this.getInstrumentFromChain(contractAddress, PERP_EXPIRY, blockNum);
          if (contractAddress) {
            if (CALL_API_ON_WORKER)
              this.getInstrumentWithFallback({ instrumentAddr: contractAddress, expiry: PERP_EXPIRY });
            else
              this.dispatchInstrumentUpdateEvent({
                instrumentAddr: contractAddress,
                expiry: PERP_EXPIRY,
                eventName,
                eventArgs,
                txHash: event.txHash,
                trader,
              });
          }
        }
      } else if (
        ['Place', 'Settle', 'Cancel', 'Fill', 'Adjust', 'Trade', 'Sweep', 'Add', 'Remove', 'Liquidate'].includes(
          eventName,
        )
      ) {
        if (watcherInstrumentAddr && watcherInstrumentAddr !== contractAddress) return;

        // also call instrument
        // if (['Trade', 'Add', 'Remove'].includes(eventName))

        if (contractAddress && expiry) {
          if (CALL_API_ON_WORKER) this.getInstrumentWithFallback({ instrumentAddr: contractAddress, expiry });
          else
            this.dispatchInstrumentUpdateEvent({
              instrumentAddr: contractAddress,
              expiry,
              eventName,
              eventArgs,
              txHash: event.txHash,
              trader,
            });
        }
        if (!userAddr) return;
        if (trader !== userAddr.toLowerCase()) {
          return;
        }
        console.log('instrumentContact event:', eventName, 'args:', {
          eventArgs,
          expiry,
          trader,
          watcherInstrumentAddr,
        });

        if (contractAddress && expiry) {
          if (CALL_API_ON_WORKER)
            this.getPortfolioWithFallback({
              userAddr: trader,
              instrumentAddr: contractAddress,
              expiry,
            });
          else
            expiry &&
              trader &&
              this.dispatchPortfolioUpdateEvent({
                instrumentAddr: contractAddress,
                expiry,
                eventName,
                eventArgs,
                txHash: event.txHash,
                trader,
              });
        }

        if (['Place', 'Cancel', 'Fill'].includes(eventName)) {
          if (trader === userAddr.toLowerCase()) {
            // emit event
            emitWorkerEvent<WorkerOnInstrumentOrderUpdateResult>(WorkerEventNames.OnInstrumentOrderUpdateEvent, {
              block: blockNum || 0,
              chainId: this.chainId,
              userAddr: trader,
              instrumentAddr: contractAddress,
              expiry,
              eventName: eventName,
              transactionHash: event.txHash,
              // event: event,
              eventArgs,
            });
          }
        }
      }
    } else if (contractType === 'gate') {
      if (eventName === 'NewInstrument') {
        const instrument = eventArgs?.instrument;
        if (!instrument) return;
        // this.getInstrumentFromChain(instrument, undefined, blockNum);
        this.getInstrumentWithFallback({ instrumentAddr: instrument });
      } else {
        if (!userAddr) return;
        const quote = eventArgs?.quote;
        if (userAddr.toLowerCase() !== trader) return;
        const token = await this.getToken(quote);
        console.log('gateContract event:', eventName, 'args:', { eventArgs, trader });
        token && this.getGateBalanceFromChain(userAddr, [token], blockNum);
        this.dispatchGateUpdateEvent({
          eventName,
          eventArgs,
          txHash: event.txHash,
          userAddr: trader,
          token: token,
          block: blockNum || 0,
        });
      }
    }
  }

  removeAllInstrumentListeners(): void {
    Object.values(this.instrumentContractMap).forEach((instrumentContract) => {
      instrumentContract.removeAllListeners();
    });
    _.set(this.listeningEvent, ['instrument'], {});
  }

  removeAllGateListeners(): void {
    if (this.sdk) {
      const gateContract = this.sdk.perp.contracts.gate;
      gateContract.removeAllListeners();
      _.set(this.listeningEvent, ['gate'], {});
    }
  }

  async pollingInstrument(instrumentAddr: string): Promise<void> {
    if (this.pollingTimers[instrumentAddr]) return;
    let instrument = _.get(this.instrumentMap, ['data', instrumentAddr]);
    if (!instrument) {
      const res = await this.getInstrumentFromChain(instrumentAddr);
      if (res.data) instrument = res.data;
    }
    if (instrument) {
      const timer = pollingFunc(() => {
        this.getInstrumentFromChain(instrumentAddr);
        this.getInstrumentRawSpotPriceFromChain(instrument);
        this.getInstrumentSpotStateFromChain({
          instrumentAddr,
          instrument,
          marketType: instrument.market.info.type as MarketType,
        });
      }, POLLING_INSTRUMENT_SPOT_RAW_PRICE);

      this.pollingTimers[instrumentAddr] = timer;
    }
  }

  initSocketInstance(): SocketService {
    if (this.socketInstance) {
      return this.socketInstance;
    }
    const socketS = SocketService.getInstance();
    const socketInstance = socketS.connect();
    return socketInstance;
  }

  /**
   * Retrieves an instrument from the api.
   *
   * @param instrumentAddr - The address of the instrument.
   * @returns A promise that resolves to a `BlockyResult` containing the instrument model or `undefined`.
   */
  getInstrumentWithFallback = debounce(
    async ({
      instrumentAddr,
      expiry,
    }: {
      instrumentAddr: string;
      expiry?: number;
    }): Promise<BlockyResult<IFuturesInstrument | undefined>> => {
      try {
        // First try to get from API
        const apiResult = await this.getInstrumentFromApi({ instrumentAddr, expiry });
        if (apiResult?.data) {
          return apiResult;
        }
        throw new Error('API returned no data');
      } catch (apiError) {
        console.warn('API request failed, falling back to chain:', apiError);
        try {
          // If API fails, fall back to chain request
          const chainResult = await this.getInstrumentFromChain(instrumentAddr, expiry);
          return chainResult;
        } catch (chainError) {
          console.error('Both API and chain requests failed:', chainError);
          throw new Error('Failed to fetch instrument from both API and chain');
        }
      }
    },
    DEBOUNCE_API_TIME,
  );

  /**
   * Retrieves an instrument from the api.
   *
   * @param instrumentAddr - The address of the instrument.
   * @returns A promise that resolves to a `BlockyResult` containing the instrument model or `undefined`.
   */
  getInstrumentFromApi = debounce(
    async ({
      instrumentAddr,
    }: {
      instrumentAddr: string;
      expiry?: number;
    }): Promise<BlockyResult<IFuturesInstrument | undefined>> => {
      // expiry && this.getMarketPairInfoFromApi(instrumentAddr, expiry);
      const instrument = await fetchFuturesInstrument(this.chainId, instrumentAddr);
      if (instrument) {
        const futuresItem = instrument;
        const block = futuresItem.blockInfo?.height || 0;

        // if futures changed, emit event
        this.updateInstrumentCache(futuresItem, block);

        return {
          data: futuresItem,
          block,
        };
      }
      return { data: undefined, block: 0 };
    },
    DEBOUNCE_API_TIME,
  );

  // getPortfolioFromApi = debounce(
  //   async ({
  //     userAddr,
  //     instrumentAddr,
  //     expiry,
  //   }: {
  //     userAddr: string;
  //     instrumentAddr?: string;
  //     expiry?: number;
  //   }): Promise<BlockyResult<Portfolio> | undefined> => {
  //     // expiry && this.getMarketPairInfoFromApi(instrumentAddr, expiry);
  //     const portfolioList = await fetchPortfolioListFromApi(this.chainId, userAddr, instrumentAddr, expiry);
  //     if (portfolioList?.length) {
  //       const portfolioItem = portfolioList[0];
  //       const block = portfolioItem.blockInfo?.height || 0;

  //       // if futures changed, emit event
  //       this.updatePortfolioCache({
  //         userAddr,
  //         instrumentAddr: portfolioItem.instrumentAddr,
  //         expiry: portfolioItem.expiry,
  //         portfolio: portfolioItem,
  //         block,
  //       });

  //       return {
  //         data: portfolioItem,
  //         block,
  //       };
  //     }
  //   },
  //   DEBOUNCE_API_TIME,
  // );

  getPortfolioWithFallback = debounce(
    async ({
      userAddr,
      instrumentAddr,
      expiry,
    }: {
      userAddr: string;
      instrumentAddr?: string;
      expiry?: number;
    }): Promise<BlockyResult<Portfolio> | undefined> => {
      try {
        // TODO: a bug here, worker can't run
        // First try to get from API
        // const apiResult = await this.getPortfolioFromApi({ userAddr, instrumentAddr, expiry });
        // if (apiResult?.data) {
        //   return apiResult;
        // }
        throw new Error('API returned no data');
      } catch (apiError) {
        console.warn('API request failed, falling back to chain:', apiError);
        try {
          // If API fails, fall back to chain request
          if (instrumentAddr && expiry) {
            const chainResult = await this.getPortfolio({ userAddr, instrumentAddr, expiry });
            return chainResult;
          }
        } catch (chainError) {
          console.error('Both API and chain requests failed:', chainError);
          throw new Error('Failed to fetch instrument from both API and chain');
        }
      }
    },
    DEBOUNCE_API_TIME,
  );

  /**
   * Retrieves an instrument from the api.
   *
   * @param instrumentAddr - The address of the instrument.
   * @returns A promise that resolves to a `BlockyResult` containing the instrument model or `undefined`.
   */
  dispatchInstrumentUpdateEvent = debounce(
    async ({
      instrumentAddr,
      expiry,
      eventName,
      eventArgs,
      txHash,
      trader,
    }: {
      instrumentAddr: string;
      expiry?: number;
      eventName: string;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      eventArgs: any;
      txHash: string;
      trader?: string;
    }) => {
      emitWorkerEvent<WorkerDispatchInstrumentEventResult>(WorkerEventNames.DispatchInstrumentUpdateEvent, {
        instrumentAddr,
        expiry,
        eventName,
        eventArgs,
        transactionHash: txHash,
        chainId: this.chainId,
        trader,
      });
    },
    DEBOUNCE_API_TIME,
  );

  dispatchPortfolioUpdateEvent = debounce(
    async ({
      instrumentAddr,
      expiry,
      eventName,
      eventArgs,
      txHash,
      trader,
    }: {
      instrumentAddr: string;
      expiry?: number;
      eventName: string;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      eventArgs: any;
      txHash: string;
      trader?: string;
    }) => {
      emitWorkerEvent<WorkerDispatchPortfolioEventResult>(WorkerEventNames.DispatchPortfolioUpdateEvent, {
        instrumentAddr,
        expiry,
        eventName,
        eventArgs,
        transactionHash: txHash,
        chainId: this.chainId,
        trader,
      });
    },
    DEBOUNCE_API_TIME,
  );

  dispatchGateUpdateEvent = debounce(
    async ({
      eventName,
      eventArgs,
      txHash,
      userAddr: userAddr,
      block,
    }: {
      userAddr: string;
      token: Token;
      block: number;

      eventName: string;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      eventArgs: any;
      txHash: string;
    }) => {
      emitWorkerEvent<WorkerDispatchGateEventResult>(WorkerEventNames.DispatchGateUpdateEvent, {
        eventName,
        eventArgs,
        transactionHash: txHash,
        chainId: this.chainId,
        userAddr: userAddr,
        block,
      });
    },
    DEBOUNCE_API_TIME,
  );

  /**
   * Retrieves an instrument from the chain.
   *
   * @param instrumentAddr - The address of the instrument.
   * @param expiry - The expiry of the instrument (optional).
   * @returns A promise that resolves to a `BlockyResult` containing the instrument model or `undefined`.
   */
  getMarketPairInfoFromApi = debounce(
    async (instrumentAddr: string, expiry: number): Promise<IMarketPair | undefined> => {
      const pairInfo = await fetchFuturesPairInfo({ chainId: this.chainId, address: instrumentAddr, expiry });
      if (pairInfo) {
        // this.updatePairInfoCache(instrumentAddr, expiry, pairInfo);

        return pairInfo;
      }
    },
    DEBOUNCE_API_TIME,
  );

  updatePairInfoCache(instrumentAddr: string, expiry: number, pairInfo: IMarketPair): void {
    const pairId = pairInfo.id;

    let isDiff = false;
    const cachedPairInfo = _.get(this.marketPairInfo, [pairId]);
    if (!cachedPairInfo || !_.isEqual(cachedPairInfo, pairInfo)) {
      _.set(this.marketPairInfo, [pairId], pairInfo);
      isDiff = true;
    }

    if (isDiff)
      // if futures changed, emit event
      emitWorkerEvent<WorkerMarketPairInfoResult>(WorkerEventNames.UpdateMarketPairInfoEvent, {
        pairInfo: pairInfo,
        chainId: this.chainId,
      });
  }

  async pollingInstrumentFromApi(instrumentAddr: string): Promise<void> {
    if (this.pollingTimers[instrumentAddr]) return;
    let instrument = _.get(this.instrumentMap, ['data', instrumentAddr]);
    if (!instrument) {
      const res = await this.getInstrumentFromApi({ instrumentAddr });
      if (res?.data) instrument = res.data;
    }
    if (instrument) {
      const timer = pollingFunc(() => {
        this.getInstrumentFromApi({ instrumentAddr });
      }, POLLING_INSTRUMENT_SPOT_RAW_PRICE);

      this.pollingTimers[instrumentAddr] = timer;
    }
  }
}

onmessage = async (e) => {
  try {
    const event = e.data as WorkerEvent;
    if (event.eventName === WorkerEventNames.WatchGateEvent) {
      const { chainId, userAddr } = event.data;
      if (!userAddr) return;
      const worker = await ChainSynWorker.getInstance(chainId);
      _.debounce(() => {
        worker.watchSocketEvent(userAddr);
      }, 300)();
    } else if (event.eventName === WorkerEventNames.UpdateFuturesEvent) {
      const { chainId, instrumentAddr } = event.data;
      const worker = await ChainSynWorker.getInstance(chainId);
      if (instrumentAddr && worker) {
        // worker.removeAllListeners();
        setTimeout(() => {
          // worker.watchInstrumentUpdateContract(instrumentAddr);
        }, 1000);
      }
    } else if (event.eventName === WorkerEventNames.InstrumentUpdateEvent) {
      const { chainId, userAddr, instrumentAddr } = event.data;
      const worker = await ChainSynWorker.getInstance(chainId);
      if (instrumentAddr && userAddr && worker) {
        // worker.removeAllListeners();
        _.debounce(() => {
          worker.watchSocketEvent(userAddr?.toLowerCase(), instrumentAddr);
          // worker.watchInstrumentUpdateContract(instrumentAddr);
          // worker.watchAccountUpdateContact(instrumentAddr, userAddr?.toLowerCase());
        }, 300)();
      }
    } else if (event.eventName === WorkerEventNames.FetchPair) {
      // const { chainId, instrumentAddr, expiry } = event.data;
      // const worker = await ChainSynWorker.getInstance(chainId);
      // if (instrumentAddr) {
      //   // worker.getInstrumentFromChain(instrumentAddr, expiry, blockNumber);
      //   worker.getInstrumentWithFallback({ instrumentAddr, expiry });
      // }
    } else if (event.eventName === WorkerEventNames.BatchPairs) {
      const { chainId, params, blockNumber } = event.data;
      const worker = await ChainSynWorker.getInstance(chainId);
      if (params && params.length) {
        worker.batchInstrumentFromChain(params, blockNumber);
      }
    } else if (event.eventName === WorkerEventNames.FetchPortfolio) {
      const { chainId, instrumentAddr, expiry, userAddr, blockNumber } = event.data;
      const worker = await ChainSynWorker.getInstance(chainId);
      if (worker && instrumentAddr && userAddr) {
        worker.getPortfolio({ userAddr, instrumentAddr, expiry, block: blockNumber });
      }
    } else if (event.eventName === WorkerEventNames.FetchPortfolioList) {
      const { chainId, userAddr, blockNumber, needFetchInstruments } = event.data;
      const worker = await ChainSynWorker.getInstance(chainId);
      if (worker && userAddr) {
        worker.getPortfolioList(userAddr, blockNumber, needFetchInstruments);
      }
    } else if (event.eventName === WorkerEventNames.FetchGateBalance) {
      const { chainId, tokens, userAddr, blockNumber } = event.data;
      const worker = await ChainSynWorker.getInstance(chainId);
      if (worker && tokens && tokens.length && userAddr) {
        worker.getGateBalanceFromChain(userAddr, tokens, blockNumber);
      }
    } else if (event.eventName === WorkerEventNames.RemoveAllInstrumentEventListener) {
      // const { chainId } = event.data;
      // const worker = await ChainSynWorker.getInstance(chainId);
      // if (chainId && worker) {
      //   worker.removeAllInstrumentListeners();
      // }
    } else if (event.eventName === WorkerEventNames.RemoveAllGateEventListener) {
      // const { chainId } = event.data;
      // const worker = await ChainSynWorker.getInstance(chainId);
      // if (chainId && worker) {
      //   worker.removeAllGateListeners();
      // }
    } else if (event.eventName === WorkerEventNames.FetchInstrumentSpotState) {
      const { chainId, instrumentAddr, blockNumber, marketType } = event.data;
      const worker = await ChainSynWorker.getInstance(chainId);
      if (worker && instrumentAddr) {
        worker.getInstrumentSpotStateFromChain({ instrumentAddr, block: blockNumber, marketType });
      }
    } else if (event.eventName === WorkerEventNames.PollingFetchInstrument) {
      const { chainId, instrumentAddr } = event.data;
      const worker = await ChainSynWorker.getInstance(chainId);
      if (worker && instrumentAddr) {
        // worker.pollingInstrumentFromApi(instrumentAddr);
      }
    } else if (event.eventName === WorkerEventNames.RemoveAllSocketEventListener) {
      const { chainId } = event.data;
      const worker = await ChainSynWorker.getInstance(chainId);
      if (chainId && worker) {
        worker.removeSocketEvent();
      }
    }
  } catch (error) {
    console.error('🚀 ~ file: SynWorker.ts:142 ~ error:', error);
  }
};
