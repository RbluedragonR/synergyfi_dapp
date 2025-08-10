import Empty from '@/components/Empty';
import { ExternalLink } from '@/components/Link';
import { VaultActionId } from '@/constants/launchpad/vault';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useNativeToken } from '@/features/chain/hook';
import { useChainId, useEtherscanLink } from '@/hooks/web3/useChain';
import { useWalletAccount } from '@/hooks/web3/useWalletNetwork';
import VaultProjectName from '@/pages/vault/VaultProjectName';
import { IVaultHistory } from '@/types/vault';
import { formatDate } from '@/utils/timeUtils';
import { fixBalanceNumberDecimalsTo18 } from '@/utils/token';
import SkeletonButton from 'antd/es/skeleton/Button';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';
type TVaultHistoryCardProps = ComponentProps<'div'> & {
  isSkeleton?: boolean;
  data: IVaultHistory[];
};

export const VaultHistoryCard = ({ className, data, isSkeleton = true, ...ospaners }: TVaultHistoryCardProps) => {
  const { t } = useTranslation();
  const getEtherscanLink = useEtherscanLink();
  const chainId = useChainId();
  const nativeToken = useNativeToken(chainId);
  const account = useWalletAccount();
  return (
    <div className={classNames('syn-vault-history-card', className)} {...ospaners}>
      <div className={'syn-vault-history-card-table'}>
        <div className="syn-vault-history-card-table-header">
          <span>{t('launchpad.time')}</span>
          <span>{t('launchpad.project')}</span>
          <span>{t('launchpad.valueChange')}</span>
        </div>
        <div className="syn-vault-history-card-table-container syn-scrollbar">
          {isSkeleton ? (
            [1, 2, 3, 4].map((item, i) => (
              <div className="syn-vault-history-card-table-row" key={`VaultHistoryCard_isSkeleton_${i}`}>
                <span>
                  <SkeletonButton size="small" shape="round" active block />
                </span>
                <span>
                  <SkeletonButton size="small" shape="round" active block />
                </span>
                <span>
                  <SkeletonButton size="small" shape="round" active block />
                </span>
              </div>
            ))
          ) : data.length === 0 || !account ? (
            <Empty type="vertical" />
          ) : (
            data.map((item, i) => {
              const valueChangeAmount = WrappedBigNumber.from(
                fixBalanceNumberDecimalsTo18(
                  item.type !== VaultActionId.withdrawal ? item.quoteAmount : item.quoteAmount.mul(-1),
                  item.vault?.tokenInfo.decimals || 18,
                ),
              );
              return (
                <div className="syn-vault-history-card-table-row" key={`VaultHistoryCard_${i}`}>
                  <span>
                    <ExternalLink href={getEtherscanLink(item.txHash || '', 'transaction')}>
                      {formatDate(item.timestamp * 1000, 'MM-DD')}
                    </ExternalLink>
                  </span>
                  <span>{item.vault && <VaultProjectName nameOnly={true} vaultAddr={item.vault.vaultAddress} />}</span>
                  <span>
                    {valueChangeAmount.formatNumberWithTooltip({
                      isShowTBMK: true,
                      colorShader: true,
                      colorSuffix: true,
                      suffix: item.isNative ? nativeToken?.symbol : item.vault?.tokenInfo.symbol,
                      isShowApproximatelyEqualTo: false,
                      showToolTip: true,
                    })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
