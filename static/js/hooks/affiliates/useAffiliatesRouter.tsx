import { CHAIN_ID, DEFAULT_CHAIN_ID, SUPPORTED_CHAIN_ID } from '@/constants/chain';
import { RouteBasePath } from '@/pages/routers';
import { getChainShortName } from '@/utils/chain';

export const getAffiliatesLink = ({ chainId }: { chainId?: CHAIN_ID }) => {
  const theChainId = chainId || DEFAULT_CHAIN_ID;
  const finalChainId = SUPPORTED_CHAIN_ID.includes(theChainId) ? theChainId : DEFAULT_CHAIN_ID;
  const chainShortName = getChainShortName(finalChainId);
  return `/${RouteBasePath.referral}/${chainShortName}`;
};
