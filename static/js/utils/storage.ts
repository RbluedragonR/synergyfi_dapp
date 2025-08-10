import Cookies from 'js-cookie';
import localforage from 'localforage';
import _ from 'lodash';

import {
  GLOBAL_CONFIG,
  JWT_FOR_ODYSSEY,
  JWT_FOR_TGP,
  LOCAL_RPC_URL,
  PAIRS_PARTICIPATED,
  REFERRAL_CODE_FOR_ODYSSEY,
  SIGNATURE_FOR_ODYSSEY,
} from '@/constants/storage';
import { IGlobalConfig, IGlobalConfigStorage, ISignature, ISignatureStorage } from '@/types/global';
import { IOdysseySignature, IOdysseySignatureStorage } from '@/types/odyssey';

export async function saveGlobalConfigToLocalForage(config: IGlobalConfig): Promise<void> {
  const configInStorage = ((await localforage.getItem(GLOBAL_CONFIG)) || {}) as IGlobalConfigStorage;
  _.set(configInStorage, [config.chainId], config);
  localforage.setItem(GLOBAL_CONFIG, configInStorage);
}

export async function saveSignatureToLocalForage(signature: ISignature): Promise<void> {
  const signatureInStorage = ((await localforage.getItem(SIGNATURE_FOR_ODYSSEY)) || {}) as ISignatureStorage;
  _.set(signatureInStorage, [signature.address || ''], signature);
  localforage.setItem(SIGNATURE_FOR_ODYSSEY, signatureInStorage);
}

export async function getSignatureToLocalForage(address: string): Promise<ISignature | undefined> {
  const signatureInStorage = ((await localforage.getItem(SIGNATURE_FOR_ODYSSEY)) || {}) as ISignatureStorage;
  return _.get(signatureInStorage, [address || '']);
}

export async function saveOdysseySignatureToLocalForage(signature: IOdysseySignature): Promise<void> {
  const signatureInStorage = ((await localforage.getItem(SIGNATURE_FOR_ODYSSEY)) || {}) as IOdysseySignatureStorage;
  _.set(signatureInStorage, [signature.address || ''], signature);
  localforage.setItem(SIGNATURE_FOR_ODYSSEY, signatureInStorage);
}

export async function getOdysseySignatureToLocalForage(address: string): Promise<IOdysseySignature | undefined> {
  const signatureInStorage = ((await localforage.getItem(SIGNATURE_FOR_ODYSSEY)) || {}) as IOdysseySignatureStorage;
  return _.get(signatureInStorage, [address || '']);
}

export function getOdysseyJWTToken(address: string, chainId: number | undefined): string | undefined {
  const cookieStr = Cookies.get(`${JWT_FOR_ODYSSEY}-${address}-${chainId}`);
  return cookieStr;
}

export function saveOdysseyJWTToken(address: string, jwtToken: string, chainId: number): void {
  Cookies.set(`${JWT_FOR_ODYSSEY}-${address}-${chainId}`, jwtToken, { expires: 30 });
}

export async function saveOdysseyReferralCodeToLocalForage(
  code: string,
  userAddr: string | undefined,
  chainId: number,
): Promise<void> {
  const storage = ((await localforage.getItem(REFERRAL_CODE_FOR_ODYSSEY)) || {}) as {
    [chainId: number]: { [userAddr: string]: string };
  };
  _.set(storage, [chainId, userAddr || ''], code);
  localforage.setItem(REFERRAL_CODE_FOR_ODYSSEY, storage);
}

export async function getOdysseyReferralCodeToLocalForage(
  userAddr: string | undefined,
  chainId: number,
): Promise<string | undefined> {
  const storage = ((await localforage.getItem(REFERRAL_CODE_FOR_ODYSSEY)) || {}) as {
    [chainId: number]: { [userAddr: string]: string };
  };
  return _.get(storage, [chainId, userAddr || '']);
}

export function getTGPJWTToken(address: string): string | undefined {
  const cookieStr = Cookies.get(`${JWT_FOR_TGP}-${address}`);
  return cookieStr;
}

export function saveTGPJWTToken(address: string, jwtToken: string): void {
  Cookies.set(`${JWT_FOR_TGP}-${address}`, jwtToken, { expires: 30 });
}

export async function saveParticipatedPairsToLocalForage(
  pairs: { instrumentAddr: string; expiry: number }[],
  userAddr: string,
  chainId: number,
): Promise<void> {
  const storage = ((await localforage.getItem(PAIRS_PARTICIPATED)) || {}) as {
    [chainId: number]: { [userAddr: string]: { instrumentAddr: string; expiry: number }[] };
  };

  _.set(storage, [chainId, userAddr], pairs);
  localforage.setItem(PAIRS_PARTICIPATED, storage);
}

export async function getParticipatedPairsFromLocalForage(
  userAddr: string,
  chainId: number,
): Promise<{ instrumentAddr: string; expiry: number }[]> {
  const storage = ((await localforage.getItem(PAIRS_PARTICIPATED)) || {}) as {
    [chainId: number]: { [userAddr: string]: { instrumentAddr: string; expiry: number }[] };
  };
  const userStorage = _.get(storage, [chainId, userAddr]);
  return Object.values(userStorage || {});
}

export async function saveSingleParticipatedPairsToLocalForage(
  pair: { instrumentAddr: string; expiry: number },
  userAddr: string,
  chainId: number,
): Promise<void> {
  const storage = ((await localforage.getItem(PAIRS_PARTICIPATED)) || {}) as {
    [chainId: number]: { [userAddr: string]: { instrumentAddr: string; expiry: number }[] };
  };

  const pairs: { instrumentAddr: string; expiry: number }[] = _.get(storage, [chainId, userAddr], []);
  if (!pairs.find((p) => p.instrumentAddr === pair.instrumentAddr && p.expiry === pair.expiry)) pairs.push(pair);
  _.set(storage, [chainId, userAddr], pairs);
  localforage.setItem(PAIRS_PARTICIPATED, storage);
}

export async function saveRpcToLocalForage(chainId: number, rpc: string): Promise<void> {
  const rpcInStorage = ((await localforage.getItem(LOCAL_RPC_URL)) || {}) as { [chainId: number]: string };
  if (rpc) {
    _.set(rpcInStorage, [chainId || ''], rpc);
    localforage.setItem(LOCAL_RPC_URL, rpcInStorage);
  } else {
    _.unset(rpcInStorage, [chainId || '']);
    localforage.setItem(LOCAL_RPC_URL, rpcInStorage);
  }
}

export async function getRpcFromLocalForage(
  chainId: number,
): Promise<{ rpc: string; type: 'wss' | 'https' } | undefined> {
  const signatureInStorage = ((await localforage.getItem(LOCAL_RPC_URL)) || {}) as { [chainId: number]: string };
  const rpc: string = _.get(signatureInStorage, [chainId || '']);
  if (rpc && rpc?.length) {
    if (rpc.startsWith('wss')) {
      return {
        rpc,
        type: 'wss',
      };
    }

    return {
      rpc,
      type: 'https',
    };
  }
}
