import { ERC20__factory, WrappedNative__factory } from '@derivation-tech/contracts';
import { OysterAggregator__factory } from '@synfutures/sdks-aggregator/dist/typechain';
import { Vault__factory } from '@synfutures/sdks-perp-launchpad/dist/typechain';
import { Gate__factory, Instrument__factory } from '@synfutures/sdks-perp/dist/typechain';

import { Interface } from 'ethers/lib/utils';
export enum TX_TRANSFORM_TARGET {
  NOTIFICATION = 'NOTIFICATION',
  HISTORY = 'HISTORY',
}

/**
 * send tx operation type, or page operation type
 */
export enum OPERATION_TX_TYPE {
  APPROVE = 'approve',
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRADE = 'trade',
  PLACE_ORDER = 'placeOrder',
  CANCEL_ORDER = 'cancelOrder',
  FILL_ORDER = 'fillOrder',
  ADJUST_MARGIN = 'adjustMargin',
  ADD_LIQUIDITY = 'addLiquidity',
  REMOVE_LIQUIDITY = 'removeLiquidity',
  SETTLE = 'settle',
  CREATE = 'create',
  // only for Goerli
  MINT = 'mint',
  // campaign center operations
  ACCEPT_INVITE = 'acceptInvite',
  CREATE_TEAM = 'createTeam',
  CLAIM_REWARDS = 'claimRewards',
  CLAIM_WITHDRAW = 'claimWithdraw',
  CLAIM_OO_TOKEN = 'claimOOToken',
  BATCH_PLACE_SCALED_ORDER = 'placeScaledOrder',
  PLACE_CROSS_MARKET_ORDER = 'placeCrossMarketOrder',
  // for vault
  VAULT_DEPOSIT = 'vaultDeposit',
  VAULT_WITHDRAW = 'vaultWithdraw',
  VAULT_CLAIM = 'vaultClaim',
  // for aggregator
  SWAP = 'swap',
  NATIVE_SWAP = 'native_swap',
  REFERRAL_TRADER_CLAIM = 'referralTraderClaim',
  REFERRAL_AFFILIATES_CLAIM = 'referralAffiliatesClaim',
}

// /**
//  * is need use new version to parse revert reason
//  */
// export const NEED_PARSE_NEW_REVERT: {
//   [type in OPERATION_TX_TYPE]?: true;
// } = {
//   [OPERATION_TX_TYPE.ACCEPT_INVITE]: true,
//   [OPERATION_TX_TYPE.CREATE_TEAM]: true,
//   [OPERATION_TX_TYPE.CLAIM_REWARDS]: true,
// };

/**
 * Synfutures interfaces
 */
export const SYN_INTERFACE = {
  InstrumentInterface: Instrument__factory.createInterface(),
  GateInterface: Gate__factory.createInterface(),
  VaultInterface: Vault__factory.createInterface(),
  Erc20Interface: ERC20__factory.createInterface(),
  WrappedNativeInterface: WrappedNative__factory.createInterface(),
  // CampaignCenterInterface: CampaignCenter__factory.createInterface(),
  OysterAggregatorInterface: OysterAggregator__factory.createInterface(),
};

/**
 * tx operation interface mapping
 */
export const TX_INTERFACE_MAPPING: {
  [type in OPERATION_TX_TYPE]?: Interface[];
} = {
  // primary interfaces
  [OPERATION_TX_TYPE.DEPOSIT]: [SYN_INTERFACE.GateInterface],
  [OPERATION_TX_TYPE.WITHDRAW]: [SYN_INTERFACE.GateInterface],
  [OPERATION_TX_TYPE.TRADE]: [SYN_INTERFACE.InstrumentInterface],
  [OPERATION_TX_TYPE.ADD_LIQUIDITY]: [SYN_INTERFACE.InstrumentInterface],
  [OPERATION_TX_TYPE.REMOVE_LIQUIDITY]: [SYN_INTERFACE.InstrumentInterface],
  [OPERATION_TX_TYPE.CREATE]: [SYN_INTERFACE.InstrumentInterface, SYN_INTERFACE.GateInterface],
  [OPERATION_TX_TYPE.ADJUST_MARGIN]: [SYN_INTERFACE.InstrumentInterface],
  [OPERATION_TX_TYPE.CANCEL_ORDER]: [SYN_INTERFACE.InstrumentInterface],
  [OPERATION_TX_TYPE.FILL_ORDER]: [SYN_INTERFACE.InstrumentInterface],
  [OPERATION_TX_TYPE.PLACE_ORDER]: [SYN_INTERFACE.InstrumentInterface],
  [OPERATION_TX_TYPE.SETTLE]: [SYN_INTERFACE.InstrumentInterface, SYN_INTERFACE.GateInterface],
  [OPERATION_TX_TYPE.BATCH_PLACE_SCALED_ORDER]: [SYN_INTERFACE.InstrumentInterface, SYN_INTERFACE.GateInterface],
  [OPERATION_TX_TYPE.PLACE_CROSS_MARKET_ORDER]: [SYN_INTERFACE.InstrumentInterface],
  // vault interfaces
  [OPERATION_TX_TYPE.VAULT_DEPOSIT]: [SYN_INTERFACE.VaultInterface],
  [OPERATION_TX_TYPE.VAULT_WITHDRAW]: [SYN_INTERFACE.VaultInterface],
  [OPERATION_TX_TYPE.VAULT_CLAIM]: [SYN_INTERFACE.VaultInterface],
  [OPERATION_TX_TYPE.SWAP]: [SYN_INTERFACE.OysterAggregatorInterface],
  [OPERATION_TX_TYPE.NATIVE_SWAP]: [SYN_INTERFACE.WrappedNativeInterface],
};
