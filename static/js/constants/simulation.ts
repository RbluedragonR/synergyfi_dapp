import { getMappedRevertReason } from '@/utils/error';

export const ERROR_MSG_AMOUNT_EXCEEDS_ALLOWANCE = {
  errorMsg: getMappedRevertReason('ERC20: transfer amount exceeds allowance'),
  errorData: 'ERC20: transfer amount exceeds allowance',
};
export const ERROR_MSG_EXCEED_WALLET_BALANCE = {
  errorMsg: getMappedRevertReason('ERC20: transfer amount exceeds balance'),
  errorData: 'ERC20: transfer amount exceeds balance',
};
export const ERROR_MSG_RANGE_OCCUPIED = {
  errorMsg: getMappedRevertReason('0x99f3c9b0'),
  errorData: '0x99f3c9b0',
};
export const ERROR_MSG_ORDER_OCCUPIED = {
  errorMsg: getMappedRevertReason('OrderOccupied'),
  errorData: 'OrderOccupied',
};
export const ERROR_MSG_INSUFFICIENT_MARGIN = 'insufficient margin to transfer out';
export const ERROR_MSG_LIMIT_PRICE_FAR_FROM_MARK = 'Limit order price is too far away from mark price';
export const ERROR_MSG_IMR = '0xde4607ee'; //'Insufficient margin to open position';
export const ERROR_MSG_MMR = '0x2f61ef0b'; // 'Insufficient margin for this trade';
export const ERROR_MSG_FAIR_FAR_FROM_MARK = 'fair price is too far away from mark price';
export const ERROR_MSG_SIZE_TO_TICK_IS_TRIVIAL = 'Size to tick is trivial';
