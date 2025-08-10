/**
 * @description Component-SpotTokensModal
 */
import './index.less';

import Empty from '@/components/Empty';
import { Search } from '@/components/Input';
import { useSpotState } from '@/features/spot/store';
import { TokenInfoInSpot } from '@/features/spot/types';
import { List } from 'antd';
import classNames from 'classnames';
import VirtualList from 'rc-virtual-list';
import { Dispatch, ForwardRefRenderFunction, SetStateAction, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import SpotTokenItem from '../../SpotTokenItem';
import SpotTokensSkeleton from '../../SpotTokensSkeleton';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  search?: string;
  setSearch: (search: string) => void;
  isSell?: boolean;
  currentToken?: TokenInfoInSpot;
  isFetched: boolean;
  filteredTokens: TokenInfoInSpot[] | undefined;
  onTokenChange: (token: TokenInfoInSpot) => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SpotTokensModalContentBase: ForwardRefRenderFunction<HTMLDivElement, IPropTypes> = function (
  { search, setSearch, isFetched, filteredTokens, onTokenChange, setOpen },
  ref,
) {
  const { t } = useTranslation();
  const { setSellAmount: setAmount } = useSpotState();
  return (
    <div className="syn-spot-tokens-modal-content" ref={ref}>
      <Search
        className={classNames('syn-spot-tokens-modal-header-input')}
        placeholder={t('common.spot.searchPlaceholder')}
        value={search}
        allowClear={false}
        onChange={(e) => {
          const value = e.target.value.trim();
          setSearch(value);
        }}
      />
      {(search?.length || 0) > 0 && (
        <span className="syn-spot-tokens-modal-header-input-tip">{t('spot.confirm-token-address')}</span>
      )}
      {!isFetched && <SpotTokensSkeleton />}
      {isFetched && filteredTokens?.length === 0 ? (
        filteredTokens?.length === 0 && <Empty type="vertical" />
      ) : (
        <div className="syn-spot-tokens-modal-container">
          <div className="syn-spot-tokens-modal-container-tokens">
            <List>
              <VirtualList
                data={filteredTokens || []}
                height={448}
                itemHeight={47}
                itemKey="address"
                className="syn-scrollbar">
                {(v: TokenInfoInSpot) => (
                  <List.Item key={v.address}>
                    <SpotTokenItem
                      token={v}
                      onTokenChange={(token) => {
                        onTokenChange(token);
                        setOpen(false);
                        setAmount('');
                      }}
                    />
                  </List.Item>
                )}
              </VirtualList>
            </List>
          </div>
        </div>
      )}
    </div>
  );
};

export const SpotTokensModalContent = forwardRef(SpotTokensModalContentBase);
