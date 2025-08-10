/**
 * @description Component-OpenOrders
 */
import './index.less';

import classNames from 'classnames';
import _ from 'lodash';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import OpenOrderIcon from '@/assets/svg/icons/openOrder';
import { useMockDevTool } from '@/components/Mock';
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/SkeletonTable';
import Table from '@/components/Table';
import { useTableColumns } from '@/components/TableCard/tableConfigs';
import { PAIR_PAGE_TYPE, TABLE_TYPES } from '@/constants/global';
import { WrappedOrder } from '@/entities/WrappedOrder';
import { useWrappedOrderListByUser } from '@/features/account/orderHook';
import { clickOpenSettledPairModal } from '@/features/portfolio/actions';
import { useIsFetchedPortfolioList } from '@/features/portfolio/hook';
import { useAppDispatch } from '@/hooks';
import useOpenOrderListWithCreateTime from '@/hooks/portfolio/useOpenOrderListWithCreateTime';
import { useSideNavigate } from '@/hooks/useRouterNavigate';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { useNavigate } from 'react-router-dom';
interface IPropTypes {
  className?: string;
}
const OpenOrders: FC<IPropTypes> = function ({}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const chainId = useChainId();
  const { pairPageNavigate } = useSideNavigate();
  const userAddr = useUserAddr();
  const columnDefs = useTableColumns(TABLE_TYPES.PORTFOLIO_OPEN_ORDERS);
  const orders = useWrappedOrderListByUser(chainId, userAddr, false);
  const ordersWithCreateTime = useOpenOrderListWithCreateTime(orders);
  const instruments = useMemo(
    () => _.uniq(ordersWithCreateTime?.map((p) => p.rootInstrument.displaySymbol)),
    [ordersWithCreateTime],
  );
  const isFetchedPortfolio = useIsFetchedPortfolioList(chainId, userAddr);

  const dispatch = useAppDispatch();
  const { isMockSkeleton } = useMockDevTool();
  if (isFetchedPortfolio && !orders?.length) {
    return null;
  }
  return (
    <>
      <h2 className="title">
        <OpenOrderIcon />
        {t('common.openOrders')}
      </h2>
      <div className="syn-open-orders">
        <SkeletonTable
          loading={isMockSkeleton || !isFetchedPortfolio}
          columns={columnDefs as SkeletonTableColumnsType[]}>
          <Table
            sticky={{ offsetHeader: 56 }}
            columns={columnDefs}
            dataSource={ordersWithCreateTime}
            rowKey={(record) =>
              record.id +
              record.rootPair.rootInstrument?.isNormalInstrument?.toString() +
              record.rootPair.isNormalPair?.toString()
            }
            pagination={false}
            emptyDesc={t('common.empty.placeNow')}
            emptyDescLink={`/#/trade`}
            showUnconnected={false}
            rowClassName={(record: WrappedOrder) =>
              classNames({
                emergency: !record.rootPair.rootInstrument?.isNormalInstrument,
                odd: _.indexOf(instruments, record.rootInstrument.displaySymbol) % 2 !== 0,
              })
            }
            emptyDescLinkClick={() => navigate(`/#/trade`, { state: { toLimitTab: true } })}
            onRow={(record: WrappedOrder) => {
              return {
                onClick: () => {
                  if (!record.rootPair.isNormalPair) {
                    chainId &&
                      userAddr &&
                      dispatch(clickOpenSettledPairModal({ chainId, userAddr, portfolio: record.rootPortfolio }));
                    return;
                  }
                  gtag('event', 'enter_trade', {
                    entrance: 'portfolio', // link, nav_bar, market, portfolio, odyssey_place_limit_order
                  });
                  pairPageNavigate(record.rootPair.symbol || '', PAIR_PAGE_TYPE.TRADE, record.rootPair.chainId, {
                    state: { toLimitTab: true },
                  });
                },
              };
            }}
          />
        </SkeletonTable>
      </div>
    </>
  );
};

export default OpenOrders;
