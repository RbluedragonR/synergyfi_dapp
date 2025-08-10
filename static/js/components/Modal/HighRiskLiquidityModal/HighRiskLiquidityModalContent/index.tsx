/**
 * @description Component-TermModalContent
 */
import warningIcon from '@/assets/svg/solar_danger-triangle-bold-duotone.svg';
import { Button } from '@/components/Button';
import { SecondGlobalModalType } from '@/constants';
import { useAddLiquidationSimulation } from '@/features/earn/hook';
import { useToggleSecondModal } from '@/features/global/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import LiquidationPrices from '@/pages/components/LiquidationPrices';
import { CHAIN_ID } from '@derivation-tech/context';
import classNames from 'classnames';
import { ComponentProps, FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

type THighRiskLiquidityModalContent = ComponentProps<'div'> & {
  isMobile?: boolean;
  onCancel?: () => void;
  onOk: (chainId: CHAIN_ID) => void;
  onClickLiqButton: () => Promise<void>;
};
const HighRiskLiquidityModalContent: FC<THighRiskLiquidityModalContent> = function ({
  isMobile = false,
  children,
  onClickLiqButton,
  ...others
}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const simulation = useAddLiquidationSimulation(chainId);
  const toggleHighRiskLiquidityModal = useToggleSecondModal(SecondGlobalModalType.HIGH_RISK_LIQUIDITY);
  const [loading, setLoading] = useState<boolean>(false);
  const lowerLiqPrice = simulation?.data?.lowerLiqPrice;
  const lowerLiqPriceStr = useMemo(
    () => simulation?.data?.lowerLiqPrice.formatLiqPriceString(),
    [simulation?.data?.lowerLiqPrice],
  );
  const upperLiqPrice = simulation?.data?.upperLiqPrice;
  const upperLiqPriceStr = useMemo(
    () => simulation?.data?.upperLiqPrice.formatLiqPriceString(),
    [simulation?.data?.upperLiqPrice],
  );
  useEffect(() => {
    if (!lowerLiqPriceStr || !upperLiqPriceStr) {
      toggleHighRiskLiquidityModal(false);
    }
  }, [lowerLiqPriceStr, toggleHighRiskLiquidityModal, upperLiqPriceStr]);
  return (
    <div {...others} className={classNames('syn-hrlmc', isMobile && 'syn-hrlmc-mobile', others.className)}>
      {children}
      <div className="syn-hrlmc-content">
        {t('common.highRiskEarnModal.content', { lowerLiqPrice: lowerLiqPriceStr, upperLiqPrice: upperLiqPriceStr })}
      </div>
      <div className="syn-hrlmc-center">
        <div className="syn-hrlmc-center-left">
          <img src={warningIcon} />
          {t('common.highRiskEarnModal.liquidationPriceRange')}
        </div>
        {lowerLiqPrice && upperLiqPrice && (
          <LiquidationPrices lowerLiqPrice={lowerLiqPrice} upperLiqPrice={upperLiqPrice} />
        )}
      </div>
      <div className="syn-hrlmc-btns">
        <Button
          type="primary"
          chainIconProps={chainId && { chainId }}
          loading={loading}
          onClick={async () => {
            setLoading(true);
            await onClickLiqButton();
            setLoading(false);
            toggleHighRiskLiquidityModal(false);
          }}>
          {t('common.add')}
        </Button>
        <Button
          type="text"
          onClick={() => {
            toggleHighRiskLiquidityModal(false);
          }}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
};

export default HighRiskLiquidityModalContent;
