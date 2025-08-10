import { Buffer } from 'buffer';
import CryptoJS from 'crypto-js';
import cryptoRandomString from 'crypto-random-string';
import { ethers } from 'ethers';
import _ from 'lodash';

export class SymmetricEncryption {
  private readonly key: string;
  private readonly iv: string;
  private readonly nonce: string;

  constructor(nonce?: string) {
    if (nonce) {
      this.nonce = nonce;
    } else {
      this.nonce = cryptoRandomString({ length: 48, type: 'alphanumeric' });
    }
    const hashBuffer = Buffer.from(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(this.nonce)).slice(2), 'hex');
    this.key = ethers.utils.hexlify(hashBuffer.subarray(0, 32), { allowMissingPrefix: false }).replace('0x', '');
    this.iv = ethers.utils
      .hexlify(hashBuffer.subarray(hashBuffer.length - 16), {
        allowMissingPrefix: false,
      })
      .replace('0x', '');
  }

  sign(params: { uri: string; ts: number; body?: object; authorization?: string }): {
    'X-Api-Nonce': string;
    'X-Api-Sign': string;
    'X-Api-Ts': number;
  } {
    const body = params.body ? JSON.stringify(_.fromPairs(_.sortBy(_.toPairs(params.body), 0))) : undefined;
    const plaintext = JSON.stringify({
      uri: params.uri,
      body,
      nonce: this.nonce,
      ts: params.ts,
      authorization: params.authorization || undefined,
    });
    const encrypted = CryptoJS.AES.encrypt(plaintext, CryptoJS.enc.Hex.parse(this.key), {
      iv: CryptoJS.enc.Hex.parse(this.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const sign = ethers.utils
      .keccak256(ethers.utils.toUtf8Bytes(CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encrypted.toString()))))
      .replace('0x', '');
    return {
      'X-Api-Nonce': this.nonce,
      'X-Api-Sign': sign,
      'X-Api-Ts': params.ts,
    };
  }
}

export function getEncryptedHeader({
  uri,
  authorization,
  body,
}: {
  uri: string;
  authorization?: string;
  body?: object;
}): {
  'X-Api-Nonce': string;
  'X-Api-Sign': string;
  'X-Api-Ts': number;
} {
  const params = {
    uri,
    body,
    ts: new Date().getTime(),
    authorization,
  };
  const symmetricEncryption = new SymmetricEncryption();
  const encrypted = symmetricEncryption.sign(params);
  return encrypted;
}

// // Example usage:
// const result = getEncryptedData({
//   uri: 'v3/api/checkIp',
//   authorization:
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiMHg1MDYzN2VjOTJiN2E1ZWVhMDQyMjBkNDA4OTkxMTk0MGQzM2UyOTI1Iiwibm9uY2UiOjE3MzI3ODM1MDI3NzEsInNvdXJjZSI6IjEiLCJpYXQiOjE3MzI4NTEwMTUsImV4cCI6MTczNTQ0MzAxNX0.vmkfnDsufyo68V5WbrOjw3ExqYRRR7fS9b8p0xRuSII',
// });
// console.log('Encrypted data:', result);
