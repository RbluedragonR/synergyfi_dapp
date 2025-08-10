import { CHAIN_ID } from '@derivation-tech/context';
import { ReactNode } from 'react';

import { FETCHING_STATUS } from '@/constants';

export interface IGlobalConfig {
  chainId: number;
  slippage: string;
  deadline: string;
  gasPrice: string;
}
export interface IGlobalConfigStorage {
  [chainId: number]: IGlobalConfig;
}
export interface AnnouncementRes {
  nonce: number;
  isShow: boolean;
  desc: string;
  link: string;
  linkName: string;
  isOpenNewWindow: boolean;
}

export type SettingSelectorData = {
  key: string;
  value: ReactNode;
  desc?: string;
};

export type SettingSelectorProps = {
  className?: string;
  extra?: React.ReactNode;
  datas: SettingSelectorData[];
  defaultKey?: string;
  isMobile?: boolean;
};

export interface IWarningMsg {
  msg: string;
  status: string;
}
export type JoinTimesTypes = {
  [propsName: string]: Omit<JoinTimeTypes, 'userAddr' | 'txHash'> & {
    txHash?: string;
  };
};

export type JoinTimeTypes = Required<{
  chainId: CHAIN_ID;
  userAddr: string;
  timestamp: number;
  txHash?: string;
}>;

export enum MARGIN_TYPE {
  COIN = 'COIN',
  USD = 'USD',
}

export enum ALL_SELECTOR {
  ALL = 'ALL',
}

export enum FAV_SELECTOR {
  FAVORITE = 'FAVORITE',
}
// CUSTOM_SELECTOR means marketCustomPairs.id
export enum CUSTOM_SELECTOR {
  CUSTOM = 'CUSTOM',
}

export type MARGIN_SELECTORS = FAV_SELECTOR | MARGIN_TYPE | ALL_SELECTOR | CUSTOM_SELECTOR;
// undefined mean ALL_SELECTOR.ALL
export type TPairTypeForMobile = PAIR_DATE_TYPE | undefined;
export enum PAIR_DATE_TYPE {
  PERPETUAL = 'PERPETUAL',
  DATED = 'DATED',
}

export interface ISignature {
  timestamp: string;
  signature: string;
  status?: FETCHING_STATUS;
  address?: string;
}

export interface ISignatureStorage {
  [userAddr: string]: ISignature;
}
