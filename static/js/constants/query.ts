import {
  getAccountBalanceHistory,
  getFundingHistory,
  getLiquidityHistory,
  getOrdersHistory,
  getTransferHistory,
  getVirtualTradeHistory,
} from '@/features/graph/api';
import { KlineInterval } from '@synfutures/sdks-perp-datasource';
import { SPOT_KLINE_INTERVAL } from './spot';

export const QUERY_KEYS = {
  GRAPH: {
    ALL_INSTRUMENTS_BASIC_INFO: (chainId?: number) => ['sdk.dataSource.statistics.getInstrumentsInfo', { chainId }],
    VIRTUAL_TRADE_HISTORY: (args: Omit<Parameters<typeof getVirtualTradeHistory>[0], 'sdk'>) => [
      'sdk.dataSource.history.getVirtualTradeHistory',
      args,
    ],
    ORDERS_HISTORY: (args: Omit<Parameters<typeof getOrdersHistory>[0], 'sdk'>) => [
      'sdk.dataSource.history.getOrdersHistory',
      args,
    ],
    FUNDING_HISTORY: (args: Omit<Parameters<typeof getFundingHistory>[0], 'sdk'>) => [
      'sdk.dataSource.history.getFundingHistory',
      args,
    ],
    TRANSFER_HISTORY: (args: Omit<Parameters<typeof getTransferHistory>[0], 'sdk'>) => [
      'sdk.dataSource.history.getTransferHistory',
      args,
    ],
    LIQUIDITY_HISTORY: (args: Omit<Parameters<typeof getLiquidityHistory>[0], 'sdk'>) => [
      'sdk.dataSource.history.getLiquidityHistory',
      args,
    ],
    ACCOUNT_BALANCE_HISTORY: (args: Omit<Parameters<typeof getAccountBalanceHistory>[0], 'sdk'>) => [
      'sdk.dataSource.history.getAccountBalanceHistory',
      args,
    ],
  },
  CAMPAIGN: {
    CAMPAIGNS: () => ['/v3/public/campaign', 'campaigns'],
    LEADERBOARD: (campaignId?: number, userAddress?: string) => [
      '/v3/public/campaign/<campaignId>?address=<userAddress>',
      { campaignId, userAddress },
    ],
  },
  YEAR_2024_SUMMARY: (userAddress: string | undefined) => ['/v3/public/yearSummary/2024', { userAddress }],
  SPOT: {
    POOLS: (chainId?: number, token0?: string, token1?: string) => [
      '/v3/public/aggregator/pools',
      { chainId, token0, token1 },
    ],
    TOKEN_LIST: (chainId?: number, selectedToken?: string) => [
      '/v3/public/aggregator/token-list',
      { chainId, selectedToken },
    ],
    KLINE: (chainId?: number, token0?: string, token1?: string, interval?: SPOT_KLINE_INTERVAL) => [
      '/v3/public/aggregator/kline',
      { chainId, token0, token1, interval },
    ],
    DEPTH: (chainId?: number, token0?: string, token1?: string, stepRatio?: number) => [
      '/v3/public/aggregator/depth',
      { chainId, token0, token1, stepRatio },
    ],
    PRICE: (chainId?: number, token0?: string, token1?: string) => [
      '/v3/public/aggregator/price',
      { chainId, token0, token1 },
    ],
    HISTORY: (user?: string, chainId?: number) => ['sdk.aggregatorDataSource.getOrderHistory', { user, chainId }],
    BALANCE: (user?: string, chainId?: number, tokenAddr?: string) => [
      'signer.balanceOf',
      { user, chainId, tokenAddr },
    ],
    SIMULATE_SWAP: (chainId?: number, userAddr?: string, amount?: string, token0?: string, token1?: string) => [
      'sdk.aggregator.simulateMultiSwap',
      { chainId, userAddr, amount, token0, token1 },
    ],
    SIMULATE_BEST_ROUTE: (chainId?: number, userAddr?: string, amount?: string, token0?: string, token1?: string) => [
      'sdk.aggregator.querySplitRoute',
      { chainId, userAddr, amount, token0, token1 },
    ],
  },
  GLOBAL: {
    TOKEN_PRICE: (chainId?: number) => [`/v3/public/token/allPrice`, { chainId }],
  },
  FUTURES: {
    INSTRUMENT: (chainId?: number, instrumentAddr?: string) => [
      '/v3/public/perp/market/instrument',
      { chainId, instrumentAddr },
    ],
    PAIR_INFO: (chainId?: number, instrumentAddr?: string, expiry?: number) => [
      '/v3/public/perp/market/pairInfo',
      { chainId, instrumentAddr, expiry },
    ],
    ORDER_BOOK: (chainId?: number, instrumentAddr?: string, expiry?: number, stepRatio?: number) => [
      '/v3/public/perp/market/orderBook',
      { chainId, instrumentAddr, expiry, stepRatio },
    ],
    DEPTH_CHARTS: (chainId?: number, instrumentAddr?: string, expiry?: number) => [
      '/v3/public/perp/market/depth',
      { chainId, instrumentAddr, expiry },
    ],
    FUNDING_CHARTS: (chainId?: number, instrumentAddr?: string, expiry?: number, chartDuration?: string) => [
      '/v3/public/perp/market/funding',
      { chainId, instrumentAddr, expiry, chartDuration },
    ],
    KLINE_CHARTS: ({
      chainId,
      instrumentAddr,
      expiry,
      chartDuration,
      timeEnd,
    }: {
      chainId?: number;
      instrumentAddr?: string;
      expiry?: number;
      chartDuration?: KlineInterval;
      timeEnd?: number;
    }) => [
      '/v3/public/perp/market/kline',
      {
        chainId,
        instrumentAddr,
        expiry,
        chartDuration,
        timeEnd,
      },
    ],
  },
  MARKET: {
    PAIR_LIST: () => ['/v3/public/perp/market/list'],
    CREATIVE_PAIR_LIST: () => ['/v3/public/perp/market/feature/pairs'],
    TREND_LIST: () => ['/v3/public/market/trend-info'],
    BANNER_LIST: () => ['/v3/public/common/dapp/config'],
  },
  VAULT: {
    INFOS: (chainId?: number, userAddr?: string) => ['/v3/public/vault', { chainId, userAddr }],
    SUMMARY: (chainId?: number) => ['/v3/public/vault/summary', { chainId }],
  },
  PORTFOLIO: {
    PORTFOLIO: (chainId?: number, userAddr?: string, instrumentAddr?: string, expiry?: number) => [
      '/v3/public/perp/market/user/portfolio',
      { chainId, userAddr, instrumentAddr, expiry },
    ],
  },
  EARN: {
    IL: (chainId?: number, symbol?: string, alphaLower?: string, alphaUpper?: string) => [
      'ildata',
      chainId,
      symbol,
      alphaLower,
      alphaUpper,
    ],
  },
  BALANCE: {
    GATE: (chainId?: number, userAddr?: string) => ['/v3/public/perp/market/user/gateValue', { chainId, userAddr }],
  },
} as const;
