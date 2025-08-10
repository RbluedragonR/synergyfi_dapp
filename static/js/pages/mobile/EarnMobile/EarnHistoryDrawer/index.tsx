/**
 * @description Component-EarnHistoryDrawer
 */
import SubPageWrap from '@/components/SubPage';
import './index.less';

import SkeletonTable, { SkeletonTableColumnsType } from '@/components/SkeletonTable';
import Table from '@/components/Table';
import { HISTORY_TYPE } from '@/constants/history';
import { useInfiniteLiquidityHistory } from '@/features/graph/hooks';
import { usePairFromUrl } from '@/features/pair/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { useHistoryTableColumns } from '@/pages/portfolio/AccountHistory/tableConfigs';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import HistoryDrawerHeader from '../../components/HistoryDrawerHeader';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  open: boolean;
  onClose: () => void;
}
const EarnHistoryDrawer: FC<IPropTypes> = function ({ open, onClose }) {
  const chainId = useChainId();
  const pair = usePairFromUrl(chainId);
  const userAddr = useUserAddr();
  const {
    refreshData,
    histories: liquidityHistories,
    queryState: { isLoading },
  } = useInfiniteLiquidityHistory({
    chainId,
    userAddr,
    pair,
  });
  const columnDefs = useHistoryTableColumns(HISTORY_TYPE.LIQUIDITY_MOBILE);
  const { t } = useTranslation();

  return (
    <SubPageWrap
      isShowSubPage={open}
      onClose={() => {
        console.log('');
      }}
      header={<HistoryDrawerHeader onRefresh={refreshData} onClose={onClose} />}
      className="syn-earn-history-drawer">
      <>
        <SkeletonTable rowCount={10} loading={isLoading} columns={columnDefs as SkeletonTableColumnsType[]}>
          <Table
            columns={columnDefs}
            pagination={false}
            scroll={{
              x: window.innerWidth - 16,
              y: window.innerHeight - 34 - 36 - 64 - 16 - 48,
            }}
            dataSource={liquidityHistories.slice(0, 10)}
            rowKey={(record) => record.txHash + record.logIndex}
            className="syn-trade-history-mobile-table"
            emptyDesc={undefined}
            emptyType="vertical"
            emptyDescLink={undefined}
          />
        </SkeletonTable>

        {!isLoading && !!liquidityHistories.length && (
          <div className="syn-trade-history-drawer-info">{t('mobile.history.tableInfo')}</div>
        )}
      </>
    </SubPageWrap>
  );
};

export default EarnHistoryDrawer;
