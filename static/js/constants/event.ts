import { Interface } from 'ethers/lib/utils';

import { OPERATION_TX_TYPE, TX_INTERFACE_MAPPING } from './tx';

export enum EVENT_NAMES {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Withdrawal = 'Withdrawal',
  Trade = 'Trade',
  Adjust = 'Adjust',
  Place = 'Place',
  Fill = 'Fill',
  Cancel = 'Cancel',
  Add = 'Add',
  Remove = 'Remove',
  Settle = 'Settle',
  NewInstrument = 'NewInstrument',
  Gather = 'Gather',
  // for vault
  VaultDeposit = 'Deposit',
  VaultWithdraw = 'Withdraw',
  UpdatePending = 'UpdatePending',

  // for aggregator
  OrderHistory = 'OrderHistory',
}

export const DISPLAYED_EVENT: string[] = [
  EVENT_NAMES.Deposit,
  EVENT_NAMES.Withdraw,
  EVENT_NAMES.Trade,
  EVENT_NAMES.Adjust,
  EVENT_NAMES.Place,
  EVENT_NAMES.Fill,
  EVENT_NAMES.Cancel,
  EVENT_NAMES.Add,
  EVENT_NAMES.Remove,
  EVENT_NAMES.Settle,
  EVENT_NAMES.NewInstrument,
];

export const OPERATE_EVENT_MAPPING: {
  [type in OPERATION_TX_TYPE]?: {
    interfaces: Interface[];
    events: string[];
  };
} = {
  [OPERATION_TX_TYPE.DEPOSIT]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.DEPOSIT] || [],
    events: [EVENT_NAMES.Deposit],
  },
  [OPERATION_TX_TYPE.WITHDRAW]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.WITHDRAW] || [],
    events: [EVENT_NAMES.Withdraw],
  },
  [OPERATION_TX_TYPE.TRADE]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.TRADE] || [],
    events: [EVENT_NAMES.Deposit, EVENT_NAMES.Trade],
  },
  [OPERATION_TX_TYPE.ADJUST_MARGIN]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.ADJUST_MARGIN] || [],
    events: [EVENT_NAMES.Deposit, EVENT_NAMES.Withdraw, EVENT_NAMES.Adjust],
  },
  [OPERATION_TX_TYPE.PLACE_ORDER]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.PLACE_ORDER] || [],
    events: [EVENT_NAMES.Deposit, EVENT_NAMES.Place],
  },
  [OPERATION_TX_TYPE.FILL_ORDER]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.FILL_ORDER] || [],
    events: [EVENT_NAMES.Fill],
  },
  [OPERATION_TX_TYPE.CANCEL_ORDER]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.CANCEL_ORDER] || [],
    events: [EVENT_NAMES.Cancel],
  },
  [OPERATION_TX_TYPE.ADD_LIQUIDITY]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.ADD_LIQUIDITY] || [],
    events: [EVENT_NAMES.Deposit, EVENT_NAMES.Add],
  },
  [OPERATION_TX_TYPE.REMOVE_LIQUIDITY]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.REMOVE_LIQUIDITY] || [],
    events: [EVENT_NAMES.Remove],
  },
  [OPERATION_TX_TYPE.SETTLE]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.SETTLE] || [],
    events: [EVENT_NAMES.Settle, EVENT_NAMES.Cancel, EVENT_NAMES.Gather],
  },
  [OPERATION_TX_TYPE.CREATE]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.CREATE] || [],
    events: [EVENT_NAMES.NewInstrument, EVENT_NAMES.Deposit, EVENT_NAMES.Add],
  },
  [OPERATION_TX_TYPE.BATCH_PLACE_SCALED_ORDER]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.PLACE_ORDER] || [],
    events: [EVENT_NAMES.Place],
  },
  [OPERATION_TX_TYPE.PLACE_CROSS_MARKET_ORDER]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.PLACE_ORDER] || [],
    events: [EVENT_NAMES.Deposit, EVENT_NAMES.Trade, EVENT_NAMES.Place],
  },
  [OPERATION_TX_TYPE.VAULT_DEPOSIT]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.VAULT_DEPOSIT] || [],
    events: [EVENT_NAMES.VaultDeposit],
  },
  [OPERATION_TX_TYPE.VAULT_WITHDRAW]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.VAULT_WITHDRAW] || [],
    events: [EVENT_NAMES.VaultWithdraw],
  },
  [OPERATION_TX_TYPE.VAULT_CLAIM]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.VAULT_CLAIM] || [],
    events: [EVENT_NAMES.VaultWithdraw],
  },
  [OPERATION_TX_TYPE.SWAP]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.SWAP] || [],
    events: [EVENT_NAMES.OrderHistory],
  },
  [OPERATION_TX_TYPE.NATIVE_SWAP]: {
    interfaces: TX_INTERFACE_MAPPING[OPERATION_TX_TYPE.NATIVE_SWAP] || [],
    events: [EVENT_NAMES.Withdrawal, EVENT_NAMES.Deposit],
  },
};
