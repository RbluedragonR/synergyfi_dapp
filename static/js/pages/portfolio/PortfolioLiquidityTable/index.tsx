/**
 * @description Component-PortfolioLiquidityTable
 */
import './index.less';

import classNames from 'classnames';
import _ from 'lodash';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import LiquidityIcon from '@/assets/svg/icons/liquidity';
import { useMockDevTool } from '@/components/Mock';
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/SkeletonTable';
import Table from '@/components/Table';
import { useTableColumns } from '@/components/TableCard/tableConfigs';
import { PAIR_PAGE_TYPE, TABLE_TYPES } from '@/constants/global';
import { WrappedRange } from '@/entities/WrappedRange';
import { useWrappedRangeListByUser } from '@/features/account/rangeHook';
import { clickOpenSettledPairModal } from '@/features/portfolio/actions';
import { useIsFetchedPortfolioList } from '@/features/portfolio/hook';
import { useAppDispatch } from '@/hooks';
import { useSideNavigate } from '@/hooks/useRouterNavigate';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
interface IPropTypes {
  className?: string;
}
const PortfolioLiquidityTable: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const { pairPageNavigate } = useSideNavigate();
  const userAddr = useUserAddr();
  const columnDefs = useTableColumns(TABLE_TYPES.PORTFOLIO_LIQUIDITIES);
  const ranges = useWrappedRangeListByUser(chainId, userAddr, false);
  const instruments = useMemo(() => _.uniq(ranges?.map((p) => p.rootInstrument.displaySymbol)), [ranges]);
  const isFetchedPortfolio = useIsFetchedPortfolioList(chainId, userAddr);

  const dispatch = useAppDispatch();
  const { isMockSkeleton } = useMockDevTool();
  if (isFetchedPortfolio && !ranges?.length) {
    return null;
  }
  return (
    <>
      <h2 className="title">
        <LiquidityIcon />
        {t('common.liquidity')}
      </h2>
      <div className="syn-portfolio-liquidity-table">
        <SkeletonTable
          loading={isMockSkeleton || !isFetchedPortfolio}
          columns={columnDefs as SkeletonTableColumnsType[]}>
          <Table
            sticky={{ offsetHeader: 56 }}
            columns={columnDefs}
            dataSource={ranges}
            rowKey={(record) =>
              record.id +
              record.rootPair.rootInstrument?.isNormalInstrument?.toString() +
              record.rootPair.isNormalPair?.toString()
            }
            pagination={false}
            emptyDesc={t('common.empty.EarnNow')}
            emptyDescLink={'/#/earn'}
            showUnconnected={false}
            rowClassName={(record: WrappedRange) =>
              classNames({
                emergency: !record.rootPair.rootInstrument?.isNormalInstrument,
                odd: _.indexOf(instruments, record.rootInstrument.displaySymbol) % 2 !== 0,
              })
            }
            onRow={(record: WrappedRange) => {
              return {
                onClick: () => {
                  if (!record.rootPair.isNormalPair) {
                    chainId &&
                      userAddr &&
                      dispatch(clickOpenSettledPairModal({ chainId, userAddr, portfolio: record.rootPortfolio }));
                    return;
                  }
                  pairPageNavigate(record.rootPair.symbol || '', PAIR_PAGE_TYPE.EARN, record.rootPair.chainId);
                },
              };
            }}
          />
        </SkeletonTable>
      </div>
    </>
  );
};

export default PortfolioLiquidityTable;
