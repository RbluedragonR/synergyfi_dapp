/**
 * @description Component-TradingPairsHeader
 */
import { useTranslation } from 'react-i18next';
import './index.less';

import { DAPP_CHAIN_CONFIGS, MARKET_CHAIN_DISPLAY } from '@/constants/chain';
import { useMarginSearch } from '@/features/market/hooks';
import { ALL_SELECTOR } from '@/types/global';
import classNames from 'classnames';
import { FC } from 'react';
import MarketStats from '../../MarketStats';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TradingPairsHeader: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const {
    marginSearchProps: { marginSelector, filter, marginCustomSelectorId, search, selectedChainIds },
    goToSelectorWithFilter,
  } = useMarginSearch();
  return (
    <div className="syn-trading-pairs-header">
      <div className="syn-trading-pairs-header-left">
        {t('common.markets')}
        <div className="syn-trading-pairs-header-left-chains">
          {MARKET_CHAIN_DISPLAY.map((id) => (
            <div
              key={id}
              onClick={() =>
                goToSelectorWithFilter(
                  marginSelector || ALL_SELECTOR.ALL,
                  marginCustomSelectorId || undefined,
                  filter,
                  search,
                  selectedChainIds?.includes(id) ? [] : [id],
                )
              }
              className={classNames('syn-trading-pairs-header-left-chains-btn', {
                selected: selectedChainIds?.includes(id),
              })}>
              {DAPP_CHAIN_CONFIGS[id]?.network.icon && (
                <img
                  loading="lazy"
                  width={16}
                  height={16}
                  src={DAPP_CHAIN_CONFIGS[id]?.network.icon}
                  className="header-network-img"
                  alt="Switch Network"
                />
              )}
              <div className="header-network-label">{DAPP_CHAIN_CONFIGS[id]?.network?.name}</div>
            </div>
          ))}
          {/* {!!selectedChainIds?.length && (
            <div
              className="syn-trading-pairs-header-left-chains-btn reset"
              onClick={() =>
                goToSelectorWithFilter(
                  marginSelector || ALL_SELECTOR.ALL,
                  marginCustomSelectorId || undefined,
                  filter,
                  search,
                  [],
                )
              }>
              {t('common.reset')}
            </div>
          )} */}
        </div>
      </div>
      <MarketStats />
    </div>
  );
};

export default TradingPairsHeader;
