/**
 * @description Component-p.underlyingSearch
 */
import { FC, memo, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Empty from '@/components/Empty';
import { Search } from '@/components/Input';
import TokenPair from '@/components/TokenPair';
import { CreativePair } from '@/types/pair';

import { Select } from '@/components/Select';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { DAPP_CHAIN_CONFIGS, DISPLAYABLE_CHAIN_ID } from '@/constants/chain';
import { SOCIAL_LINKS } from '@/constants/links';
import { useCreativePairList } from '@/features/market/hooks';
import { getChainName } from '@/utils/chain';
import _ from 'lodash';
import { ReactComponent as NetIcon } from './assets/icon_net_all.svg';
import './index.less';

interface IPropTypes {
  onSelected: (pair: CreativePair) => void;
}
const CreativePairSearch: FC<IPropTypes> = function ({ onSelected }) {
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const [selectedChainId, setSelectedChainId] = useState(0);
  const futureList = useCreativePairList(selectedChainId);
  const { t } = useTranslation();
  const chainOptions = useMemo(() => {
    const chains = DISPLAYABLE_CHAIN_ID.map((chainId) => ({
      value: chainId,
      label: (
        <div className={'syn-CreativePairSearch-select-option'}>
          <img src={DAPP_CHAIN_CONFIGS[chainId]?.network.icon} />{' '}
          <span className={'syn-CreativePairSearch-select-option-value'}>{getChainName(chainId)}</span>
        </div>
      ),
    }));
    return [
      {
        value: 0,
        label: (
          <div className={'syn-CreativePairSearch-select-option'}>
            <NetIcon />
            <span className={'syn-CreativePairSearch-select-option-value'}> {t('common.poolList.allNet')}</span>
          </div>
        ),
      },
      ...chains,
    ];
  }, [t]);
  const filteredPairList = useMemo(() => {
    let list = futureList;
    const searchStr = search.toUpperCase();
    if (searchStr.length > 0) {
      list = list?.filter((pair) => {
        const baseToken = pair?.rootInstrument?.baseToken;
        const quoteToken = pair?.rootInstrument?.quoteToken;
        if (baseToken?.symbol && quoteToken?.symbol) {
          const displayExpiry = pair.expiry;
          const pairString =
            pair.rootInstrument?.baseToken?.symbol + '' + pair.rootInstrument?.quoteToken?.symbol + '' + displayExpiry;
          const pairStringSlash =
            pair.rootInstrument?.baseToken?.symbol + '/' + pair.rootInstrument?.quoteToken?.symbol + '' + displayExpiry;
          return (
            pairString.toLowerCase().includes(searchStr.toLowerCase()) ||
            pairStringSlash.toLowerCase().includes(searchStr.toLowerCase())
          );
        }
        return false;
      });
    }

    return _.sortBy(list, [(pair) => pair.rootInstrument.displaySymbol], ['asc']);
  }, [futureList, search]);
  useEffect(() => {
    setTimeout(() => {
      searchRef.current?.querySelector('input')?.focus();
    });
  }, []);
  return (
    <div className={'syn-CreativePairSearch'}>
      <div ref={searchRef} className={'syn-CreativePairSearch-search'}>
        <Search
          className={'syn-CreativePairSearch-input'}
          placeholder={t('common.search')}
          value={search}
          allowClear={false}
          onChange={(e) => {
            setSearch(e.target.value.trim());
          }}
        />
        <Select
          dropdownAlign={{ offset: [0, -0.5] }}
          className={'syn-CreativePairSearch-select'}
          defaultValue={selectedChainId}
          popupClassName={'syn-CreativePairSearch-select-popup'}
          popupMatchSelectWidth={false}
          placement="bottomRight"
          onChange={setSelectedChainId}
          options={chainOptions}
        />
      </div>
      <div className={'syn-CreativePairSearch-list'}>
        {filteredPairList.length > 0 && (
          <>
            <div className={'syn-CreativePairSearch-list-header'}>
              {
                <UnderlineToolTip
                  title={
                    <Trans
                      i18nKey={'tooltip.earnPage.pool'}
                      components={{
                        a: (
                          <a
                            href={SOCIAL_LINKS.DISCORD}
                            style={{ textDecoration: 'underline' }}
                            target="_blank"
                            rel="noreferrer"
                          />
                        ),
                      }}
                    />
                  }>
                  <span className={'syn-CreativePairSearch-list-header__left'}>{t('common.pair')}</span>
                </UnderlineToolTip>
              }

              <span className={'syn-CreativePairSearch-list-header__right'}>{t('common.margin')}</span>
            </div>
            <div className={'syn-CreativePairSearch-list-items syn-scrollbar'}>
              {filteredPairList?.map((p: CreativePair) => (
                <div
                  onClick={() => onSelected(p)}
                  className={'syn-CreativePairSearch-list-item'}
                  key={p.symbol + p.chainId.toString()}>
                  <div className={'syn-CreativePairSearch-list-item__left'}>
                    <div className={'syn-CreativePairSearch-list-item__left-top'}>
                      {' '}
                      <TokenPair
                        baseToken={p.rootInstrument.baseToken}
                        quoteToken={p.rootInstrument.quoteToken}
                        marketType={p.rootInstrument.marketType}
                        isInverse={p.rootInstrument.isInverse}
                        expiry={p.expiry}
                        tokenSize={40}
                        verticalMode={true}
                        chainId={p.chainId}
                        showChainIcon={true}
                        showOracle={true}
                      />
                    </div>
                  </div>
                  <div className={'syn-CreativePairSearch-list-item__right'}>
                    {p.rootInstrument?.quoteToken?.symbol}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {!filteredPairList?.length && <Empty />}
      </div>
    </div>
  );
};

export default memo(CreativePairSearch);
