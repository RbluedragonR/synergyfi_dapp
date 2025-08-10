/**
 * @description Component-LiquidationPrices
 */
import './index.less';

import { FC } from 'react';
import { Trans } from 'react-i18next';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import LeanMoreToolTip from '@/components/ToolTip/LeanMoreToolTip';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
interface IPropTypes {
  className?: string;
  lowerLiqPrice: WrappedBigNumber;
  upperLiqPrice: WrappedBigNumber;
}
const LiquidationPrices: FC<IPropTypes> = function ({ lowerLiqPrice, upperLiqPrice }) {
  const { isNotMobile } = useMediaQueryDevice();
  return (
    <EmptyDataWrap isLoading={!lowerLiqPrice || !upperLiqPrice}>
      <div className="syn-liquidation-prices">
        {lowerLiqPrice.gt(0) && (
          <>
            <LeanMoreToolTip
              title={
                isNotMobile && (
                  <Trans
                    i18nKey="common.earn.detail.belowText"
                    values={{
                      lowerPrice: lowerLiqPrice.formatLiqPriceString(),
                    }}
                    components={{ b: <b /> }}
                  />
                )
              }>
              <div className="syn-liquidation-prices-price">
                {lowerLiqPrice.formatLiqPriceString({
                  showToolTip: false,
                })}
              </div>
            </LeanMoreToolTip>
          </>
        )}
        {lowerLiqPrice.gt(0) && upperLiqPrice.notEq(Infinity) && upperLiqPrice.gt(0) && (
          <span className="syn-liquidation-prices-slash">/</span>
        )}
        {upperLiqPrice.notEq(Infinity) && upperLiqPrice.gt(0) && (
          <LeanMoreToolTip
            title={
              isNotMobile && (
                <Trans
                  i18nKey="common.earn.detail.aboveText"
                  values={{
                    upperPrice: upperLiqPrice.formatLiqPriceString(),
                  }}
                  components={{ b: <b /> }}
                />
              )
            }>
            <div className="syn-liquidation-prices-price">
              {upperLiqPrice.formatLiqPriceString({
                showToolTip: false,
              })}
            </div>
          </LeanMoreToolTip>
        )}
      </div>
    </EmptyDataWrap>
  );
};

export default LiquidationPrices;
