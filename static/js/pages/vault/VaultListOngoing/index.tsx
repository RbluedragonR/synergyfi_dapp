/**
 * @description Component-VaultListOngoing
 */
import { TableCard } from '@/components/TableCard';
import { useSelectedVault, useVaultInfos, useVaultListIsFetched, useWrappedVaults } from '@/features/vault/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { ColumnType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import './index.less';

import { useMockDevTool } from '@/components/Mock';
import { colWidths } from '@/constants/launchpad/vault';
import { WrappedVault } from '@/entities/WrappedVault';
import useVaultRouter from '@/hooks/vault/useVaultRouter';
import { bigNumberSort } from '@/utils/numberUtil';
import { getVaultRowKey } from '@/utils/vault';
import { Stage } from '@synfutures/sdks-perp-launchpad';
import _ from 'lodash';
import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import AssetPair from '../AssetPair';
import VaultProjectName from '../VaultProjectName';
import { UsdValueContainer } from '../common';
interface IPropTypes {
  className?: string;
  search: string;
}
const VaultListOngoing: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const vaults = useWrappedVaults(chainId, userAddr);
  const vaultsIsFetched = useVaultListIsFetched(chainId, userAddr);
  const { isMockSkeleton } = useMockDevTool();
  const { goToVault } = useVaultRouter();
  const { selectedVault } = useSelectedVault();
  const { vaultInfos } = useVaultInfos(chainId, userAddr);
  const { vaultAddress: queryVaultAddress } = useParams();
  const vaultsFiltered = useMemo(
    () =>
      vaults.filter((v) => v.stageForUi === Stage.LIVE || (v.stageForUi === Stage.SUSPENDED && v.userDeposit.gt(0))),
    [vaults],
  );
  const columnDefs: ColumnType<WrappedVault>[] = useMemo(
    () =>
      [
        {
          title: t('launchpad.vaultListTable.project'),
          dataIndex: 'project',
          align: 'left',
          width: colWidths[0],
          render: (_value: unknown, record: WrappedVault) => (
            <VaultProjectName vaultAddr={record.vaultAddress} vaultName={record.name} />
          ),
        },
        {
          title: t('launchpad.vaultListTable.assetPair'),
          dataIndex: 'assetPair',
          align: 'left',
          width: colWidths[1],
          render: (_value: unknown, record: WrappedVault) => (
            <AssetPair vaultInfo={_.get(vaultInfos, [record.vaultAddress])} />
          ),
        },
        {
          title: t('common.tvl'),
          dataIndex: 'tvl',
          align: 'right',
          className: 'tvl',
          width: colWidths[2],
          sorter: (a, b) => {
            return a?.tvlUSD.gt(b?.tvlUSD) ? 1 : -1;
          },
          showSorterTooltip: false,
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
          title: t('launchpad.vaultListTable.uDeposit'),
          align: 'right',
          sorter: (a, b) => {
            if (a.userDepositUSD && b.userDepositUSD) {
              return bigNumberSort(a.userDepositUSD, b.userDepositUSD);
            }
            return 0;
          },
          defaultSortOrder: 'descend',

          width: colWidths[4],
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
    [t, vaultInfos, userAddr],
  );
  useEffect(() => {
    if (vaultsIsFetched && !selectedVault && !!vaultsFiltered.length && !queryVaultAddress) {
      goToVault({ vaultAddress: _.first(vaultsFiltered)?.vaultAddress });
    }
  }, [goToVault, selectedVault, vaultsFiltered, vaultsIsFetched, queryVaultAddress]);
  return (
    <div className="syn-vault-list-ongoing">
      <TableCard
        className="syn-vault-list-ongoing-table"
        cardTitle=""
        loading={isMockSkeleton || (!vaultsIsFetched && !vaults.length)}
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

export default VaultListOngoing;
