/**
 * @description Component-AddLiqFormDetail
 */
import './index.less';

import { FC, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Mobile, useMediaQueryDevice } from '@/components/MediaQuery';
import LeanMoreToolTip from '@/components/ToolTip/LeanMoreToolTip';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { PAIR_PAGE_TYPE } from '@/constants/global';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useAddLiquidationSimulation } from '@/features/earn/hook';
import { usePairFromUrl } from '@/features/pair/hook';
import { useChainId } from '@/hooks/web3/useChain';
import AvailableMarginDrawer from '@/pages/components/AvailableMarginDrawer';
import LiquidationPrices from '@/pages/components/LiquidationPrices';
import SettingsDrawer from '@/pages/mobile/TradeMobile/TradeFormMobileMessages/SettingsDrawer';
import WrapNativeDrawer from '@/pages/mobile/TradeMobile/TradeFormMobileMessages/WrapNativeDrawer';
import { inputNumChecker } from '@/utils/numberUtil';
import { isWrappedNativeToken } from '@/utils/token';
import { calcAsymmetricBoost } from '@synfutures/sdks-perp';
import classNames from 'classnames';
interface IPropTypes {
  className?: string;
  imr: number;
}
const AddLiqFormDetail: FC<IPropTypes> = function ({ imr }) {
  const chainId = useChainId();
  const { t } = useTranslation();
  const { deviceType, isMobile } = useMediaQueryDevice();
  const currentPair = usePairFromUrl(chainId);
  const simulation = useAddLiquidationSimulation(chainId);
  const isWrappedNative = useMemo(
    () => chainId && isWrappedNativeToken(chainId, currentPair?.rootInstrument.marginToken?.address || ''),
    [chainId, currentPair?.rootInstrument.marginToken?.address],
  );
  const upperPrice = useMemo(() => {
    const upper = WrappedBigNumber.from(simulation?.data?.upperLiqPrice || 0);
    // if (currentPair?.rootInstrument.isInverse) {
    //   return WrappedBigNumber.from(simulation?.data?.lowerLiqPrice || 0);
    // }
    return upper;
  }, [simulation?.data?.upperLiqPrice]);
  const boost = useMemo(() => {
    if (simulation?.data && imr) {
      return calcAsymmetricBoost(simulation.data.equivalentAlphaLower, simulation.data.equivalentAlphaUpper, imr);
    }
    return 10;
  }, [imr, simulation?.data]);
  const lowerPrice = useMemo(() => {
    const lower = WrappedBigNumber.from(simulation?.data?.lowerLiqPrice || 0);
    // if (currentPair?.rootInstrument.isInverse) {
    //   return WrappedBigNumber.from(simulation?.data?.upperLiqPrice || 0);
    // }
    return lower;
  }, [simulation?.data?.lowerLiqPrice]);

  useEffect(() => {
    if (simulation?.message) {
      gtag('event', 'add_liquidity_simulate_result', {
        add_liquidity_simulate_result: simulation.message,
      });
    }
  }, [simulation?.message]);
  const isHidden = ((!simulation?.data || !!simulation.message) && !isMobile) || simulation?.data?.margin.eq(0);
  if (isHidden && !isMobile) {
    return null;
  }
  return (
    <div className={classNames('syn-add-liq-form-detail', deviceType)}>
      <div className="syn-add-liq-form-detail-msg">
        <Mobile>
          <AvailableMarginDrawer type={PAIR_PAGE_TYPE.EARN} chainId={chainId} />
        </Mobile>

        {!isHidden && simulation?.data && !simulation.message && (
          <>
            <dl>
              <dt> {t('common.earn.detail.cb')}</dt>
              <div className="syn-add-liq-form-detail-line"></div>
              <dd>
                <UnderlineToolTip
                  title={
                    <Trans
                      i18nKey="tooltip.earnPage.boost"
                      values={{
                        boost: WrappedBigNumber.from(boost).formatLeverageString(),
                      }}
                      components={{ b: <b /> }}
                    />
                  }>
                  <span>{WrappedBigNumber.from(boost).formatLeverageWithTooltip()}</span>
                </UnderlineToolTip>
              </dd>
            </dl>
            <dl>
              <dt> {t('common.earn.removalP')}</dt>
              <div className="syn-add-liq-form-detail-line"></div>
              <dd>
                <LeanMoreToolTip
                  title={
                    <Trans
                      i18nKey="common.earn.lowerPriceDesc"
                      values={{
                        lowerPrice: WrappedBigNumber.from(simulation?.data?.lowerPrice || 0).formatPriceString(),
                        shortPosition: WrappedBigNumber.from(simulation?.data?.lowerPosition.size || 0)
                          .abs()
                          .formatDisplayNumber(),
                        leverage: inputNumChecker(
                          WrappedBigNumber.from(simulation?.data?.lowerLeverage || 0).formatDisplayNumber(),
                          1,
                        ),
                        margin: WrappedBigNumber.from(
                          simulation?.data?.lowerPosition.balance || 0,
                        ).formatDisplayNumber(),
                        base: currentPair?.rootInstrument.baseToken.symbol,
                        quote: currentPair?.rootInstrument.quoteToken.symbol,
                      }}
                      components={{ b: <b /> }}
                    />
                  }>
                  {WrappedBigNumber.from(simulation?.data?.lowerPrice || 0).formatPriceString()}
                </LeanMoreToolTip>{' '}
                <span className="divider">/</span>
                <LeanMoreToolTip
                  title={
                    <Trans
                      i18nKey="common.earn.upperPriceDesc"
                      values={{
                        upperPrice: WrappedBigNumber.from(simulation?.data?.upperPrice || 0).formatPriceString(),
                        longPosition: WrappedBigNumber.from(simulation?.data?.upperPosition.size || 0)
                          .abs()
                          .formatDisplayNumber(),
                        leverage: inputNumChecker(
                          WrappedBigNumber.from(simulation?.data?.upperLeverage || 0).formatDisplayNumber(),
                          1,
                        ),
                        margin: WrappedBigNumber.from(
                          simulation?.data?.upperPosition.balance || 0,
                        ).formatDisplayNumber(),
                        base: currentPair?.rootInstrument.baseToken.symbol,
                        quote: currentPair?.rootInstrument.quoteToken.symbol,
                      }}
                      components={{ b: <b /> }}
                    />
                  }>
                  {' '}
                  {WrappedBigNumber.from(simulation?.data?.upperPrice || 0).formatPriceString()}
                </LeanMoreToolTip>
              </dd>
            </dl>
            <dl>
              <dt> {t('common.liqP')}</dt>
              <div className="syn-add-liq-form-detail-line"></div>
              <dd>
                <LiquidationPrices lowerLiqPrice={lowerPrice} upperLiqPrice={upperPrice} />
              </dd>
            </dl>
          </>
        )}
      </div>
      {!isHidden && (
        <>
          <Mobile>
            <>
              {(isWrappedNative || (simulation?.data && !simulation.message)) && (
                <div className="syn-add-liq-form-detail-btns">
                  {simulation?.data && !simulation.message && <SettingsDrawer />}
                  {isWrappedNative && <WrapNativeDrawer />}
                </div>
              )}
            </>
          </Mobile>
        </>
      )}
    </div>
  );
};

export default AddLiqFormDetail;
