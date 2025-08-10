/**
 * @description Component-TraderBindKol
 */
import { useTranslation } from 'react-i18next';
import './index.less';

import Input from '@/components/Input';
import WrappedButton from '@/components/WrappedButton';
import { useTheme } from '@/features/global/hooks';
import { bindReferralCode } from '@/features/referral/api';
import { useReferralStore } from '@/features/referral/store';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { queryClient } from '@/pages/App';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import { getTraderOverviewQueryKey } from '@/utils/referral';
import classNames from 'classnames';
import { FC, useCallback, useState } from 'react';
import WalletWrappedButton from '../../components/WalletWrappedButton';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TraderBindKol: FC<IPropTypes> = function ({}) {
  const { referralCode, setReferralCode } = useReferralStore();
  const { t } = useTranslation();
  const chainId = useChainId();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const wallectConnectStatus = useWalletConnectStatus();
  const runInputChange = useCallback(
    (value: string) => {
      setError('');
      setReferralCode(value);
    },
    [setReferralCode],
  );
  const theme = useTheme();
  const address = useUserAddr();
  const bindCode = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      if (address && chainId) {
        const result = await bindReferralCode({
          referralCode,
          address: address,
          chainId,
        });
        if (result.code === 200) {
          queryClient.invalidateQueries({ queryKey: getTraderOverviewQueryKey(chainId, address) });
        }
        if (result.code === 2105) {
          setError('affiliates.traderPage.codeNotExists');
        }
        if (result.code === 2104) {
          setError('affiliates.traderPage.selfCode');
        }
      }
      setLoading(false);
    } catch (error) {
      setError('');
      setLoading(false);
    }
  }, [address, referralCode, chainId]);
  return (
    <div className={classNames('syn-trader-bind-kol', theme.dataTheme)}>
      {wallectConnectStatus !== WALLET_CONNECT_STATUS.CONNECTED ? (
        <div className="syn-trader-bind-kol__unconnect">
          <div className="syn-trader-bind-kol__unconnect-title">{t('affiliates.walletUnconnected')}</div>
          <WrappedButton
            onClick={() => {
              console.log('void');
            }}
            amount={undefined}
            marginToken={undefined}
            loading={undefined}
            afterApproved={() => {
              console.log('void');
            }}
          />
        </div>
      ) : (
        <>
          <div className="syn-trader-bind-kol-title">{t('affiliates.traderPage.codeRebateLine')}</div>
          <div className="syn-trader-bind-kol-middle">
            <Input
              value={referralCode}
              placeholder={t('affiliates.traderPage.codePlaceholder')}
              onChange={(e) => runInputChange(e.target.value.trim())}
            />
            {error && <div className="syn-trader-bind-kol-message error">{t(error)}</div>}
          </div>

          <WalletWrappedButton
            loading={loading}
            className="syn-trader-bind-kol-button"
            type="primary"
            onClick={bindCode}>
            {t('affiliates.traderPage.bind')}
          </WalletWrappedButton>
        </>
      )}
    </div>
  );
};

export default TraderBindKol;
