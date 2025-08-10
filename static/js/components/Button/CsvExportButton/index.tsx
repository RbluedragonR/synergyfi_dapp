import './index.less';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HISTORY_RANGE, HISTORY_TYPE, MAX_HISTORY_PAGE_SIZE } from '@/constants/history';
import { WrappedPair } from '@/entities/WrappedPair';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { downloadCSV } from '@/utils/csv';
import { transformHistoryDataToCsvData } from '@/utils/history';

import { Tooltip } from '@/components/ToolTip';
import { TABLE_TYPES } from '@/constants/global';
import { useMarginTokenInfoMap } from '@/features/chain/hook';
import {
  getAccountBalanceHistory,
  getFundingHistory,
  getLiquidityHistory,
  getOrdersHistory,
  getTransferHistory,
  getVirtualTradeHistory,
} from '@/features/graph/api';
import { useAllPairBasicInfoByGraph } from '@/features/graph/query';
import { useSDK } from '@/features/web3/hook';
import useWrappedVolumes from '@/hooks/portfolio/useWrappedVolumes';
import { transformVolumeDataToCsvData } from '@/utils/portfolio';
import { ReactComponent as ExportIcon } from '../../../assets/svg/icon_export_csv.svg';
import Button from '../Button';
interface ICsvExportButton {
  historyType: HISTORY_TYPE | TABLE_TYPES.VOLUME_DETAIL;
  historyTimeRange?: HISTORY_RANGE;
  pair?: WrappedPair;
  disableTooltip?: boolean;
}
export default function CsvExportButton({ historyType, pair, disableTooltip }: ICsvExportButton): JSX.Element {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { data: pairBasicInfos } = useAllPairBasicInfoByGraph(chainId);
  const [loading, setLoading] = useState(false);
  const sdk = useSDK(chainId);
  const wrappedVolumes = useWrappedVolumes();
  const marginTokenMap = useMarginTokenInfoMap(chainId);

  const handleClick = useCallback(async () => {
    if (chainId && userAddr && sdk) {
      let csvData: object[] = [];
      setLoading(true);
      const args = {
        chainId,
        userAddr,
        timeRange: HISTORY_RANGE.ALL,
        instrumentAddr: pair?.metaPair.instrumentId,
        expiry: pair?.expiry,
        pageSize: MAX_HISTORY_PAGE_SIZE,
        sdk,
      };
      switch (historyType) {
        case HISTORY_TYPE.TRADE:
          const tradeData = await getVirtualTradeHistory(args);
          if (tradeData) {
            csvData = transformHistoryDataToCsvData({
              type: HISTORY_TYPE.TRADE,
              data: tradeData,
              pairBasicInfos,
            });
          }
          break;
        case HISTORY_TYPE.ORDERS:
          const orderData = await getOrdersHistory(args);
          if (orderData) {
            csvData = transformHistoryDataToCsvData({
              type: HISTORY_TYPE.ORDERS,
              data: orderData,
              pairBasicInfos,
            });
          }
          break;
        case HISTORY_TYPE.LIQUIDITY:
          const liquidityData = await getLiquidityHistory(args);

          if (liquidityData) {
            csvData = transformHistoryDataToCsvData({
              type: HISTORY_TYPE.LIQUIDITY,
              data: liquidityData,
              pairBasicInfos,
            });
          }
          break;
        case HISTORY_TYPE.FUNDING:
          const fundingData = await getFundingHistory(args);
          if (fundingData) {
            csvData = transformHistoryDataToCsvData({
              type: HISTORY_TYPE.FUNDING,
              data: fundingData,
              pairBasicInfos,
            });
          }
          break;
        case HISTORY_TYPE.TRANSFERS:
          const transferData = await getTransferHistory(args);
          if (transferData) {
            csvData = transformHistoryDataToCsvData({
              type: HISTORY_TYPE.TRANSFERS,
              data: transferData,
              pairBasicInfos,
            });
          }
          break;
        case HISTORY_TYPE.ACCOUNT:
          const accountData = await getAccountBalanceHistory(args);
          if (accountData) {
            csvData = transformHistoryDataToCsvData({
              type: HISTORY_TYPE.ACCOUNT,
              data: accountData,
              marginTokenMap,
              pairBasicInfos,
            });
          }
          break;
        case TABLE_TYPES.VOLUME_DETAIL:
          if (wrappedVolumes) {
            csvData = transformVolumeDataToCsvData(wrappedVolumes);
          }
          break;
        default:
          break;
      }
      setLoading(false);
      downloadCSV(
        csvData,
        `synfutures${pair ? `-${pair.symbol}` : ''}-${
          HISTORY_RANGE.ALL
        }-${historyType}-history-${Date.now()}.csv`.toLowerCase(),
      );
    }
  }, [chainId, userAddr, sdk, pair, marginTokenMap, historyType, wrappedVolumes, pairBasicInfos]);
  return (
    <Tooltip title={t('common.historyC.exportCSVTooltip')} open={disableTooltip && false}>
      <Button
        type="text"
        icon={<ExportIcon />}
        loading={loading}
        className="syn-csv-export-button"
        onClick={handleClick}>
        <span>{t('common.exportCSV')}</span>
      </Button>
    </Tooltip>
  );
}
