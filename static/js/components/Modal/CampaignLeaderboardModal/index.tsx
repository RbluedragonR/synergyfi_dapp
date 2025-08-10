import Drawer from '@/components/Drawer';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import Modal from '@/components/Modal';
import { SecondGlobalModalType } from '@/constants';
import { useCampaignLeaderboard, useCampaigns } from '@/features/campaign/query';
import { useSecondModal } from '@/features/global/hooks';
import { useAppSelector } from '@/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from 'viem';
import CampaignLeaderboardModalContent from './CampaignLeaderboardModalContent';
import './index.less';

export default function CampaignLeaderboardModal() {
  const { deviceType, isMobile } = useMediaQueryDevice();
  const { t } = useTranslation();
  const { isOpenModal, toggleModal } = useSecondModal(SecondGlobalModalType.CAMPAIGN_LEADERBOARD);
  const { data: campaigns } = useCampaigns();
  const userAddr = useUserAddr();
  const { description, selectedLeaderboardCampaignId } = useAppSelector((state) => {
    const campaignId = state.campaign.selectedLeaderboardCampaignId;
    if (campaignId) {
      return {
        selectedLeaderboardCampaignId: campaignId,
        description: campaigns?.find((item) => item.id === campaignId)?.leaderboardDes,
      };
    }
    return {
      campaignLeaderboardData: undefined,
      description: undefined,
    };
  });
  const { data: campaignLeaderboardData, isFetched } = useCampaignLeaderboard(
    selectedLeaderboardCampaignId,
    userAddr || zeroAddress,
  );
  if (!isFetched) return null;
  return isMobile ? (
    <Drawer
      className={classNames('syn-clm-drawer')}
      title={t('common.leaderboard')}
      height={'auto'}
      placement="bottom"
      closable={true}
      zIndex={10000}
      maskClosable={true}
      onClose={() => {
        toggleModal(false);
      }}
      open={isOpenModal}>
      {description && campaignLeaderboardData && (
        <CampaignLeaderboardModalContent description={description} campaignLeaderboardData={campaignLeaderboardData} />
      )}
    </Drawer>
  ) : (
    <Modal
      width={520}
      className={classNames('syn-clm-modal', deviceType)}
      centered={true}
      zIndex={10000}
      title={t('common.leaderboard')}
      open={isOpenModal}
      maskClosable={true}
      onCancel={() => {
        toggleModal(false);
      }}
      closable={true}>
      {description && campaignLeaderboardData && (
        <CampaignLeaderboardModalContent description={description} campaignLeaderboardData={campaignLeaderboardData} />
      )}
    </Modal>
  );
}
