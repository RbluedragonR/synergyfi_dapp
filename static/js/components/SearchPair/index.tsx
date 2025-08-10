/**
 * @description Component-SearchPair
 */
import './index.less';

import { default as classNames, default as cls } from 'classnames';
import _ from 'lodash';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { Search } from '@/components/Input';
import {
  PAIR_PAGE_TYPE,
  SEARCH_PAIR_DIRECTION,
  SEARCH_PAIR_SORTERS,
  SEARCH_PAIR_SORTERS_TRANSLATION,
  TRADE_LEVERAGE_THRESHOLDS,
  TVL_THRESHHOLD,
} from '@/constants/global';
import { WrappedPair } from '@/entities/WrappedPair';
import { resetLiquidityFormByChainId } from '@/features/earn/action';
import { useCombinedPairFromUrl, useDormantPair } from '@/features/pair/hook';
import { resetFormByChainId } from '@/features/trade/actions';
import { useAppDispatch } from '@/hooks';
import { useFavorites } from '@/hooks/useFavorites';
import { useSideNavigate } from '@/hooks/useRouterNavigate';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import TGPTag from '@/pages/TGP/components/TGPTag';
import { CreativePair, IMarketPair } from '@/types/pair';
import { searchPair } from '@/utils/feature';
import { savePairChosen } from '@/utils/localstorage';

import { ReactComponent as DropDownIcon } from '@/assets/svg/dropdown.svg';
import { mockOpenDropdown } from '@/constants/mock';
import { QUERY_KEYS } from '@/constants/query';
import { SEARCH_PAIR_SORTER, SEARCH_PAIR_SORTER_DIRECTION } from '@/constants/storage';
import { useBackendChainConfig } from '@/features/config/hook';
import { useCreativePairList, useMarketList } from '@/features/market/hooks';
import { queryClient } from '@/pages/App';
import { usePairCheck } from '@/pages/components/PairInfo/pairCheckHook';
import { Button } from '../Button';
import Dropdown from '../Dropdown';
import Empty from '../Empty';
import { EmptyDataWrap } from '../EmptyDataWrap';
import TokenPair from '../TokenPair';
import SearchPairSorter from './SearchPairSorter';
interface IPropTypes {
  type: PAIR_PAGE_TYPE;
  createOnly?: boolean;
  tagExtra?: ReactNode;
}
const SearchPair: FC<IPropTypes> = function ({ type = PAIR_PAGE_TYPE.TRADE, createOnly, tagExtra }) {
  const [search, setSearch] = useState('');
  const userAddr = useUserAddr();
  const chainId = useChainId();
  const { pairPageNavigate } = useSideNavigate();
  const { t } = useTranslation();
  const { marketPairList } = useMarketList([chainId]);
  const dispatch = useAppDispatch();
  const [sorters, setSorters] = useState({
    sorter: (localStorage.getItem(SEARCH_PAIR_SORTER) as SEARCH_PAIR_SORTERS) || SEARCH_PAIR_SORTERS.VOLUME_24H,
    direction:
      (localStorage.getItem(SEARCH_PAIR_SORTER_DIRECTION) as SEARCH_PAIR_DIRECTION) || SEARCH_PAIR_DIRECTION.DSC,
  });
  const searchRef = useRef<HTMLDivElement>(null);
  const pairListRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  // const wrappedPairs = useDisplayPairList(chainId);

  const [showPopup, setShowPopup] = useState(mockOpenDropdown);

  // const theme = useTheme();
  const dropDownRef = useRef<HTMLDivElement>(null);
  const { pairSymbol } = useParams();
  const favorites = useFavorites(chainId);
  const unInitiatedPair = useDormantPair(chainId);
  const dappConfig = useBackendChainConfig(chainId);
  const creativePairs = useCreativePairList(chainId);
  const currentPairBaseInfo = useCombinedPairFromUrl(chainId);

  const sortersMap = useMemo(
    () => ({
      [SEARCH_PAIR_SORTERS.FAVORITE]: (pair: IMarketPair) => {
        const isInFavorite = _.get(favorites, [`${pair?.id}-${chainId}`]);
        return isInFavorite ? 1 : -1;
      },
      [SEARCH_PAIR_SORTERS.EARN_FAVORITE]: (pair: IMarketPair) => {
        const isInFavorite = _.get(favorites, [`${pair?.id}-${chainId}`]);
        return isInFavorite ? 1 : -1;
      },
      [SEARCH_PAIR_SORTERS.VOLUME_24H]: (pair: IMarketPair) => {
        return pair?.volume24hUsd?.toNumber?.();
      },
      [SEARCH_PAIR_SORTERS.OI]: (pair: IMarketPair) => {
        return pair?.openInterestsUsd?.toNumber?.();
      },
      [SEARCH_PAIR_SORTERS.TVL]: (pair: IMarketPair) => {
        return pair?.tvlUsd?.toNumber?.();
      },
      [SEARCH_PAIR_SORTERS.CHANGE_24H]: (pair: IMarketPair) => {
        return pair?.fairPriceChange24h?.toNumber?.();
      },
      [SEARCH_PAIR_SORTERS.APY]: (pair: IMarketPair) => {
        return pair?.liquidityApy?.toNumber?.();
      },
      [SEARCH_PAIR_SORTERS.BOOSTED_LIQUIDITY]: (pair: IMarketPair) => {
        return pair?.effectLiqTvl?.toNumber?.();
      },
    }),
    [favorites, chainId],
  );
  const filteredCreativePairs = useMemo(() => {
    const searchStr = search;
    const pairs = creativePairs?.filter((pair) => {
      if (searchStr.length > 0)
        return searchPair(
          searchStr,
          pair?.rootInstrument.baseToken.symbol,
          pair?.rootInstrument.quoteToken.symbol,
          pair.expiry,
        );
      return true;
    });

    return pairs;
  }, [creativePairs, search]);
  const unInitiatedPairTransformed = useMemo(
    () =>
      unInitiatedPair.map((p) => ({
        id: p.id,
        pairSymbol: p.symbol,
        instrumentSymbol: p.rootInstrument.symbol,
        instrumentAddr: p.instrumentAddr,
        baseToken: p.rootInstrument.baseToken,
        quoteToken: p.rootInstrument.quoteToken,
        expiry: p.expiry,
        chainId: p.chainId,
        inInverse: p.isInverse,
        liquidityApy: p.stats?.liquidityApy,
        tvlUsd: p.tvlUSD,
        effectLiqTvl: p.effectLiqTvl,
        openInterestsUsd: p.openInterestsUSD,
        openInterests: p.wrapAttribute('openInterests'),
        volume24hUSD: p.volume24hUSD,
        fairPrice: p.wrapAttribute('fairPrice'),
        markPrice: p.wrapAttribute('markPrice'),
        fairPriceChange24h: p.stats?.fairPriceChange24h,
        marketPriceChange24h: p.stats?.markPriceChange24h,
        tvl: p.wrapAttribute('tvl'),
      })),
    [unInitiatedPair],
  );
  const filteredSearchPair = useMemo(() => {
    const searchStr = search;
    const pairs = [...(createOnly ? [] : marketPairList || []), ...unInitiatedPairTransformed]
      .filter((p) => !dappConfig?.pairsToBeFilteredInMarketAndEarn?.includes(p.pairSymbol))
      .filter((pair) => {
        if (searchStr.length > 0)
          return searchPair(searchStr, pair?.baseToken.symbol, pair?.quoteToken.symbol, pair.expiry);
        return true;
      })
      .map((p) => {
        // const wrappedPair = wrappedPairs.find((wp) => wp.id === p.id);
        // if (wrappedPair) {
        //   return {
        //     ...p,
        //     fairPrice: wrappedPair.wrapAttribute('fairPrice'),
        //     markPrice: wrappedPair.wrapAttribute('markPrice'),
        //     fairPriceChange24h: wrappedPair.stats?.wrapAttribute('priceChange24h'),
        //     tvl: wrappedPair.wrapAttribute('tvl'),
        //     openInterests: wrappedPair.wrapAttribute('openInterests'),
        //     tvlUsd: wrappedPair.tvlUSD,
        //     openInterestsUsd: wrappedPair.openInterestsUSD,
        //     liquidityApy: wrappedPair.stats?.wrapAttribute('APY24h'),
        //     effectLiqTvl: wrappedPair.effectLiqTvl,
        //   };
        // }
        return p;
      });

    return _.orderBy(pairs, [sortersMap[sorters.sorter]], [sorters.direction]) as IMarketPair[];
  }, [
    search,
    createOnly,
    marketPairList,
    unInitiatedPairTransformed,
    sortersMap,
    sorters.sorter,
    sorters.direction,
    dappConfig?.pairsToBeFilteredInMarketAndEarn,
  ]);

  const noRecord = useMemo(() => {
    if (type === PAIR_PAGE_TYPE.EARN) {
      return !filteredSearchPair?.length && !filteredCreativePairs?.length;
    }
    return !filteredSearchPair.length;
  }, [filteredCreativePairs?.length, filteredSearchPair.length, type]);
  usePairCheck(
    chainId,
    currentPairBaseInfo?.symbol,
    [
      ...filteredSearchPair.map((p) => p.pairSymbol),
      ...(type === PAIR_PAGE_TYPE.EARN && filteredSearchPair?.length ? creativePairs.map((p) => p.symbol) : []),
    ],
    type,
    createOnly || type === PAIR_PAGE_TYPE.EARN,
  );
  const selectPair = useCallback(
    (symbol: string, chainId: number, isCreative?: boolean, instrumentAddr?: string, expiry?: number) => {
      if (symbol !== pairSymbol) {
        if (createOnly) {
          pairPageNavigate(symbol || '', PAIR_PAGE_TYPE.EARN, chainId);
        } else {
          pairPageNavigate(symbol || '', type, chainId);
        }
        if (type === PAIR_PAGE_TYPE.TRADE) {
          if (!isCreative && instrumentAddr) {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FUTURES.INSTRUMENT(chainId, instrumentAddr) });
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.FUTURES.PAIR_INFO(chainId, instrumentAddr, expiry),
            });
          }
          chainId && dispatch(resetFormByChainId({ chainId }));
        } else {
          chainId && dispatch(resetLiquidityFormByChainId({ chainId }));
        }

        chainId && userAddr && savePairChosen(userAddr, chainId, symbol, type as PAIR_PAGE_TYPE);
      }
      dropDownRef.current?.click();
    },
    [pairSymbol, createOnly, type, userAddr, pairPageNavigate, dispatch],
  );
  const dropdownRenderer = useCallback(
    () =>
      showPopup ? (
        <div className={`syn-search_pair popup_show`} ref={searchRef}>
          <div className="syn-search_pair-header">
            <Search
              className={cls('syn-search_pair-header-input')}
              placeholder="Search"
              value={search}
              allowClear={false}
              onChange={(e) => {
                const value = e.target.value.trim().replace(/[^\w]/g, '');
                setSearch(value);
              }}
            />
            {!createOnly && <SearchPairSorter type={type} value={sorters} onChange={setSorters} />}
          </div>
          <div className="syn-search_pair-container syn-scrollbar" ref={pairListRef}>
            <div className="syn-search_pair-list top">
              <div className="syn-search_pair-list-item list-header">
                <div className="syn-search_pair-list-item-left">
                  {t(`common.${type === PAIR_PAGE_TYPE.EARN ? 'pair' : 'pair'}`)}
                </div>
                <div className="syn-search_pair-list-item-middle">{t(`common.table.fairMarkP`)}</div>
                <div className="syn-search_pair-list-item-right">
                  {t(`common.${SEARCH_PAIR_SORTERS_TRANSLATION[sorters.sorter]}`)}
                </div>
              </div>
              {filteredSearchPair.map((v) => (
                <div
                  onClick={() => {
                    selectPair(v.pairSymbol, v.chainId, false, v.instrumentAddress, v.expiry);
                  }}
                  className={classNames('syn-search_pair-list-item', {
                    hide: type === PAIR_PAGE_TYPE.TRADE && v.tvlUsd?.lt?.(TVL_THRESHHOLD),
                  })}
                  key={v.instrumentSymbol + v.expiry}>
                  <div className="syn-search_pair-list-item-symbol">
                    <TokenPair
                      showFavorite={true}
                      showMarginText
                      requiredMarginIcon={false}
                      tokenSize={40}
                      baseToken={v.baseToken}
                      quoteToken={v.quoteToken}
                      isInverse={v.isInverse || false}
                      expiry={v.expiry}
                      verticalMode={true}
                      showLeverage
                      showChainIcon={true}
                      chainId={v.chainId}
                      tagExtra={<TGPTag pairSymbol={v.pairSymbol} />}
                      isShowExpiryTag
                      leverage={v.maxLeverage}
                      showShortPerp={true}
                      instrumentAddr={v.instrumentAddress}
                      marketType={v.marketType}
                    />
                  </div>
                  <div className="syn-search_pair-list-item-price">
                    <div className="syn-search_pair-list-item-price-top">
                      {v.fairPrice.formatPriceNumberWithTooltip?.()}
                    </div>
                    {v.markPrice.formatPriceNumberWithTooltip?.()}
                  </div>
                  <div className="syn-search_pair-list-item-sorter">
                    {/* <div>{v.wrapAttribute('fairPriceWad').formatDisplayNumber()}</div> */}
                    {sorters.sorter === SEARCH_PAIR_SORTERS.CHANGE_24H && (
                      <>
                        {v?.fairPriceChange24h?.formatPercentage?.()}
                        <div className="syn-search_pair-list-item-sorter-bottom">
                          {v?.markPriceChange24h?.formatNumberWithTooltip?.()}
                        </div>
                      </>
                    )}
                    {sorters.sorter === SEARCH_PAIR_SORTERS.OI && (
                      <EmptyDataWrap isLoading={!v.openInterests}>
                        <div className="syn-search_pair-list-item-sorter-top">
                          {v.openInterestsUsd.formatNumberWithTooltip?.({ prefix: '$', isShowTBMK: true })}
                        </div>
                        <div className="syn-search_pair-list-item-sorter-bottom">
                          {v.openInterests.formatNumberWithTooltip?.({
                            suffix: v.baseToken.symbol,
                            isShowTBMK: true,
                          })}
                        </div>
                      </EmptyDataWrap>
                    )}
                    {(sorters.sorter === SEARCH_PAIR_SORTERS.VOLUME_24H ||
                      sorters.sorter === SEARCH_PAIR_SORTERS.FAVORITE) && (
                      <EmptyDataWrap isLoading={!v?.volume24hUsd}>
                        <div className="syn-search_pair-list-item-sorter-top">
                          {v.volume24hUsd.formatNumberWithTooltip?.({ prefix: '$', isShowTBMK: true })}
                        </div>
                        <div className="syn-search_pair-list-item-sorter-bottom">
                          {v.volume24h.formatNumberWithTooltip?.({
                            suffix: v.marginToken.symbol,
                            isShowTBMK: true,
                          })}
                        </div>
                      </EmptyDataWrap>
                    )}
                    {sorters.sorter === SEARCH_PAIR_SORTERS.TVL && (
                      <EmptyDataWrap isLoading={!v?.liquidityApy}>
                        <div className="syn-search_pair-list-item-sorter-top">
                          {v.tvlUsd.formatNumberWithTooltip?.({ prefix: '$', isShowTBMK: true })}
                        </div>
                        <div className="syn-search_pair-list-item-sorter-bottom">
                          {v.tvl.formatNumberWithTooltip?.({
                            suffix: v.marginToken.symbol,
                            isShowTBMK: true,
                          })}
                        </div>
                      </EmptyDataWrap>
                    )}
                    {sorters.sorter === SEARCH_PAIR_SORTERS.BOOSTED_LIQUIDITY && (
                      <EmptyDataWrap isLoading={!v?.effectLiqTvl}>
                        <div className="syn-search_pair-list-item-sorter-top">
                          {v.effectLiqTvl?.formatNumberWithTooltip?.({ prefix: '$', isShowTBMK: true })}
                        </div>
                      </EmptyDataWrap>
                    )}
                    {sorters.sorter === SEARCH_PAIR_SORTERS.APY && (
                      <EmptyDataWrap isLoading={!v?.liquidityApy}>
                        <div className="syn-search_pair-list-item-sorter-top">{v.liquidityApy?.formatPercentage()}</div>
                      </EmptyDataWrap>
                    )}
                  </div>
                </div>
              ))}
              {type === PAIR_PAGE_TYPE.EARN && (
                <>
                  <div className={classNames('syn-search_pair-list-divider')}></div>
                  {filteredCreativePairs?.map((v: CreativePair) => (
                    <div
                      onClick={() => {
                        selectPair(v.symbol, v.chainId);
                      }}
                      className={classNames('syn-search_pair-list-item')}
                      key={v.id}>
                      <div className="syn-search_pair-list-item-symbol">
                        <TokenPair
                          baseToken={v.rootInstrument.baseToken}
                          quoteToken={v.rootInstrument.quoteToken}
                          showFavorite={true}
                          tokenSize={24}
                          chainId={v.chainId}
                          isInverse={v.rootInstrument.isInverse || false}
                          expiry={v.expiry}
                          isShowExpiryTag
                          showLeverage={false}
                          showOracle={true}
                          tagExtra={<TGPTag pairSymbol={v.symbol} />}
                          marketType={v.rootInstrument.marketType}
                        />
                      </div>
                      <div className="syn-search_pair-list-item-price">-</div>
                      <div className="syn-search_pair-list-item-sorter">-</div>
                    </div>
                  ))}
                </>
              )}
            </div>
            {noRecord && <Empty />}
          </div>
        </div>
      ) : (
        <></>
      ),
    [createOnly, filteredCreativePairs, filteredSearchPair, noRecord, search, selectPair, showPopup, sorters, t, type],
  );
  useEffect(() => {
    if (showPopup) {
      setTimeout(() => {
        searchRef.current?.querySelector('input')?.focus();
        pairListRef.current?.scrollTo({ top: 0 });
      });
    } else {
    }
  }, [showPopup]);

  return (
    <div className="syn-pair-selector-container">
      <Dropdown
        align={{
          offset: [0, 16],
        }}
        withPadding={false}
        overlayClassName="syn-pair-selector-overlay"
        onOpenChange={(open) => {
          if (open) {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MARKET.PAIR_LIST() });
            setSearch('');
            setSorters({
              sorter:
                (localStorage.getItem(SEARCH_PAIR_SORTER) as SEARCH_PAIR_SORTERS) || SEARCH_PAIR_SORTERS.VOLUME_24H,
              direction:
                (localStorage.getItem(SEARCH_PAIR_SORTER_DIRECTION) as SEARCH_PAIR_DIRECTION) ||
                SEARCH_PAIR_DIRECTION.DSC,
            });
          }
          !mockOpenDropdown && setShowPopup(open);
        }}
        getPopupContainer={() => {
          return popupRef.current as HTMLElement;
        }}
        dropdownRender={dropdownRenderer}>
        <div ref={dropDownRef} className="syn-pair-selector">
          {createOnly ? (
            <Button type="text">{t('common.market.newP')}</Button>
          ) : (
            <div className="syn-pair-selector-fixed">
              {/* // For menu go left */}
              <div style={{ width: 16, height: 16 }} />
              <div className="syn-pair-symbol">
                {currentPairBaseInfo?.rootInstrument && (
                  <TokenPair
                    showMarginText
                    requiredMarginIcon={false}
                    tokenSize={40}
                    baseToken={currentPairBaseInfo?.rootInstrument.baseToken}
                    quoteToken={currentPairBaseInfo?.rootInstrument.quoteToken}
                    isInverse={currentPairBaseInfo?.rootInstrument.isInverse || false}
                    expiry={currentPairBaseInfo?.expiry}
                    verticalMode={true}
                    showLeverage={currentPairBaseInfo instanceof WrappedPair}
                    showChainIcon={true}
                    chainId={currentPairBaseInfo?.chainId}
                    tagExtra={
                      <div>
                        <TGPTag pairSymbol={currentPairBaseInfo?.symbol} />
                        {tagExtra}
                        {/* <FarcasterButton
                          variant="logoOnly"
                          style={{ marginLeft: 4 }}
                          onClick={() => {
                            if (currentPair instanceof WrappedPair) {
                              cast({
                                text: `On Chain Perpetuals of Any Assets on @SynFuturesDefi . 🚀 #CryptoTrading #DeFi`,
                                url: `${FARCASTER_LINK}/trade?chainId=${chainId}&instrument=${currentPair.rootInstrument.instrumentAddr}&expiry=${currentPair.expiry}`,
                              });
                            }
                          }}
                        /> */}
                      </div>
                    }
                    dropdownIcon={
                      <DropDownIcon
                        className={classNames(showPopup ? 'rotate' : '', 'syn-pair-selector-fixed-drop-icon')}
                      />
                    }
                    isShowExpiryTag
                    leverage={(currentPairBaseInfo as WrappedPair)?.maxLeverage || TRADE_LEVERAGE_THRESHOLDS.MAX}
                    showShortPerp={true}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </Dropdown>
      <div ref={popupRef} className="syn-pair-selector-popup-container"></div>
    </div>
  );
};

export default React.memo(SearchPair);
