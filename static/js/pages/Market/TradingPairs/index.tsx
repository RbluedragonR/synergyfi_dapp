import _ from 'lodash';
import { useMemo, useState } from 'react';

import TradeYourOwnRiskAlert from '@/components/Alert/TradeYourOwnRiskAlert';
import { TableCard } from '@/components/TableCard';
import { useTableColumns } from '@/components/TableCard/tableConfigs';
import TableSearchBar from '@/components/TableSearchBar';
import { PAIR_PAGE_TYPE, TABLE_TYPES } from '@/constants/global';
import {
  useFilteredTradingPairs,
  useMarginSearch,
  useMarketList,
  useWatchMarketListChange,
} from '@/features/market/hooks';
import { useChainId } from '@/hooks/web3/useChain';

import { ReactComponent as NoSearchResult } from '@/assets/svg/search_empty.svg';
import { useMockDevTool } from '@/components/Mock';
import { useBackendChainConfig } from '@/features/config/hook';
import { useSideNavigate } from '@/hooks/useRouterNavigate';
import { CUSTOM_SELECTOR } from '@/types/global';
import { IMarketPair } from '@/types/pair';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import TradingPairsHeader from './TradingPairsHeader';
import './index.less';
import { marketColumnRowKey } from './tableTitles';

export default function TradingPairs(): JSX.Element {
  const chainId = useChainId();
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sorter, setSorter] = useState<any>();
  const chainConfig = useBackendChainConfig(chainId);
  const { pairPageNavigate } = useSideNavigate();
  const {
    marginSearchProps: { marginCustomSelectorId, search, selectedChainIds, marginSelector },
  } = useMarginSearch();
  const { marketPairList, isFetched } = useMarketList(selectedChainIds);
  const columnDefs = useTableColumns(TABLE_TYPES.TRADING_PAIR);

  const searchEmptyLine = useMemo(() => {
    return search ? t('common.market.noSearchResult') : undefined;
  }, [search, t]);

  const filteredPairs = useFilteredTradingPairs();

  const sortedPairs = useMemo(
    () =>
      chainConfig?.trendingPairs?.length && !_.get(sorter, ['column'])
        ? _.orderBy(
            filteredPairs,
            [
              (p) => {
                const index = chainConfig.trendingPairs?.indexOf(p.pairSymbol);
                return index === undefined || index < 0 ? filteredPairs?.length : index;
              },
            ],
            ['asc'],
          )
        : filteredPairs,
    [chainConfig?.trendingPairs, filteredPairs, sorter],
  );
  useWatchMarketListChange(chainId);
  const { isMockSkeleton } = useMockDevTool();
  return (
    <div className={classNames('market_table_card')}>
      <TradingPairsHeader />

      <TableSearchBar />
      {marginSelector === CUSTOM_SELECTOR.CUSTOM && marginCustomSelectorId && (
        <TradeYourOwnRiskAlert
          style={{ marginBottom: 4 }}
          i18nId={`common.tradeYourOwnRiskAlert.${marginCustomSelectorId}.list`}
        />
      )}

      <TableCard
        className="syn-trading-pairs-table"
        cardTitle=""
        sticky={{ offsetHeader: 104 }}
        loading={isMockSkeleton || (!isFetched && !marketPairList?.length)}
        loadingItem={isMockSkeleton || (!isFetched && !marketPairList?.length)}
        total={filteredPairs?.length}
        rowCount={10}
        rowClassName={classNames('market_table_card-row')}
        tableChange={(_e, _f, s) => {
          return setSorter(s);
        }}
        emptyDesc={searchEmptyLine}
        emptyIcon={search ? <NoSearchResult width={128} height={128} /> : undefined}
        emptyType="vertical"
        showEmptyTitle={!search}
        onRow={(record: IMarketPair) => ({
          onClick: (e) => {
            if ((e.target as HTMLElement).tagName === 'BUTTON') return;

            pairPageNavigate(record.pairSymbol || '', PAIR_PAGE_TYPE.TRADE, record.chainId);
          },
        })}
        rowKey={(record: IMarketPair) => `${record?.pairSymbol}-${marketColumnRowKey(record)}`}
        columns={columnDefs}
        dataSource={sortedPairs}
      />
    </div>
  );
}
