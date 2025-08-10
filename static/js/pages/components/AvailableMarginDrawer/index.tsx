/**
 * @description Component-AvailableMarginDrawer
 */
import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExchangeIcon } from '@/assets/svg';
import { ReactComponent as ArrowRight } from '@/assets/svg/arrow-right.svg';
import Drawer from '@/components/Drawer';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { PAIR_PAGE_TYPE } from '@/constants/global';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useSimulationBalanceChange } from '@/features/trade/hooks';
import { useIsTokenExchangeHidden, useTokenExchangeModal } from '@/hooks/trade/useTokenExchange';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  chainId: CHAIN_ID | undefined;
  type?: PAIR_PAGE_TYPE;
}
const AvailableMarginDrawer: FC<IPropTypes> = function ({ chainId, type = PAIR_PAGE_TYPE.TRADE }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const currentPair = useCurrentPairFromUrl(chainId);

  const {
    isShowVaultChange,
    isShowBalanceChange,
    gateBalanceBefore,
    gateBalanceAfter,
    walletBalanceBefore: tokenBalanceBefore,
    walletBalanceAfter: tokenBalanceAfter,
    totalBalanceBefore,
    totalBalanceAfter,
    isShowTotalBalanceChange,
  } = useSimulationBalanceChange(chainId, currentPair?.rootInstrument?.quoteToken);
  const { toggleModal } = useTokenExchangeModal();
  const isTokenExchangeHidden = useIsTokenExchangeHidden(currentPair?.rootInstrument?.quoteToken.symbol);
  return (
    <>
      <dl
        className="syn-available-margin-drawer-margin"
        onClick={() => {
          setOpen(true);
        }}>
        <dt>
          {t(type === PAIR_PAGE_TYPE.TRADE ? 'common.availableBalanceTile.avM' : 'common.availableBalanceTile.title')}
          {currentPair?.rootInstrument.quoteToken?.symbol && `(${currentPair?.rootInstrument.quoteToken?.symbol})`}
        </dt>
        <div className="syn-available-margin-drawer-margin-line"></div>
        <dd className="syn-available-margin-drawer-margin-value">
          {totalBalanceBefore?.formatNumberWithTooltip({ isShowTBMK: true })}
          {isShowTotalBalanceChange && (
            <>
              <ArrowRight />
              {totalBalanceAfter?.formatNumberWithTooltip({ isShowTBMK: true })}
            </>
          )}
          {!isTokenExchangeHidden && <ExchangeIcon />}
        </dd>
      </dl>
      <Drawer
        placement="bottom"
        height={'auto'}
        title={
          <div className="syn-available-margin-drawer-title">
            <div>
              <span>{t('common.availableBalanceTile.av')}</span>
              <small>
                = {t('common.wb')} + {t('common.tradePage.accountB')}
              </small>
            </div>
            {!isTokenExchangeHidden && (
              <button
                onClick={() => {
                  toggleModal();
                }}
                className="syn-available-margin-drawer-title-btn">
                {t('common.exchange')}
              </button>
            )}
          </div>
        }
        open={open}
        destroyOnClose
        onClose={() => setOpen(false)}
        className="syn-available-margin-drawer reverse-header">
        <div>
          <dl>
            <dt>
              {t('common.tradePage.accountB')} ({currentPair?.rootInstrument?.quoteToken?.symbol})
            </dt>
            <dd>
              <EmptyDataWrap isLoading={!gateBalanceBefore}>
                <span>{gateBalanceBefore?.formatNumberWithTooltip({})}</span>
                {isShowVaultChange && (
                  <span className="syn-account-balance-value-bottom">
                    <ArrowRight />
                    {gateBalanceAfter?.formatNumberWithTooltip({})}
                  </span>
                )}
              </EmptyDataWrap>
            </dd>
          </dl>
          <dl>
            <dt>
              {t('common.wb')} ({currentPair?.rootInstrument?.quoteToken?.symbol})
            </dt>
            <dd>
              <EmptyDataWrap isLoading={!tokenBalanceBefore}>
                <span>{tokenBalanceBefore?.formatNumberWithTooltip({})}</span>
                {isShowBalanceChange && (
                  <span className="syn-account-balance-value-bottom">
                    <ArrowRight />
                    {tokenBalanceAfter?.formatNumberWithTooltip({})}
                  </span>
                )}
              </EmptyDataWrap>
            </dd>
          </dl>
        </div>
      </Drawer>
    </>
  );
};

export default AvailableMarginDrawer;
