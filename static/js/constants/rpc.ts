import { CHAIN_ID } from '@derivation-tech/context';

export const CHAIN_HTTP_RPC_URLS: { [chainId: number]: string[] } = {
  [CHAIN_ID.BLASTSEPOLIA]: [`https://sepolia.blast.io`],
  [CHAIN_ID.BASE]: [
    `https://mainnet-preconf.base.org/iVCRlQ4dHSYzXgOMMBfoR92yxGCndKUnJ0tF0dwAyzDN73xrJFYrQiNAPB9FRcVb`,
    // `https://mainnet.base.org`,
    // `https://rpc.ankr.com/base`,
    // 'https://base-mainnet.public.blastapi.io',
    // `https://base-pokt.nodies.app`,
    // `https://base.meowrpc.com`,
    // `https://base.rpc.subquery.network/public`,
  ],
  [CHAIN_ID.BLAST]: [
    `https://api.synfutures.com/rpc/public/blast`,
    // 'https://blastl2-mainnet.public.blastapi.io',
    // 'https://endpoints.omniatech.io/v1/blast/mainnet/public',
    // 'https://rpc.ankr.com/blast',
    // 'https://blast.din.dev/rpc',
    // 'https://blast-rpc.publicnode.com',
  ],
};

export const CHAIN_WSS_RPC_URLS: { [chainId: number]: string[] } = {
  [CHAIN_ID.GOERLI]: [
    process.env.REACT_APP_GOERLI_WSS || '',
    `wss://dark-crimson-night.ethereum-goerli.quiknode.pro/0630f179916b7122fce747ae37ad697856295c62/`,
  ],
  [CHAIN_ID.POLYGON]: [
    process.env.REACT_APP_POLYGON_WSS_RPC || '',
    `wss://wandering-blue-voice.matic.quiknode.pro/922dec71ad2bc92b7a6e64570721cf2b510bb31d/`,
  ].filter((url) => !!url),
  [CHAIN_ID.LINEA]: [
    process.env.REACT_APP_LINEA_WSS_RPC || '',
    `wss://lb.drpc.org/ogws?network=linea&dkey=AkhFZI-RCESCrQorQTqO09TKarNQfTER7qRoxqxINsn1`,
  ].filter((url) => !!url),
  [CHAIN_ID.ARBITRUM]: [
    process.env.REACT_APP_ARBITRUM_WSS_RPC || '',
    `wss://boldest-tiniest-tent.arbitrum-mainnet.quiknode.pro/c92b4b64a2156a038a0a9d846ca8f79c70fad7cf/`,
  ].filter((url) => !!url),
  [CHAIN_ID.BLASTSEPOLIA]: [process.env.REACT_APP_BLASTSEPOLIA_WSS_RPC || '', `wss://blast-sepolia.drpc.org`].filter(
    (url) => !!url,
  ),
  // [CHAIN_ID.BLAST]: [
  //   process.env.REACT_APP_BLAST_WSS_RPC || '',
  //   `wss://solitary-green-thunder.blast-mainnet.quiknode.pro/eebd94ea96fbb624a887ea240e09c900230c057a/`,
  // ].filter((url) => !!url),
  // [CHAIN_ID.BASE]: [
  //   process.env.REACT_APP_BASE_WSS_RPC || '',
  //   `wss://base-mainnet.blastapi.io/63f76456-80db-4cd9-9b97-36a757c2bc00`,
  // ].filter((url) => !!url),
};
