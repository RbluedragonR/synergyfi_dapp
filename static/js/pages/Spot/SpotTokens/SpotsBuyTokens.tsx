/**
 * @description Component-SpotPairs
 */
import './index.less';

import { useFilteredBuySpotTokens } from '@/features/spot/hooks';
import { TokenInfoInSpot } from '@/features/spot/types';
import { FC, useState } from 'react';
import SpotTokensModal from './SpotTokensModal';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  currentToken: TokenInfoInSpot;
  tokenToExclude: TokenInfoInSpot;
  onTokenChange: (token: TokenInfoInSpot) => void;
}
const SpotBuyTokens: FC<IPropTypes> = function ({ currentToken, onTokenChange }) {
  const [search, setSearch] = useState('');

  const { filteredTokens, isFetched } = useFilteredBuySpotTokens({ search });

  return (
    <SpotTokensModal
      search={search}
      setSearch={setSearch}
      filteredTokens={filteredTokens}
      currentToken={currentToken}
      isFetched={isFetched}
      isSell={false}
      onTokenChange={onTokenChange}
    />
  );
};

export default SpotBuyTokens;
