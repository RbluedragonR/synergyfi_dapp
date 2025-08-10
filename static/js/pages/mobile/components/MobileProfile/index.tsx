/**
 * @description Component-TradeMobileProfile
 */
import './index.less';

import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GlobalModalType } from '@/constants';
import { PAIR_PAGE_TYPE, TABLE_TYPES } from '@/constants/global';
import { HISTORY_TYPE } from '@/constants/history';
import { OPEN_ORDER_QUERY_KEY } from '@/constants/trade';
import { useWrappedOrderList } from '@/features/account/orderHook';
import { useIsIpBlocked, useToggleModal } from '@/features/global/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { setIsChosenOrder } from '@/features/trade/actions';
import { useTradePortfolioTab } from '@/features/trade/hooks';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { ReactComponent as IconLastTrade } from '@/pages/mobile/assets/svg/icon_last_trade_hover.svg';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';

import { Button } from '@/components/Button';
import SynTitleTabs from '@/components/Tabs/SynTitleTabs';
import { useWrappedRangeList } from '@/features/account/rangeHook';
import { useBackendChainConfig } from '@/features/config/hook';
import { setTradePortfolioTab } from '@/features/trade/slice';
import EarnHistoryDrawer from '../../EarnMobile/EarnHistoryDrawer';
import EarnLiquiditiesMobile from '../../EarnMobileSubpage/EarnLiquiditiesMobile';
import TradeHistoryDrawer from '../../TradeMobile/TradeHistoryDrawer';
import TradeOrdersMobile from '../../TradeMobile/TradeOrdersMobile';
import TradePositionMobile from '../../TradeMobile/TradePositionMobile';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  type?: PAIR_PAGE_TYPE;
}
const MobileProfile: FC<IPropTypes> = function ({ type = PAIR_PAGE_TYPE.TRADE }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const tabPosition = useTradePortfolioTab();
  const currentPair = useCurrentPairFromUrl(chainId);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyType, setHistoryType] = useState(HISTORY_TYPE.TRADE);
  const walletConnectStatus = useWalletConnectStatus();
  const toggleWalletModal = useToggleModal(GlobalModalType.Wallet);
  const isIpBlocked = useIsIpBlocked();
  const openOrders = useWrappedOrderList(chainId, userAddr, currentPair?.id);
  const rangeList = useWrappedRangeList(chainId, userAddr, currentPair?.id);

  const dappConfig = useBackendChainConfig(chainId);
  const items = useMemo(() => {
    const res: { key: string; label: React.ReactNode }[] =
      type === PAIR_PAGE_TYPE.TRADE
        ? ([
            {
              key: TABLE_TYPES.POSITION,
              label: t('common.position'),
            },
            dappConfig?.trade?.isDisableLimitOrder
              ? undefined
              : {
                  key: TABLE_TYPES.OPEN_ORDERS,
                  label: (
                    <div
                      className={classNames(
                        'syn-mobile-profile-tab-title',
                        tabPosition === TABLE_TYPES.OPEN_ORDERS ? 'selected' : '',
                      )}>
                      <span>{t('common.tradePage.openO')}</span>
                      {!!openOrders?.length && (
                        <div className="syn-mobile-profile-tab-count">{openOrders?.length || 0}</div>
                      )}
                    </div>
                  ),
                },
          ].filter((t) => t !== undefined) as { key: string; label: React.ReactNode; children: React.ReactNode }[])
        : [
            {
              key: TABLE_TYPES.LIQUIDITY,
              label: (
                <div
                  className={classNames(
                    'syn-mobile-profile-tab-title',
                    tabPosition === TABLE_TYPES.LIQUIDITY ? 'selected' : '',
                  )}>
                  <span>{t('common.earn.myLiq')}</span>
                  {!!rangeList?.length && <div className="syn-mobile-profile-tab-count">{rangeList?.length || 0}</div>}
                </div>
              ),
            },
          ];

    return res;
  }, [type, t, dappConfig?.trade?.isDisableLimitOrder, tabPosition, openOrders?.length, rangeList?.length]);

  const onChange = useCallback(
    (e: string) => {
      console.log('🚀 ~ file: index.tsx:53 ~ onChange ~ e:', e);
      chainId && dispatch(setTradePortfolioTab({ tab: e as TABLE_TYPES, chainId }));
    },
    [chainId, dispatch],
  );

  useEffect(() => {
    if (chainId) {
      dispatch(setIsChosenOrder({ isChosenOrder: false, chainId }));
    }
    // only depend on these
  }, [tabPosition, dispatch, chainId]);
  useEffect(() => {
    if (type === PAIR_PAGE_TYPE.TRADE) {
      if (localStorage.getItem(OPEN_ORDER_QUERY_KEY)) {
        onChange(TABLE_TYPES.OPEN_ORDERS);
        if (currentPair) {
          setTimeout(() => {
            localStorage.setItem(OPEN_ORDER_QUERY_KEY, '');
          }, 0);
        }
      } else {
        onChange(TABLE_TYPES.POSITION);
      }
    } else {
      onChange(TABLE_TYPES.LIQUIDITY);
    }
    // only depend on this
  }, [currentPair, onChange, type]);

  return (
    <div className={classNames('syn-mobile-profile')}>
      <div className="syn-mobile-profile-content">
        <SynTitleTabs
          wrapStyle={{ height: 44 }}
          className="syn-mobile-profile-tabs"
          activeKey={tabPosition}
          items={items}
          onClick={onChange}
        />
        <Button
          disabled={isIpBlocked}
          onClick={() => {
            if (walletConnectStatus === WALLET_CONNECT_STATUS.UN_CONNECT) {
              toggleWalletModal();
              return;
            }
            setHistoryOpen(true);
            if (tabPosition === TABLE_TYPES.LIQUIDITY) {
              return;
            }
            if (tabPosition === TABLE_TYPES.OPEN_ORDERS) {
              setHistoryType(HISTORY_TYPE.ORDERS);
            } else {
              setHistoryType(HISTORY_TYPE.TRADE);
            }
          }}
          type="text">
          <IconLastTrade />
        </Button>
      </div>
      {tabPosition === TABLE_TYPES.POSITION && <TradePositionMobile />}
      {tabPosition === TABLE_TYPES.OPEN_ORDERS && <TradeOrdersMobile />}
      {tabPosition === TABLE_TYPES.LIQUIDITY && <EarnLiquiditiesMobile />}

      {type === PAIR_PAGE_TYPE.TRADE ? (
        <TradeHistoryDrawer historyType={historyType} open={historyOpen} onClose={() => setHistoryOpen(false)} />
      ) : (
        <EarnHistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
      )}
    </div>
  );
};

export default MobileProfile;
