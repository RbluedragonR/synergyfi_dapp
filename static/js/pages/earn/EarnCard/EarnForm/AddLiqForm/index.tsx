/**
 * @description Component-AddLiqForm
 */
import './index.less';

import { useDebounceEffect } from 'ahooks';
import classNames from 'classnames';
import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import FormInput from '@/components/FormInput';
import { AvailableBalance } from '@/components/ToolTip/AvailableBalanceToolTip';
import { DEFAULT_DECIMAL_PLACES, FETCHING_STATUS } from '@/constants';
import { EARN_TYPE } from '@/constants/earn';
import { EARN_ALPHA_THRESHOLDS } from '@/constants/global';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { useMainPosition } from '@/features/account/positionHook';
import { useDisplayBalance } from '@/features/balance/hook';
import { setAddLiqFormState, setEarnFormType } from '@/features/earn/action';
import {
  useAddLiquidationSimulation,
  useAddLiquidityFormState,
  useAddLiquidityFormStateStatus,
} from '@/features/earn/hook';
import { useCombinedPairFromUrl } from '@/features/pair/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import { Mobile, useMediaQueryDevice } from '@/components/MediaQuery';
import FloatingInput from '@/pages/components/FloatingInput';
import EarnFormFooter from '../../EarnFormFooter';
import AddLiqFormDetail from '../AddLiqFormDetail';
import EarnFormAlert from '../EarnFormAlert';
import PriceRangeAndChart from './PriceRangeAndChart';
interface IPropTypes {
  className?: string;
}
const AddLiqForm: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const currentPair = useCombinedPairFromUrl(chainId);
  const userAddr = useUserAddr();
  const { t } = useTranslation();
  const { isMobile, deviceType } = useMediaQueryDevice();
  const addLiqState = useAddLiquidityFormState(chainId);
  const addLiqStatus = useAddLiquidityFormStateStatus(chainId);
  const dispatch = useAppDispatch();
  const simulation = useAddLiquidationSimulation(chainId);
  const currentImr = useMemo(() => {
    if (currentPair instanceof WrappedPair) {
      return currentPair.rootInstrument.setting.initialMarginRatio;
    }
    return EARN_ALPHA_THRESHOLDS.DEFAULT_IMR;
  }, [currentPair]);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const displaceBalance = useDisplayBalance(
    currentPosition,
    true,
    chainId,
    currentPair?.rootInstrument.quoteToken.address,
  );
  const inputAmountStrChanged = useCallback(
    (inputAmountStr: string) => {
      inputAmountStr &&
        gtag('event', 'enter_liquidity_size', {
          enter_action: 'enter',
        });
      addLiqState &&
        dispatch(
          setAddLiqFormState({
            ...addLiqState,
            amount: inputAmountStr,
          }),
        );
    },
    [dispatch, addLiqState],
  );

  const onClickMax = useCallback(
    (balance: WrappedBigNumber) => {
      inputAmountStrChanged(balance.stringValue);
    },
    [inputAmountStrChanged],
  );

  const onNativeTokenDepositClick = useCallback(() => {
    chainId &&
      dispatch(
        setEarnFormType({
          chainId,
          formType: EARN_TYPE.DEPOSIT_NATIVE,
        }),
      );
  }, [chainId, dispatch]);
  useDebounceEffect(() => {
    document.getElementById('earnAmount')?.focus();
  }, []);

  return (
    <div className={classNames('syn-add-liq-form', deviceType)}>
      <PriceRangeAndChart />
      <div className="syn-add-liq-form-content-section">
        {!isMobile && <div className="syn-add-liq-form-content-title">{t('common.formInput.placeHolder')}</div>}
        {isMobile ? (
          <FloatingInput
            label={t('common.amount')}
            onChange={(val) => {
              if (displaceBalance.lte(val)) {
                inputAmountStrChanged(displaceBalance.stringValue);
              } else {
                inputAmountStrChanged(val);
              }
            }}
            decimals={
              currentPair instanceof WrappedPair
                ? currentPair?.rootInstrument.marginToken.decimals
                : DEFAULT_DECIMAL_PLACES
            }
            suffix={currentPair?.rootInstrument.quoteToken?.symbol}
            value={addLiqState?.amount || ''}
            disabled={addLiqStatus === FETCHING_STATUS.FETCHING}
          />
        ) : (
          <FormInput
            inputProps={{
              type: 'text',
              pattern: '^[0-9]*[.,]?[0-9]*$',
              inputMode: 'decimal',
              autoComplete: 'off',
              id: 'earnAmount',
              autoCorrect: 'off',
              onKeyDown: (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault(),
              step: 1e18,
            }}
            max={displaceBalance.stringValue}
            disabled={addLiqStatus === FETCHING_STATUS.FETCHING}
            className="syn-add-liq-form-content-input"
            inputAmountStr={addLiqState?.amount || ''}
            inputAmountStrChanged={inputAmountStrChanged}
            suffix={currentPair?.rootInstrument.quoteToken?.symbol}
          />
        )}
        {!isMobile && (
          <>
            <AvailableBalance
              balanceMaxProps={{
                isShowBalance: false,
                max: displaceBalance,
                marginToken: currentPair?.rootInstrument?.quoteToken,
                onClickMax,
              }}
            />
          </>
        )}
      </div>

      <Mobile>
        <EarnFormFooter isMobile={true} inputAmountStr={addLiqState?.amount} earnType={EARN_TYPE.ADD_LIQ} />
      </Mobile>
      {isMobile && (
        <>
          <EarnFormAlert
            simulation={simulation}
            chainId={chainId}
            earnType={EARN_TYPE.ADD_LIQ}
            marginToken={currentPair?.rootInstrument.quoteToken}
            onMaxBalanceClick={(balance) => {
              onClickMax(balance);
            }}
            onNativeTokenDepositClick={onNativeTokenDepositClick}
          />
          <AddLiqFormDetail imr={currentImr} />
        </>
      )}
      {WrappedBigNumber.from(addLiqState?.amount || 0).notEq(0) && !isMobile && (
        <>
          {
            <>
              <AddLiqFormDetail imr={currentImr} />
              <EarnFormAlert
                simulation={simulation}
                chainId={chainId}
                earnType={EARN_TYPE.ADD_LIQ}
                marginToken={currentPair?.rootInstrument.quoteToken}
                onMaxBalanceClick={(balance) => {
                  onClickMax(balance);
                }}
                onNativeTokenDepositClick={onNativeTokenDepositClick}
              />
            </>
          }
        </>
      )}
    </div>
  );
};

export default AddLiqForm;
