import cls from 'classnames';
import { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Container from '@/components/Container';
import { Default } from '@/components/MediaQuery';
import { MARKET_FILTERS } from '@/constants/market';
import { useMarginSearch, useMarketList } from '@/features/market/hooks';
import { ALL_SELECTOR, FAV_SELECTOR } from '@/types/global';

import './index.less';
// import MarginTypeSelector from './MarginTypeSelector';
import { useFavMarketPairs } from '@/hooks/useFavorites';
import MarketCustomPairsSelector from './MarketCustomPairsSelector';
import PairSearch from './PairSearch';

const TableSearchBar: FC = () => {
  const { t } = useTranslation();
  const {
    marginSearchProps: { marginSelector, selectedChainIds, marginCustomSelectorId, filter, search },
    goToSelectorWithFilter,
    resetMarginSearch,
  } = useMarginSearch();
  const favorites = useFavMarketPairs(selectedChainIds);
  const { marketPairList: pairs } = useMarketList(selectedChainIds);
  // const status = useMarketListStatus();

  /**
   * @description if has favorite , show icon
   */
  const hasFavoritePair = useMemo(() => {
    return favorites && favorites.length > 0;
  }, [favorites]);

  // // switch to all if no favorite after first initiation
  // useEffect(() => {
  //   if (!hasFavoritePair && marginSelector === FAV_SELECTOR.FAVORITE) {
  //     goToSelectorWithFilter(ALL_SELECTOR.ALL, '', MARKET_FILTERS.PERPETUAL);
  //   }
  // }, [hasFavoritePair, marginSelector]);

  // Initialize MARGIN_TYPE only when FETCHING_STATUS.DONE and chainId changed
  useEffect(() => {
    if (!!pairs?.length) {
      if (!hasFavoritePair) {
        goToSelectorWithFilter(ALL_SELECTOR.ALL, '', MARKET_FILTERS.PERPETUAL);
      } else if (!marginSelector) {
        goToSelectorWithFilter(FAV_SELECTOR.FAVORITE);
      }
    }
  }, [hasFavoritePair, !pairs?.length]);

  useEffect(() => {
    return () => {
      resetMarginSearch();
    };
  }, [resetMarginSearch]);

  const isPairMoreThanZero = useMemo(() => {
    return pairs && pairs.length > 0;
  }, [pairs]);
  return (
    <div className={'search_tab'}>
      <Default>
        <>
          <Container className={'tab-bar-content'}>
            {isPairMoreThanZero && (
              <div className={'tab-bar'}>
                <div className={'tab-bar__switch'}>
                  {hasFavoritePair && (
                    <div
                      className={cls('tab-bar__switch-favorite', {
                        ['favorite_active']: marginSelector === FAV_SELECTOR.FAVORITE,
                      })}
                      onClick={() =>
                        goToSelectorWithFilter(FAV_SELECTOR.FAVORITE, marginCustomSelectorId || '', filter, search)
                      }>
                      <span>{t('common.favorite')}</span>
                    </div>
                  )}
                  {isPairMoreThanZero && (
                    <div
                      className={cls('tab-bar__switch-all', {
                        ['all_active']: marginSelector === ALL_SELECTOR.ALL,
                      })}
                      onClick={() => goToSelectorWithFilter(ALL_SELECTOR.ALL, '', MARKET_FILTERS.PERPETUAL, search)}>
                      <span>{t('common.all')}</span>
                    </div>
                  )}
                  {/* <MarginTypeSelector /> */}
                  <MarketCustomPairsSelector />
                </div>

                {/* {marginSelector !== FAV_SELECTOR.FAVORITE && <MarketTableFilter filter={filter} />} */}
                <div className={'tab-bar__right'}>
                  <PairSearch />
                </div>
              </div>
            )}
          </Container>
        </>
      </Default>
    </div>
  );
};

export default TableSearchBar;
