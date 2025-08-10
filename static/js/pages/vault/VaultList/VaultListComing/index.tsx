/**
 * @description Component-VaultListComing
 */
import { useVaultInfos, useVaultListIsFetched, useWrappedVaults } from '@/features/vault/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { ColumnType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { LaunchTarget } from '../VaultProgress';
import './index.less';

import { useMockDevTool } from '@/components/Mock';
import { TableCard } from '@/components/TableCard';
import { colWidths } from '@/constants/launchpad/vault';
import { WrappedVault } from '@/entities/WrappedVault';
import useVaultRouter from '@/hooks/vault/useVaultRouter';
import { getVaultRowKey } from '@/utils/vault';
import { Stage } from '@synfutures/sdks-perp-launchpad';
import { FC, useMemo } from 'react';
import AssetPair from '../../AssetPair';
import VaultProjectName from '../../VaultProjectName';
import { UsdValueContainer } from '../../common';
interface IPropTypes {
  className?: string;
  search: string;
}
const VaultListComing: FC<IPropTypes> = function ({}) {
  const { goToVault } = useVaultRouter();
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const vaults = useWrappedVaults(chainId, userAddr);
  const { isMockSkeleton } = useMockDevTool();

  const vaultsStatusIsFetched = useVaultListIsFetched(chainId, userAddr);
  const { vaultInfos } = useVaultInfos(chainId, userAddr);
  const vaultsFiltered = useMemo(
    () => vaults.filter((v) => v.stageForUi === Stage.UPCOMING),
    // .filter((v) => v.quoteToken.symbol.toLowerCase().includes(search.toLowerCase().trim())),
    [vaults],
  );
  const columnDefs: ColumnType<WrappedVault>[] = useMemo(
    () =>
      [
        {
          title: <>{t('launchpad.vaultListTable.project')}</>,
          dataIndex: 'name',
          width: 200,
          align: 'left',
          render: (_value: unknown, record: WrappedVault) => (
            <VaultProjectName vaultAddr={record.vaultAddress} vaultName={record.name} />
          ),
        },
        {
          title: t('launchpad.vaultListTable.assetPair'),
          dataIndex: 'assetPair',
          align: 'left',
          width: colWidths[1],
          render: (_value: unknown, record: WrappedVault) => <AssetPair vaultInfo={record} />,
        },
        {
          title: t('common.tvl'),
          dataIndex: 'tvl',
          align: 'right',
          className: 'tvl',
          width: colWidths[2],
          sorter: (a, b) => (a?.tvlUSD?.gt(b?.targetTvlUSD) ? 1 : -1),
          showSorterTooltip: false,
          defaultSortOrder: 'descend',
          render: (_value: unknown, record: WrappedVault) => (
            <UsdValueContainer
              topNode={record.tvl.formatNumberWithTooltip({
                isShowTBMK: true,
                suffix: ` ${record.quoteToken.symbol}`,
              })}
              bottomNode={record.tvlUSD.formatNumberWithTooltip({
                isShowTBMK: true,
                prefix: '$',
              })}></UsdValueContainer>
          ),
        },
        {
          title: t('launchpad.launchTarget'),
          dataIndex: 'launchTarget',
          align: 'right',
          className: 'launchTarget',
          width: colWidths[3],
          sorter: (a, b) => (a?.targetTvl?.gt(b?.targetTvl) ? 1 : -1),
          showSorterTooltip: false,
          render: (_value: unknown, record: WrappedVault) => (
            <UsdValueContainer
              topNode={
                <LaunchTarget
                  targetTvl={record.targetTvl}
                  tvl={record.tvl}
                  targetDisplayProps={{ prefix: undefined, suffix: ` ${record.quoteToken.symbol}` }}
                />
              }
              bottomNode={record.targetTvlUSD.formatNumberWithTooltip({
                isShowTBMK: true,
                prefix: '$',
              })}></UsdValueContainer>
          ),
        },
        {
          title: t('launchpad.vaultListTable.uDeposit'),
          dataIndex: 'deposit',
          width: colWidths[4],
          align: 'right',
          sorter: (a, b) => {
            return a?.getUserDepositUSD(userAddr).gt(b?.getUserDepositUSD(userAddr)) ? 1 : -1;
          },
          render: (_value: unknown, record: WrappedVault) => (
            <UsdValueContainer
              topNode={
                record.getUserDeposit(userAddr).eq(0)
                  ? '0'
                  : record
                      .getUserDeposit(userAddr)
                      .formatNumberWithTooltip({ isShowTBMK: true, suffix: ` ${record.quoteToken.symbol}` })
              }
              bottomNode={
                record.getUserDeposit(userAddr).eq(0)
                  ? '-'
                  : record.getUserDepositUSD(userAddr).formatNumberWithTooltip({ isShowTBMK: true, prefix: '$' })
              }
            />
          ),
        },
      ] as ColumnType<WrappedVault>[],
    [t, userAddr, vaultInfos],
  );

  return (
    <div className="syn-vault-list-coming">
      <TableCard
        className="syn-vault-list-coming-table"
        cardTitle=""
        loading={isMockSkeleton || (!vaultsStatusIsFetched && !vaults.length)}
        total={vaults?.length}
        rowCount={6}
        onRow={(record: WrappedVault) => ({
          onClick: () => {
            goToVault({ vaultAddress: record.vaultAddress });
          },
        })}
        rowKey={(record: WrappedVault) => getVaultRowKey(record)}
        columns={columnDefs}
        dataSource={vaultsFiltered}
      />
    </div>
  );
};

export default VaultListComing;
