/**
 * @description Component-EarnLiquidities
 */
import './index.less';

import React, { FC, useCallback } from 'react';

import { ReactComponent as ChevronRight } from '@/assets/svg/icon_chevron_right.svg';
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/SkeletonTable';
import Table from '@/components/Table';
import { WrappedRange } from '@/entities/WrappedRange';
import { useCurrentRange, useWrappedRangeList } from '@/features/account/rangeHook';
import { usePairFromUrl } from '@/features/pair/hook';

import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import { Button } from '@/components/Button';
import { useMockDevTool } from '@/components/Mock';
import { PORTFOLIO_TAB_ITEMS } from '@/constants/portfolio';
import { useIsFetchedSinglePortfolio } from '@/features/portfolio/hook';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLiqTableColumns } from './tableTitles';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const EarnLiquidities: FC<IPropTypes> = function ({}) {
  const columnDefs = useLiqTableColumns();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const currentPair = usePairFromUrl(chainId);
  const currentRange = useCurrentRange(chainId, userAddr);
  const rangeList = useWrappedRangeList(chainId, userAddr, currentPair?.id);
  const isFetchedPortfolio = useIsFetchedSinglePortfolio(
    chainId,
    userAddr,
    currentPair?.instrumentAddr,
    currentPair?.expiry,
  );
  const { isMockSkeleton } = useMockDevTool();
  const navigate = useNavigate();
  const goToOrders = useCallback(() => {
    navigate(`/portfolio/${PORTFOLIO_TAB_ITEMS.PORTFOLIO}`);
  }, [navigate]);
  const { t } = useTranslation();
  if (isFetchedPortfolio && !rangeList?.length) {
    return null;
  }
  return (
    <div className="syn-earn-liquidities-wrap">
      <div className="syn-earn-liquidities-wrap-title">
        {t('common.myLiquidity')}
        <Button size="small" onClick={goToOrders} type="text">
          {' '}
          {t('common.tradePage.allL')}
          <ChevronRight />
        </Button>
      </div>
      <SkeletonTable
        rowCount={2}
        loading={isMockSkeleton || !isFetchedPortfolio}
        columns={columnDefs as SkeletonTableColumnsType[]}>
        <Table
          className="syn-earn-liquidities"
          columns={columnDefs}
          dataSource={rangeList}
          pagination={false}
          rowKey={(record) => record.id}
          sticky
          // emptyDesc={t('common.empty.TradeNow')}
          // emptyDescLink={'/#/trade'}
          rowClassName={(record: WrappedRange) =>
            record.id === currentRange?.id ? 'syn-earn-liquidities-row-active' : ''
          }
        />
      </SkeletonTable>
    </div>
  );
};

export default EarnLiquidities;
