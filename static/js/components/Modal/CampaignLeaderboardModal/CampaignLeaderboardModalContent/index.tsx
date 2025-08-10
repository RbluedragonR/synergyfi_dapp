import { Button } from '@/components/Button';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import Table from '@/components/Table';
import { CampaignLeaderboardData, CampaignLeaderboardDataItem, CampaignLeaderboardSubData } from '@/constants/campaign';
import { useWalletAccount, useWalletIsActive } from '@/hooks/web3/useWalletNetwork';
import { shortenAddress } from '@/utils/address';
import { rankSrcList } from '@/utils/image';
import { formatNumber } from '@/utils/numberUtil';
import { Flex } from 'antd';
import { ColumnType, ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import parse from 'html-react-parser';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

export default function CampaignLeaderboardModalContent({
  description,
  campaignLeaderboardData,
}: {
  description: string;
  campaignLeaderboardData: CampaignLeaderboardData;
}) {
  const campaignLeaderboardCategoryIds = Object.keys(campaignLeaderboardData);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(campaignLeaderboardCategoryIds[0]);
  const { isNotMobile } = useMediaQueryDevice();
  const { t } = useTranslation();
  const columns: ColumnsType<CampaignLeaderboardDataItem> | undefined = useMemo(() => {
    const rank: ColumnType<CampaignLeaderboardDataItem> = {
      title: 'Rank',
      width: isNotMobile ? 86 : 86,
      align: 'center',
      dataIndex: 'rank',
      render: (_, record) => {
        return (
          <div className="syn-campaign-leaderboard-table-rank">
            {record.rank > 3 ? record.rank : <img src={rankSrcList[record.rank - 1]} />}
          </div>
        );
      },
    };

    const address: ColumnType<CampaignLeaderboardDataItem> = {
      title: 'Address',
      width: isNotMobile ? 'auto' : 'auto',
      align: 'left',
      dataIndex: 'address',
      render: (_, record) => {
        return <div className="syn-campaign-leaderboard-table-address">{shortenAddress(record.address)}</div>;
      },
    };
    const value: ColumnType<CampaignLeaderboardDataItem> = {
      title: t(`campaign.leaderboard.${activeCategoryId}`),
      dataIndex: 'value',
      width: isNotMobile ? 120 : 120,
      align: 'right',
      render: (_, record) => {
        // TODO: some category is not dollor
        return <div className="syn-campaign-leaderboard-table-value">${formatNumber(record.value || 0, 2)}</div>;
      },
    };
    return [rank, address, value];
  }, [activeCategoryId, isNotMobile, t]);
  const curCampaignLeaderboardData: CampaignLeaderboardSubData | undefined = campaignLeaderboardData[activeCategoryId];
  const isActive = useWalletIsActive();
  // const walletProvider = useWalletProvider();
  const account = useWalletAccount();
  const disconnected = !isActive || !account;
  return (
    curCampaignLeaderboardData && (
      <div className={classNames('syn-clmc', disconnected && 'disconnected')}>
        <div className="syn-clmc-description">{parse(description as string)}</div>
        {campaignLeaderboardCategoryIds?.length && campaignLeaderboardCategoryIds.length > 1 && (
          <Flex gap={8} className="syn-clmc-btns">
            {campaignLeaderboardCategoryIds.map((key) => (
              <Button
                key={key}
                type={key === activeCategoryId ? 'primary' : 'outline'}
                onClick={() => {
                  setActiveCategoryId(key);
                }}>
                {t(`campaign.leaderboard.${key}`)}
              </Button>
            ))}
          </Flex>
        )}
        <div className="syn-campaign-leaderboard-table-wrapper">
          {!disconnected && (
            <div className="syn-campaign-leaderboard-my-row">
              <div className="syn-campaign-leaderboard-my-rank">
                {(curCampaignLeaderboardData.user?.value || 0) > 0 ? (
                  <>
                    {' '}
                    {!curCampaignLeaderboardData.user?.complete && t('campaign.leaderboard.est')}{' '}
                    {curCampaignLeaderboardData.user?.rank}
                  </>
                ) : (
                  <>-</>
                )}
              </div>
              <div className="syn-campaign-leaderboard-my-address">
                <Flex gap={4}>
                  {curCampaignLeaderboardData.user?.address}
                  <div className="syn-campaign-leaderboard-my-tag me">{t(`campaign.leaderboard.me`)}</div>
                </Flex>

                {!curCampaignLeaderboardData.user?.complete && (
                  <div className="syn-campaign-leaderboard-my-tag notComplete">
                    {t(`campaign.leaderboard.notComplete`)}
                  </div>
                )}
              </div>
              <div className="syn-campaign-leaderboard-my-value">${curCampaignLeaderboardData.user?.value}</div>
            </div>
          )}
          <Table
            rowKey={(record) => `${record.rank}-${record.address}-${record.value}`}
            className="syn-campaign-leaderboard-table"
            columns={columns}
            pagination={false}
            dataSource={curCampaignLeaderboardData.rank}
            scroll={{ y: 370 }}
          />
        </div>
      </div>
    )
  );
}
