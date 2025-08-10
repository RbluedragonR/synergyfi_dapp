/**
 * @description Component-WrapETHButton
 */
import { Button } from '@/components/Button';
import './index.less';

import { TabType } from '@/constants';
import { EARN_TYPE } from '@/constants/earn';
import { TRADE_TYPE } from '@/constants/trade';
import { setGateAccountState } from '@/features/balance/actions';
import { useWrappedNativeToken } from '@/features/chain/hook';
import { setEarnFormType } from '@/features/earn/action';
import { useTabType } from '@/features/global/hooks';
import { setTradeFormType } from '@/features/trade/actions';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import { getDefaultITradeAccountState } from '@/types/balance';
import { TokenInfo } from '@/types/token';
import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  quote: TokenInfo | undefined;
}
const WrapETHButton: FC<IPropTypes> = function ({ quote }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const wrappedNative = useWrappedNativeToken(chainId);
  const tabType = useTabType();
  const isWrappedNative = useMemo(() => {
    return wrappedNative?.address === quote?.address;
  }, [quote?.address, wrappedNative?.address]);

  const openDepositNativeCard = useCallback(() => {
    if (tabType === TabType.Trade) {
      chainId &&
        dispatch(
          setTradeFormType({
            chainId,
            tradeType: TRADE_TYPE.DEPOSIT_NATIVE,
          }),
        );
    } else {
      chainId &&
        dispatch(
          setEarnFormType({
            chainId,
            formType: EARN_TYPE.DEPOSIT_NATIVE,
          }),
        );
    }
  }, [chainId, dispatch, tabType]);

  if (!isWrappedNative) return null;
  return (
    <Button
      className="syn-wrap-eth-button"
      onClick={() => {
        chainId &&
          dispatch(
            setGateAccountState({
              chainId,
              ...getDefaultITradeAccountState(),
            }),
          );
        openDepositNativeCard();
      }}>
      {t('common.tradePage.wrapETH')}
    </Button>
  );
};

export default WrapETHButton;
