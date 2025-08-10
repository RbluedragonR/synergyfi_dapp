/**
 * @description Component-PortfolioAsset
 */
import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as RightIcon } from '@/assets/svg/icon_arrow_right.svg';
import { IAssetsBalance } from '@/types/assets';

import TokenBalanceInfoButton from '@/components/Button/TokenBalanceInfoButton';
import { useMockDevTool } from '@/components/Mock';
import { useUserIsFetchedGateBalanceList } from '@/features/balance/hook';
import { useBackendChainConfig } from '@/features/config/hook';
import { setPortfolioAssetSelect } from '@/features/portfolio/actions';
import { useUserWithdrawPendingToken } from '@/features/portfolio/hook';
import { useIsBlacklistedFromStore } from '@/features/user/hooks';
import { useAppDispatch } from '@/hooks';
import { useAssetSelectFromParams } from '@/hooks/portfolio/usePortfolioParams';
import DepositButton from '@/pages/components/Portfolio/Vault/AccountButtons/Deposit';
import WithdrawButton from '@/pages/components/Portfolio/Vault/AccountButtons/Withdraw';
import PortfolioAssetSkeleton from './PortfolioAssetSkeleton';
const maxTokenInBalanceInfosPerBatch = 8;
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  assetBalanceList: IAssetsBalance[];
  chainId: CHAIN_ID | undefined;
  userAddr: string | undefined;
}
const PortfolioAsset: FC<IPropTypes> = function ({ assetBalanceList, chainId, userAddr }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isBlacklisted = useIsBlacklistedFromStore();
  const backendChainConfig = useBackendChainConfig(chainId);
  const [assetSelect, setAssetSelect] = useState<string>(backendChainConfig?.quoteDisplayList[0] || 'USDC');
  const isFetchedGateBalance = useUserIsFetchedGateBalanceList(chainId, userAddr);

  const selectedAssetInfo = useMemo(
    () => assetBalanceList.find((assetBalance) => assetBalance.quote.symbol === assetSelect),
    [assetBalanceList, assetSelect],
  );
  useEffect(() => {
    dispatch(setPortfolioAssetSelect({ assetSelected: selectedAssetInfo || null }));
  }, [dispatch, selectedAssetInfo]);
  const { quoteSymbol: quoteSymbolFromParams } = useAssetSelectFromParams();
  const { isMockSkeleton } = useMockDevTool();
  const isLoading = useMemo(() => {
    return isMockSkeleton || !isFetchedGateBalance;
  }, [isFetchedGateBalance, isMockSkeleton]);
  const totalBatches = useMemo(
    () => Math.ceil((assetBalanceList?.length || 0) / maxTokenInBalanceInfosPerBatch),
    [assetBalanceList],
  );
  const { isShowClaim: isSelectedAssetShowClaim } = useUserWithdrawPendingToken(
    chainId,
    userAddr,
    selectedAssetInfo?.quote.address,
  );
  const isSelectedAssetWithdrawDisable = useMemo(() => {
    return isSelectedAssetShowClaim || selectedAssetInfo?.gateBalance?.lte(0);
  }, [isSelectedAssetShowClaim, selectedAssetInfo?.gateBalance]);
  const [currentBatch, setCurrentBath] = useState(0);
  const currentAssets = useMemo(() => {
    const list = assetBalanceList.slice(
      currentBatch * maxTokenInBalanceInfosPerBatch,
      (currentBatch + 1) * maxTokenInBalanceInfosPerBatch,
    );
    return list.sort((a, b) => {
      if (a?.gateBalance?.gt(0) && b?.gateBalance?.eq(0)) return -1;
      if (a?.gateBalance?.eq(0) && b?.gateBalance?.gt(0)) return 1;
      return 0;
    });
  }, [assetBalanceList, currentBatch]);
  const prevAsset = useCallback(() => {
    if (currentBatch !== 0) {
      const newBatch = currentBatch - 1;
      const newSymbol = assetBalanceList[newBatch * maxTokenInBalanceInfosPerBatch]?.quote.symbol;
      newSymbol && setAssetSelect(newSymbol);
      setCurrentBath(newBatch);
    }
  }, [assetBalanceList, currentBatch]);
  const nextAsset = useCallback(() => {
    if (currentBatch !== totalBatches - 1) {
      const newBatch = currentBatch + 1;
      const newSymbol = assetBalanceList[newBatch * maxTokenInBalanceInfosPerBatch]?.quote.symbol;
      newSymbol && setAssetSelect(newSymbol);
      setCurrentBath(newBatch);
    }
  }, [assetBalanceList, currentBatch, totalBatches]);

  useEffect(() => {
    let quoteSymbol = backendChainConfig?.quoteDisplayList[0] || 'USDC';
    if (
      assetBalanceList?.length &&
      !assetBalanceList.find((assetBalance) => assetBalance.quote.symbol === quoteSymbol)
    ) {
      quoteSymbol = assetBalanceList[0].quote.symbol;
    }
    setAssetSelect(quoteSymbol);
  }, [backendChainConfig?.quoteDisplayList, chainId]);

  useEffect(() => {
    quoteSymbolFromParams && setAssetSelect(quoteSymbolFromParams);
  }, [quoteSymbolFromParams]);
  return (
    <div className={classNames('syn-portfolio-asset', isBlacklisted && 'is-blacklisted')}>
      <div className="syn-portfolio-asset-header">
        <div className="title">
          {isBlacklisted ? (
            <div className="syn-violation-account-text">{t('common.violationAccount')}</div>
          ) : (
            <>
              {t('common.portfolio.account')}
              {chainId === CHAIN_ID.BLAST && (
                <span className="syn-portfolio-asset-sub-header">{t('common.banners.deposit')}</span>
              )}
            </>
          )}
        </div>
        {selectedAssetInfo && (
          <div className="deposit-withdraw-btns">
            <DepositButton quote={selectedAssetInfo.quote} btnProps={{ disabled: isLoading }} />
            <WithdrawButton
              quote={selectedAssetInfo.quote}
              btnProps={{ disabled: isLoading || isSelectedAssetWithdrawDisable }}
            />
          </div>
        )}
        {assetBalanceList.length > maxTokenInBalanceInfosPerBatch && (
          <div className="syn-portfolio-asset-header-right">
            <RightIcon onClick={prevAsset} className={classNames('rotate', { disable: currentBatch === 0 })} />{' '}
            <RightIcon onClick={nextAsset} className={classNames({ disable: currentBatch === totalBatches - 1 })} />
          </div>
        )}
      </div>
      {!isFetchedGateBalance && <PortfolioAssetSkeleton />}
      {isFetchedGateBalance && (
        <div className="syn-portfolio-asset-token-balance-infos">
          {currentAssets.map((assetBalance, index) => {
            return (
              <TokenBalanceInfoButton
                className={assetSelect === assetBalance.quote.symbol ? 'selected' : ''}
                key={`${index}_PortfolioAsset_TokenBalanceInfo`}
                assetBalance={assetBalance}
                onClick={() => setAssetSelect(assetBalance.quote.symbol)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortfolioAsset;
