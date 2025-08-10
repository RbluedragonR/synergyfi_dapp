import './index.less';

import { ColumnsType } from 'antd/es/table';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CloseIcon } from '@/assets/svg/icon_close_24.svg';
import { Button } from '@/components/Button';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import LeanMoreToolTip from '@/components/ToolTip/LeanMoreToolTip';
import { FETCHING_STATUS } from '@/constants';
import { EARN_TYPE } from '@/constants/earn';
import { WrappedRange } from '@/entities/WrappedRange';
import { useCurrentRange } from '@/features/account/rangeHook';
import { setCurrentRange, setEarnFormType } from '@/features/earn/action';
import { useEarnFormType, useRemoveLiquidityFormStateStatus } from '@/features/earn/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import LiquidationPrices from '@/pages/components/LiquidationPrices';

import { Tooltip } from '@/components/ToolTip';
import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useIsIpBlocked } from '@/features/global/hooks';
import { setTradeFormType } from '@/features/trade/actions';
import { bigNumberSort } from '@/utils/numberUtil';
import { useNavigate } from 'react-router-dom';
import PriceRange from './PriceRange';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useLiqTableColumns(): ColumnsType<WrappedRange> {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const ipBlocked = useIsIpBlocked();
  const currentRange = useCurrentRange(chainId, userAddr);
  const removeStatus = useRemoveLiquidityFormStateStatus(chainId);
  const earnType = useEarnFormType(chainId);
  const isDisableBtn = useMemo(() => {
    return earnType === EARN_TYPE.REMOVE_LIQ && removeStatus === FETCHING_STATUS.FETCHING;
  }, [earnType, removeStatus]);
  const navigate = useNavigate();
  //const setTradePortfolioTab = useSetTradePortfolioTab();
  const rowClicked = useCallback(
    async (range: WrappedRange) => {
      chainId &&
        dispatch(
          setCurrentRange({
            chainId,
            rangeId: range.id,
          }),
        );
      chainId &&
        dispatch(
          setEarnFormType({
            chainId,
            formType: EARN_TYPE.REMOVE_LIQ,
          }),
        );
      navigate(
        (chainId &&
          range.rootPair.symbol &&
          `/earn/${DAPP_CHAIN_CONFIGS[chainId]?.network?.shortName}/${range.rootPair.symbol}`) ||
          '',
      );

      chainId &&
        dispatch(
          setTradeFormType({
            chainId,
            tradeType: TRADE_TYPE.MARKET,
          }),
        );
      // Scroll the main-container to the top
      const mainContainer = document.querySelector('.main-container');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [chainId, dispatch, navigate],
  );
  const unSelectRow = useCallback(() => {
    chainId &&
      dispatch(
        setCurrentRange({
          chainId,
          rangeId: '',
        }),
      );
    chainId &&
      dispatch(
        setEarnFormType({
          chainId,
          formType: EARN_TYPE.ADD_LIQ,
        }),
      );
  }, [chainId, dispatch]);

  const priceRange = useMemo(
    () => ({
      title: t('common.earn.priceR'),
      key: 'pr',
      width: 120,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_value: any, record: WrappedRange): JSX.Element | undefined => {
        return (
          <PriceRange
            minPrice={record.wrapAttribute('lowerPrice')}
            maxPrice={record.wrapAttribute('upperPrice')}
            isInverse={record.rootPair.rootInstrument.isInverse}
            pairId={record.rootPair.id}
            fairPrice={record.rootPair.wrapAttribute('fairPrice')}
          />
        );
      },
    }),
    [t],
  );

  const valueLocked = useMemo(
    () => ({
      title: (
        <LeanMoreToolTip title={t('tooltip.earnPage.valueLocked')}>{t('common.earn.valueLocked')}</LeanMoreToolTip>
      ),
      key: 'vl',
      width: 80,
      sorter: (a: WrappedRange, b: WrappedRange): number => {
        //  a.valueLock needs to be checked first when there is a default sorter
        return bigNumberSort(a.wrapAttribute('valueLocked'), b.wrapAttribute('valueLocked'));
      },
      sortDirections: ['ascend', 'descend'],
      className: 'rangeAmount',
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_value: any, record: WrappedRange): JSX.Element | undefined => {
        return (
          <EmptyDataWrap isLoading={!record}>
            {record.wrapAttribute('valueLocked').formatNumberWithTooltip({
              suffix: record.rootInstrument.marginToken.symbol,
              showToolTip: true,
            })}
          </EmptyDataWrap>
        );
      },
    }),
    [t],
  );

  // const fairPrice = useMemo(
  //   () => ({
  //     title: t('common.fairP'),
  //     key: 'fairPrice',
  //     width: 80,
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     shouldCellUpdate: (record: WrappedRange, prevRecord: WrappedRange): boolean => true,
  //     // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  //     render: (value: any, record: WrappedRange): JSX.Element | undefined => {
  //       return (
  //         <EmptyDataWrap isLoading={!record}>
  //           {record.rootPair.wrapAttribute('fairPrice').formatPriceNumberWithTooltip()}
  //         </EmptyDataWrap>
  //       );
  //     },
  //   }),
  //   [t],
  // );
  const entryPrice = useMemo(
    () => ({
      title: t('common.earn.entryPrice'),
      key: 'entryPrice',
      width: 80,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      shouldCellUpdate: (record: WrappedRange, prevRecord: WrappedRange): boolean => true,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (value: any, record: WrappedRange): JSX.Element | undefined => {
        return (
          <EmptyDataWrap isLoading={!record}>
            {WrappedBigNumber.from(record.entryPrice || 0).formatPriceNumberWithTooltip()}
          </EmptyDataWrap>
        );
      },
    }),
    [t],
  );
  const liquidationPrice = useMemo(
    () => ({
      title: t('common.liqPrice'),
      key: 'lp',
      width: 80,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_value: any, record: WrappedRange): JSX.Element | undefined => {
        return (
          <LiquidationPrices lowerLiqPrice={record.wrappedLowerLiqPrice} upperLiqPrice={record.wrappedUpperLiqPrice} />
        );
      },
    }),
    [t],
  );

  const feesEarned = useMemo(
    () => ({
      title: t('common.earn.feesE'),
      key: 'fe',
      width: 80,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_value: any, record: WrappedRange): JSX.Element | undefined => {
        return (
          <EmptyDataWrap isLoading={!record?.feeEarned}>
            {record.wrapAttribute('feeEarned').formatNumberWithTooltip({
              suffix: record.rootInstrument.marginToken.symbol,
            })}
          </EmptyDataWrap>
        );
      },
    }),
    [t],
  );
  const action = useMemo(
    () => ({
      title: t('common.action'),
      key: 'action',
      width: 80,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (value: any, record: WrappedRange): JSX.Element | undefined => {
        return (
          <div className="syn-earn-liquidities-table-action">
            {currentRange?.id === record.id ? (
              <CloseIcon onClick={unSelectRow} />
            ) : (
              <Tooltip showOnMobile={true} title={ipBlocked ? t('common.ipBlocker.tooltip') : undefined}>
                <Button
                  type="outline"
                  disabled={isDisableBtn || ipBlocked}
                  className="syn-earn-liquidities-click"
                  onClick={() => rowClicked(record)}>
                  {t('common.remove')}
                </Button>
              </Tooltip>
            )}
          </div>
        );
      },
    }),
    [currentRange?.id, isDisableBtn, rowClicked, t, unSelectRow, ipBlocked],
  );

  const columnDefs = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => [priceRange, entryPrice, valueLocked, feesEarned, liquidationPrice, action],
    [action, feesEarned, liquidationPrice, entryPrice, priceRange, valueLocked],
  );
  return columnDefs as ColumnsType<WrappedRange>;
}
