/**
 * @description Component-SpotPairs
 */
import './index.less';

import { useFilteredSellSpotTokens } from '@/features/spot/hooks';
import { TokenInfoInSpot } from '@/features/spot/types';
import { FC, useState } from 'react';
import SpotTokensModal from './SpotTokensModal';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  currentToken: TokenInfoInSpot;
  onTokenChange: (token: TokenInfoInSpot) => void;
}
const SpotSellTokens: FC<IPropTypes> = function ({ currentToken, onTokenChange }) {
  const [search, setSearch] = useState('');
  const { filteredTokens, isFetched } = useFilteredSellSpotTokens({ search });
  // const filteredFullTokens = useMemo(() => {
  //   const tokenList = !!search
  //     ? fullTokensWithNative
  //         ?.filter((t) =>
  //           search
  //             ? t.symbol.toLowerCase().includes(search.toLowerCase()) ||
  //               t.address.toLowerCase().includes(search.toLowerCase())
  //             : true,
  //         )
  //         ?.filter((t) => !filteredTokens.some((ft) => ft.address === t.address))
  //     : fullTokensWithNative
  //         ?.slice(0, 200)
  //         ?.filter((t) => !filteredTokens.some((ft) => ft.address === t.address))
  //         .slice(0, 100);
  //   const sortFuncs = [(token: TokenInfo) => token.symbol];
  //   const sortDirecs = ['asc'];
  //   return _.orderBy(tokenList, sortFuncs, sortDirecs as Many<boolean | 'asc' | 'desc'>);
  // }, [search, fullTokensWithNative, filteredTokens]);

  return (
    <SpotTokensModal
      search={search}
      setSearch={setSearch}
      filteredTokens={filteredTokens}
      currentToken={currentToken}
      isFetched={isFetched}
      isSell={true}
      onTokenChange={onTokenChange}
    />
  );
};

export default SpotSellTokens;
