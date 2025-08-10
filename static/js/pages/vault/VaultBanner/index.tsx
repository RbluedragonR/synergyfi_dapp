/**
 * @description Component-VaultBanner
 */
import { Trans, useTranslation } from 'react-i18next';
import './index.less';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { ALL_TIME_EARNED_SHOW_LIMIT } from '@/constants/launchpad';
import { LAUNCHPAD_LINK } from '@/constants/links';
import { useFetchVaultSummary } from '@/features/vault/query';
import { useChainId } from '@/hooks/web3/useChain';
import { FC } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const VaultBanner: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const { data: stats } = useFetchVaultSummary(chainId);

  return (
    <div className="syn-vault-banner">
      <div className="syn-vault-banner-left">
        <div className="syn-vault-banner-left-title">{t('launchpad.banner.title')}</div>
        <div className="syn-vault-banner-left-desc">
          {' '}
          <Trans
            i18nKey={'launchpad.banner.desc'}
            components={{
              a: (
                <a
                  href={LAUNCHPAD_LINK}
                  style={{ textDecoration: 'underline', fontWeight: 'bold' }}
                  target="_blank"
                  rel="noreferrer"
                />
              ),
            }}
          />
        </div>
      </div>
      <div className="syn-vault-banner-right">
        <dl>
          <dt>{t('launchpad.banner.pLaunched')}</dt>
          <dd>
            <EmptyDataWrap isLoading={!stats}>
              {stats?.count?.formatNumberWithTooltip?.({ minDecimalPlaces: 0 })}
            </EmptyDataWrap>
          </dd>
        </dl>
        <dl>
          <dt>{t('common.tvl')}</dt>
          <dd>
            <EmptyDataWrap isLoading={!stats}>
              {stats?.totalTvlUsd?.formatNumberWithTooltip?.({
                prefix: '$',
              })}
            </EmptyDataWrap>
          </dd>
        </dl>
        <dl>
          <dt>{t('launchpad.banner.tv')}</dt>
          <dd>
            <EmptyDataWrap isLoading={!stats}>
              {stats?.totalVolumeUsd?.formatNumberWithTooltip?.({
                prefix: '$',
              })}
            </EmptyDataWrap>
          </dd>
        </dl>
        {stats?.allTimeEarnedUsd.gte(ALL_TIME_EARNED_SHOW_LIMIT) && (
          <dl>
            <dt>{t('launchpad.banner.ate')}</dt>
            <dd>
              <EmptyDataWrap isLoading={!stats}>
                {stats?.allTimeEarnedUsd?.formatNumberWithTooltip?.({
                  prefix: '$',
                })}
              </EmptyDataWrap>
            </dd>
          </dl>
        )}
      </div>
    </div>
  );
};

export default VaultBanner;
