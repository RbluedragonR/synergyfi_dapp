import { IMarketPair } from '@/types/pair';

export const marketColumnRowKey: (record: IMarketPair) => string = (record) => record.chainId?.toString();
//   record.fairPrice?._hex +
//   record.rootInstrument?.spotPrice._hex +
//   record.openInterests._hex +
//   record.rootInstrument?.marginToken?.price?.toString();
