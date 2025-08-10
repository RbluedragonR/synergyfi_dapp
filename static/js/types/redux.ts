import { SerializedError } from '@reduxjs/toolkit';

import { FETCHING_STATUS } from '@/constants';

export type ListStatus<T> = {
  list: Record<string, T>;
  status: FETCHING_STATUS;
  error?: SerializedError;
};
export type ListArrayStatus<T> = {
  list: T[];
  status: FETCHING_STATUS;
  error?: SerializedError;
};

export type ItemStatus<T> = {
  item: T;
  status: FETCHING_STATUS;
  error?: SerializedError;
  timestamp?: number;
};

export const getDefaultListStatus = <T>(status = FETCHING_STATUS.INIT): ListStatus<T> => {
  return {
    list: {},
    status: status,
  };
};
export const getDefaultItemStatus = <T>(status = FETCHING_STATUS.INIT): ItemStatus<T | undefined> => {
  return {
    item: undefined,
    status: status,
  };
};
export const getDefaultListArrayStatus = <T>(status = FETCHING_STATUS.INIT): ListArrayStatus<T> => {
  return {
    list: [],
    status: status,
  };
};

export const setFulfilledListStatus = <T>(list: Record<string, T>): ListStatus<T> => {
  return {
    list,
    status: FETCHING_STATUS.DONE,
  };
};
export const setFulfilledListArrayStatus = <T>(list: T[]): ListArrayStatus<T> => {
  return {
    list,
    status: FETCHING_STATUS.DONE,
  };
};
export const setFulfilledItemStatus = <T>(item: T): ItemStatus<T> => {
  return {
    item,
    status: FETCHING_STATUS.DONE,
  };
};
