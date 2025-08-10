/**
 * @description Component-PairSearch
 */
import { Search } from '@/components/Input';
import './index.less';

import ClearIcon from '@/assets/svg/icons/clear';
import { Button } from '@/components/Button';
import { useMarginSearch } from '@/features/market/hooks';
import CreatePoolBtn from '@/pages/PoolList/CreatePoolBtn';
import { ALL_SELECTOR } from '@/types/global';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PairSearch: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const {
    marginSearchProps: { marginSelector, filter, marginCustomSelectorId, search },
    goToSelectorWithFilter,
  } = useMarginSearch();
  return (
    <div className="syn-pair-search">
      <Search
        value={search}
        placeholder={t('common.search')}
        onChange={(e) =>
          goToSelectorWithFilter(
            marginSelector || ALL_SELECTOR.ALL,
            marginCustomSelectorId || undefined,
            filter,
            e.target.value,
          )
        }
        suffix={
          search && (
            <Button
              type="text"
              id="syn-pair-search-clear"
              onClick={() => {
                goToSelectorWithFilter(
                  marginSelector || ALL_SELECTOR.ALL,
                  marginCustomSelectorId || undefined,
                  filter,
                  '',
                );
              }}>
              <ClearIcon />
            </Button>
          )
        }
      />
      <CreatePoolBtn white={false} />
    </div>
  );
};

export default PairSearch;
