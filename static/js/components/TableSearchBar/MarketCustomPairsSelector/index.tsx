/**
 * @description Page-MarginTypeSelector
 */
import cls from 'classnames';
import { FC, memo, useMemo } from 'react';

import { MARKET_FILTERS } from '@/constants/market';
import { useMarginSearch } from '@/features/market/hooks';
import { CUSTOM_SELECTOR } from '@/types/global';

import { DISPLAYABLE_CHAIN_ID } from '@/constants/chain';
import { useConfigData } from '@/features/config/hook';
import _ from 'lodash';
import './index.less';

const MarketCustomPairsSelector: FC = function () {
  const {
    marginSearchProps: { marginSelector, marginCustomSelectorId, search },
    goToSelectorWithFilter: goToSelector,
  } = useMarginSearch();
  const { backendChainsConfig } = useConfigData();
  const marketCustomPairs = useMemo(
    () =>
      _.uniqBy(
        _.flatMap(
          DISPLAYABLE_CHAIN_ID.map(
            (chainId) =>
              backendChainsConfig[chainId]?.marketCustomPairs?.map((p) => ({ id: p.id, title: p.title })) || [],
          ),
        ),
        'id',
      ),
    [backendChainsConfig],
  );

  const items = useMemo(() => {
    return (marketCustomPairs || []).map((item, i) => (
      <span
        className={cls('market_custom_pairs_selector-link', {
          selected: marginSelector === CUSTOM_SELECTOR.CUSTOM && marginCustomSelectorId === item.id,
        })}
        key={i}
        onClick={() => {
          goToSelector(CUSTOM_SELECTOR.CUSTOM, item.id, MARKET_FILTERS.PERPETUAL, search);
        }}>
        {item.title}
      </span>
    ));
  }, [marketCustomPairs, goToSelector, marginCustomSelectorId, marginSelector, search]);

  return <div className="market_custom_pairs_selector">{items}</div>;
};

export default memo(MarketCustomPairsSelector);
