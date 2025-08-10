/**
 * @description Component-PortfolioPositionTable
 */
import './index.less';

import classNames from 'classnames';
import _ from 'lodash';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import PositionIcon from '@/assets/svg/icons/position';
import { useMockDevTool } from '@/components/Mock';
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/SkeletonTable';
import Table from '@/components/Table';
import { useTableColumns } from '@/components/TableCard/tableConfigs';
import { PAIR_PAGE_TYPE, TABLE_TYPES } from '@/constants/global';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { usePositionListByUser } from '@/features/account/positionHook';
import { clickOpenSettledPairModal } from '@/features/portfolio/actions';
import { useIsFetchedPortfolioList } from '@/features/portfolio/hook';
import { useAppDispatch } from '@/hooks';
import { useSideNavigate } from '@/hooks/useRouterNavigate';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PortfolioPositionTable: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const { pairPageNavigate } = useSideNavigate();
  const userAddr = useUserAddr();
  const columnDefs = useTableColumns(TABLE_TYPES.PORTFOLIO_POSITIONS);
  const positions = usePositionListByUser(chainId, userAddr, false);
  const instruments = useMemo(() => _.uniq(positions?.map((p) => p.rootInstrument.displaySymbol)), [positions]);
  const isFetchedPortfolio = useIsFetchedPortfolioList(chainId, userAddr);

  const dispatch = useAppDispatch();
  const { isMockSkeleton } = useMockDevTool();
  if (isFetchedPortfolio && !positions?.length) {
    return null;
  }
  return (
    <>
      <h2 className="title">
        <PositionIcon />
        {t('common.positions')}
      </h2>
      <div className="syn-portfolio-position-table">
        <SkeletonTable
          loading={isMockSkeleton || !isFetchedPortfolio}
          columns={columnDefs as SkeletonTableColumnsType[]}>
          <Table
            columns={columnDefs}
            dataSource={positions}
            rowKey={(record) =>
              record.id +
              record.rootPair.rootInstrument?.isNormalInstrument?.toString() +
              record.rootPair.isNormalPair?.toString()
            }
            pagination={false}
            emptyDesc={t('common.empty.TradeNow')}
            emptyDescLink={'/#/trade'}
            showUnconnected={false}
            // antd site header height
            sticky={{ offsetHeader: 56 }}
            rowClassName={(record: WrappedPosition) =>
              classNames({
                emergency: !record.rootPair.rootInstrument?.isNormalInstrument,
                odd: _.indexOf(instruments, record.rootInstrument.displaySymbol) % 2 !== 0,
              })
            }
            onRow={(record: WrappedPosition) => {
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
                  pairPageNavigate(record.rootPair.symbol || '', PAIR_PAGE_TYPE.TRADE, record.rootPair.chainId);
                },
              };
            }}
          />
        </SkeletonTable>
      </div>
    </>
  );
};

export default PortfolioPositionTable;
