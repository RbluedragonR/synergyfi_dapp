/**
 * @description Component-TradeHistoryDrawerHeader
 */
import './index.less';

import { Tooltip } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as IconBack } from '@/assets/svg/icon_chevron_left.svg';
import { ReactComponent as IconRefresh } from '@/assets/svg/icon_refresh_linear.svg';
import { Button } from '@/components/Button';
import TokenPair from '@/components/TokenPair';
import { HIDE_HISTORY_TOOLTIP } from '@/constants/storage';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useChainId } from '@/hooks/web3/useChain';
interface IPropTypes {
  className?: string;
  onClose: () => void;
  onRefresh: () => void;
}
const HistoryDrawerHeader: FC<IPropTypes> = function ({ onClose, onRefresh }) {
  const chainId = useChainId();
  const { t } = useTranslation();
  const [hideTooltip, setHideTooltip] = useState(true);

  const currentPair = useCurrentPairFromUrl(chainId);
  useEffect(() => {
    setHideTooltip(!!localStorage.getItem(HIDE_HISTORY_TOOLTIP));
  }, []);
  if (!currentPair) {
    return <></>;
  }
  return (
    <div className="syn-history-drawer-header">
      <Button type="text" icon={<IconBack className="icon" />} onClick={onClose} />
      <TokenPair
        tokenSize={32}
        isShowExpiryTag={true}
        isShowLogo={false}
        baseToken={currentPair?.rootInstrument.baseToken}
        quoteToken={currentPair?.rootInstrument.quoteToken}
        isInverse={currentPair?.rootInstrument.isInverse || false}
        expiry={currentPair?.expiry}
        showShortPerp={true}
        showLeverage={true}
        leverage={currentPair?.maxLeverage}
      />
      <Tooltip
        overlayStyle={{ paddingRight: 4 }}
        open={!hideTooltip || false}
        zIndex={100000}
        placement="bottom"
        title={!hideTooltip ? t('mobile.history.refreshLine') : ''}>
        <Button
          autoFocus
          onBlur={() => {
            setHideTooltip(true);
            localStorage.setItem(HIDE_HISTORY_TOOLTIP, 'true');
          }}
          type="text"
          icon={<IconRefresh className="icon" />}
          onClick={onRefresh}
        />
      </Tooltip>
    </div>
  );
};

export default HistoryDrawerHeader;
