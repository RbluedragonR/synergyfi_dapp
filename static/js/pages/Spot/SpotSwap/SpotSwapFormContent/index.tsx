/**
 * @description Component-SpotSwap
 */
import '../index.less';

import { ReactComponent as SwapIcon } from '@/assets/svg/icon_swap.svg';
import { Button } from '@/components/Button';
import FormInput from '@/components/FormInput';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { Skeleton } from '@/components/Skeleton';
import { Tooltip } from '@/components/ToolTip';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useTokenBalance } from '@/features/balance/hook';
import { useTokenPrice } from '@/features/global/query';
import { useSetBuyToken, useSetSellToken, useSimulateBestAmount, useSwitchToken } from '@/features/spot/hooks';
import { useSimulateSwap } from '@/features/spot/query';
import { useSpotState } from '@/features/spot/store';
import { TokenInfoInSpot } from '@/features/spot/types';
import { useChainId, useEtherscanLink } from '@/hooks/web3/useChain';
import PercentageSelector from '@/pages/components/PercentageSelector/PercentageSelector';
import { formatDisplayNumber, inputNumChecker } from '@/utils/numberUtil';
import { useFocusWithin } from 'ahooks';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SpotSellTokens from '../../SpotTokens/SpotSellTokens';
import SpotBuyTokens from '../../SpotTokens/SpotsBuyTokens';
import warningSrc from '../assets/warning.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const WarningAddressTooltip = ({ token }: { token: TokenInfoInSpot }) => {
  const { t } = useTranslation();
  const getEtherscanLink = useEtherscanLink();
  return (
    <Tooltip
      overlayInnerStyle={{ width: '305px' }}
      title={
        <div className="syn-spot-swap-form-row-input-tip-content">
          <a
            className="syn-spot-swap-form-row-input-tip-content-address"
            href={getEtherscanLink(token.address, 'token')}
            target="_blank"
            rel="noreferrer">
            {token.address}
          </a>
          <div>{t('spot.confirm-token-address')}</div>
        </div>
      }
      className="syn-spot-swap-form-row-input-tip">
      <img src={warningSrc} alt="warning" />
    </Tooltip>
  );
};
const SpotSwapFormContent: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const { sellAmount, setSellAmount, token1: buyToken, token0: sellToken } = useSpotState();
  const [isClickSellPercent, setIsClickSellPercent] = useState(false);
  const sellBalance = useTokenBalance(sellToken.address, chainId, true);
  const buyBalance = useTokenBalance(buyToken.address, chainId, true);
  const buyTokenPrice = useTokenPrice({ tokenAddress: buyToken.address, chainId });
  const sellTokenPrice = useTokenPrice({ tokenAddress: sellToken.address, chainId });
  const { bestAmount: buyAmount } = useSimulateBestAmount();
  const { setSellTokenFn } = useSetSellToken();
  const { setBuyTokenFn } = useSetBuyToken();
  const { switchToken } = useSwitchToken();
  const { data: simulation } = useSimulateSwap();
  const ref = useRef(null);
  const isFocusWithin = useFocusWithin(ref);
  const { deviceType } = useMediaQueryDevice();

  const sellUsd = useMemo(
    () => WrappedBigNumber.from(sellAmount || 0).mul(sellTokenPrice?.current || 1),
    [sellAmount, sellTokenPrice],
  );
  const buyUsd = useMemo(() => {
    const amount = WrappedBigNumber.from(buyAmount || 0).mul(buyTokenPrice?.current || 1);
    return amount.gt(sellUsd) ? sellUsd : amount;
  }, [buyAmount, buyTokenPrice, sellUsd]);
  const onRatioChanged = useCallback(
    (ratio: number) => {
      if (ratio === 100) {
        setIsClickSellPercent(false);
      } else {
        setIsClickSellPercent(true);
      }

      setSellAmount(inputNumChecker(sellBalance.mul(ratio / 100).stringValue, sellToken.decimals));
    },
    [sellBalance, sellToken.decimals, setSellAmount],
  );
  const sliderRatio = useMemo(
    () =>
      Number(
        WrappedBigNumber.from(sellAmount || 0)
          .div(sellBalance || 1)
          .mul(100)
          .toNumber()
          .toFixed(0),
      ),
    [sellAmount, sellBalance],
  );
  useEffect(() => {
    return () => {
      setSellAmount('');
    };
  }, [setSellAmount]);

  useEffect(() => {
    if (sellAmount?.length === 0) {
      setIsClickSellPercent(false);
    }
  }, [sellAmount]);

  return (
    <div className="syn-spot-swap-form-content">
      <div ref={ref} className={classNames('syn-spot-swap-form-row', deviceType, isFocusWithin && 'active')}>
        <div className="syn-spot-swap-form-row-label">
          {t('common.spot.sell')}
          <div className="syn-spot-swap-form-row-label-right">
            {t('common.balance')}:{' '}
            {sellBalance?.formatNumberWithTooltip({
              isShowTBMK: true,
              suffix: sellToken?.symbol,
            })}
          </div>
        </div>
        <div className="syn-spot-swap-form-row-input">
          <div className="syn-spot-swap-form-row-input-top">
            <div className="syn-spot-swap-form-row-input-left">
              <div className="syn-spot-swap-form-row-input-left-top">
                <FormInput
                  inputProps={{
                    type: 'text',
                    pattern: '^[0-9]*[.,]?[0-9]*$',
                    inputMode: 'decimal',
                    autoComplete: 'off',
                    autoCorrect: 'off',
                    step: 1e18,
                    onKeyDown: (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault(),
                  }}
                  tokenInfo={sellToken}
                  maxCheckZero={true}
                  placeHolder="0.00"
                  suffix={<></>}
                  inputAmountStr={
                    isClickSellPercent
                      ? formatDisplayNumber({
                          num: sellAmount,
                          isShowApproximatelyEqualTo: false,
                          type: 'price',
                          showTrailingZeros: false,
                        })
                      : sellAmount
                  }
                  inputAmountStrChanged={(value) => {
                    setIsClickSellPercent(false);
                    setSellAmount(value);
                  }}
                />
              </div>
            </div>
            <div className="syn-spot-swap-form-row-input-token">
              {sellToken.isSymbolDuplicated && <WarningAddressTooltip token={sellToken} />}
              <SpotSellTokens
                currentToken={sellToken}
                onTokenChange={(token: TokenInfoInSpot) => {
                  setSellTokenFn(token);
                }}
              />
            </div>
          </div>
          <div className="syn-spot-swap-form-row-input-bottom">
            {sellAmount ? (
              <span className="usd">
                ≈{' '}
                {sellUsd?.formatNumberWithTooltip({
                  isShowTBMK: true,
                  prefix: '$',
                })}
              </span>
            ) : (
              <div className="place-holder">
                <span className="usd">≈$0</span>
              </div>
            )}
          </div>
        </div>

        <PercentageSelector value={sliderRatio} onChange={onRatioChanged} />
      </div>
      <div className="syn-spot-swap-form-content-swap-container">
        <div className="syn-spot-swap-form-content-swap-line" />
        <Button onClick={switchToken} className="syn-spot-swap-form-content-swap" ingoreMobile={true}>
          <SwapIcon />
        </Button>
      </div>
      <div className="syn-spot-swap-form-row">
        <div className="syn-spot-swap-form-row-label">
          {t('common.spot.buy')}{' '}
          <div className="syn-spot-swap-form-row-label-right">
            {t('common.balance')}:{' '}
            {buyBalance?.formatNumberWithTooltip({
              isShowTBMK: true,
              suffix: buyToken?.symbol,
            })}
          </div>
        </div>
        <div className="syn-spot-swap-form-row-input">
          <div className="syn-spot-swap-form-row-input-top">
            <div className="syn-spot-swap-form-row-input-left">
              {(!WrappedBigNumber.from(sellAmount || 0).eq(0) && !simulation) ||
              !!simulation?.message ||
              simulation?.timeout ? (
                <>
                  <div className="syn-spot-swap-form-row-input-left-top">
                    <Skeleton className="syn-spot-swap-form-row-skeleton" active={true} paragraph={false} />
                  </div>
                </>
              ) : (
                <>
                  {' '}
                  {buyAmount ? (
                    <>
                      <div className="amount">
                        {WrappedBigNumber.from(buyAmount || '').formatNumberWithTooltip({
                          minDecimalPlaces: 6,
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="place-holder">
                      <div className="amount">0.00</div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="syn-spot-swap-form-row-input-token">
              {buyToken.isSymbolDuplicated && <WarningAddressTooltip token={buyToken} />}
              <SpotBuyTokens tokenToExclude={sellToken} currentToken={buyToken} onTokenChange={setBuyTokenFn} />
            </div>
          </div>

          <div className="syn-spot-swap-form-row-input-bottom">
            {(!WrappedBigNumber.from(sellAmount || 0).eq(0) && !simulation) ||
            !!simulation?.message ||
            simulation?.timeout ? (
              <>
                <Skeleton className="syn-spot-swap-form-row-skeleton" active={true} paragraph={false} />
              </>
            ) : buyAmount ? (
              <>
                <span className="usd">
                  ≈
                  {buyUsd.formatNumberWithTooltip({
                    isShowTBMK: true,
                    prefix: '$',
                  })}
                </span>
              </>
            ) : (
              <div className="place-holder">
                <span className="usd">≈$0</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotSwapFormContent;
