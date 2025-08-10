const prefix = 'syn';

/**
 * localStorage start
 */
export const LOCAL_THEME = `${prefix}-theme`;
export const ALL_USER_INFO = `${prefix}-all-user-info`;
export const LAST_POSITIONS_NUMBER = 'LAST_POSITIONS_NUMBER';
export const LAST_HISTORY_UNDERLYING_ADDR = 'LAST_HISTORY_UNDERLYING_ADDR';
export const MOBILE_ROUTE_BEFORE_SEARCH = 'MOBILE_ROUTE_BEFORE_SEARCH';
export const SYN_AGREE_TERM = `syn-agree-term`;
export const INITIAL_CHAIN_SELECTED = 'syn-initial-chain-selected';
export const GLOBAL_CONFIG = `global-config`;
export const GOT_PRICE_ROUNDED = `got-price-rounded`;
export const HIDE_HISTORY_TOOLTIP = `hide-history-tooltip`;
export const MOBILE_MINT_TOASTER = `mobile-mint-toaster`;
export const HIDE_REFRESH_HISTORY_DATA = 'hide_refresh_history_data';
export const FIRST_MYSTERY_BOX_POPPED = 'first_mystery_box_popped';
export const MOBILE_SHOW_CHART = 'mobile_show_chart';
export const MOBILE_SHOW_CHART_EARN = 'mobile_show_chart_earn';
export const CLAIM_TOKEN_MODAL_OPENED = 'claim_token_modal_opened';
export const TOKEN_ADDRESS_WARNING = 'token_address_warning';
export const SIGN_UP_SKIPPED = 'sign_up_skipped';
export const LAST_EPOCH_OPENED = 'last_epoch_opened';
export const PRICE_BASIS_FOR_PNL = 'price_basis_for_pnl';
export const HIDE_TVL_MODAL = 'HIDE_TVL_MODAL';
export const NO_SHOW_PNL_NOTIFICATION = 'NO_SHOW_PNL_NOTIFICATION';
export const WALLET_TYPE = 'WALLET_TYPE';
export const SEARCH_PAIR_SORTER = 'SEARCH_PAIR_SORTER';
export const SEARCH_PAIR_SORTER_DIRECTION = 'SEARCH_PAIR_SORTER_DIRECTION';
export const SYN_YEAR2024_SUMMARY = 'SYN_YEAR2024_SUMMARY_0';
export const GET_SYN_SPOT_SWAP_BUY_TOKEN = (chainId: number) => `SYN_SPOT_SWAP_BUY_TOKEN_${chainId}`;
export const GET_SYN_SPOT_SWAP_SELL_TOKEN = (chainId: number) => `SYN_SPOT_SWAP_SELL_TOKEN_${chainId}`;
/**
 * localStorage end
 */

/**
 * localForage start
 */
// the localforage sometimes needs to be clean for newer releases
// to achieve this simply bump up the keys down

export const S3_PAIRS_KEY = 'S3_PAIRS-3.4.2';
export const PAIRS_FAVORITES_KEY = 'PAIRS_FAVORITES-3.4.2';
export const LOCAL_SIGNED_UP = 'LOCAL_SIGNED_UP';
export const APP_CHAIN_ID = 'APP_CHAIN_ID';
export const LEVERAGE_CHOSEN = 'LEVERAGE_CHOSEN_3.4.2';
export const PAIR_CHOSEN = 'PAIR_CHOSEN_3.4.2';
export const SIGNATURE_FOR_ODYSSEY = 'SIGNATURE_FOR_ODYSSEY_1';
export const REFERRAL_CODE_FOR_ODYSSEY = 'REFERRAL_CODE_FOR_ODYSSEY_2';
export const JWT_FOR_ODYSSEY = 'JWT_FOR_ODYSSEY';
export const TGP_SHARED_JOIN_STATUS = 'tgp_shared_join_status';
export const JWT_FOR_TGP = 'JWT_FOR_TGP';
export const LOCAL_RPC_URL = 'LOCAL_RPC_URL';
export const PAIRS_PARTICIPATED = 'PAIRS_PARTICIPATED';
export const SYN_IS_AFFILIATE = `SYN_IS_AFFILIATE`;

/**
 * localForage end
 */
