import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { CAMPAIGN_TYPE } from '@/types/odyssey';

import { AIP_DOMAIN } from '@/constants/global';
import { getEncryptedHeader } from './SymmetricEncryption';
import { getOdysseyJWTToken, getTGPJWTToken } from './storage';
export async function axiosGet({
  url,
  address,
  config,
  type,
  domain,
}: {
  url: string;
  address?: string;
  config?: AxiosRequestConfig;
  type?: CAMPAIGN_TYPE;
  domain?: string;
}): Promise<AxiosResponse> {
  const jwtToken = type ? (type === CAMPAIGN_TYPE.TGP && address ? getTGPJWTToken(address) : undefined) : undefined;
  // need move params to url for encrypted

  if (config?.params) {
    const pa = new URLSearchParams(config.params);
    pa.sort();
    const params = pa.toString();
    url += (url.includes('?') ? '&' : '?') + params;
    config.params = undefined;
  }
  const encryptedData = getEncrypted({ url, jwtToken, domain });
  if (encryptedData?.url) {
    url = encryptedData.url;
  }

  return await axios.get(url, {
    ...config,
    headers: {
      ...config?.headers,
      Authorization: jwtToken,
      ...encryptedData?.encryptedData,
    },
  });
}
export async function axiosPost({
  url,
  address,
  data,
  config,
  type,
  chainId,
  domain,
}: {
  url: string;
  address?: string;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  data?: any;
  config?: AxiosRequestConfig;
  type?: CAMPAIGN_TYPE;
  chainId?: number | undefined;
  domain?: string;
}): Promise<AxiosResponse> {
  const jwtToken = address
    ? type === CAMPAIGN_TYPE.TGP
      ? getTGPJWTToken(address)
      : getOdysseyJWTToken(address, chainId)
    : undefined;
  const encryptedData = getEncrypted({ url, jwtToken, body: data, domain });
  if (encryptedData?.url) {
    url = encryptedData.url;
  }
  return await axios.post(url, data, {
    ...config,
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      ...config?.headers,
      Authorization: jwtToken,
      ...encryptedData?.encryptedData,
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEncrypted({
  url,
  jwtToken,
  body,
  domain,
}: {
  url: string;
  jwtToken?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  domain?: string;
}) {
  if (!domain) domain = AIP_DOMAIN;
  if (!url.startsWith('http')) {
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    url = domain + url;
  }

  if (url.startsWith(domain)) {
    const uri = url.replace(domain, '');
    const encryptedHeader = getEncryptedHeader({
      uri,
      authorization: jwtToken,
      body: body,
    });

    return { encryptedData: encryptedHeader, url };
  }
}
