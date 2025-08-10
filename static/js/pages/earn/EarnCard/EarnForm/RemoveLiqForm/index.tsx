/**
 * @description Component-RemoveLiqForm
 */
import './index.less';

import { FC, useEffect } from 'react';

import { EARN_TYPE } from '@/constants/earn';
import { useWrappedPortfolioByPairId } from '@/features/account/portfolioHook';
import { useCurrentRange } from '@/features/account/rangeHook';
import { removeLiquiditySimulate, setEarnFormType } from '@/features/earn/action';
import { useRemoveLiquidationSimulation, useRemoveLiquidationSuccess } from '@/features/earn/hook';
import { useGlobalConfig } from '@/features/global/hooks';
import { usePairFromUrl } from '@/features/pair/hook';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { perToTenThousands } from '@/utils/trade';

import useSetTradePortfolioTab from '@/hooks/trade/useSetTradePortfolioTab';
import EarnFormAlert from '../EarnFormAlert';
import RemoveLiqFormDetail from '../RemoveLiqFormDetail';
interface IPropTypes {
  className?: string;
}
const RemoveLiqForm: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  // const { dataTheme } = useTheme();
  const userAddr = useUserAddr();
  const pair = usePairFromUrl(chainId);
  const dispatch = useAppDispatch();
  const portfolio = useWrappedPortfolioByPairId(chainId, userAddr, pair?.id);
  const sdkContext = useSDK(chainId);
  const { slippage } = useGlobalConfig(chainId);
  const range = useCurrentRange(chainId, userAddr);
  const simulation = useRemoveLiquidationSimulation(chainId);
  const removeSuccess = useRemoveLiquidationSuccess(chainId, EARN_TYPE.REMOVE_LIQ);
  const setTradePortfolioTab = useSetTradePortfolioTab();
  //const { t } = useTranslation();
  useEffect(() => {
    chainId &&
      range &&
      slippage &&
      portfolio &&
      dispatch(
        removeLiquiditySimulate({
          chainId,
          sdkContext,
          portfolio,
          range,
          slippage: perToTenThousands(Number(slippage)),
        }),
      );
  }, [chainId, dispatch, portfolio, range, range?.id, sdkContext, slippage]);
  useEffect(() => {
    if (removeSuccess && chainId) {
      dispatch(
        setEarnFormType({
          chainId,
          formType: EARN_TYPE.ADD_LIQ,
        }),
      );
    }
  }, [chainId, dispatch, removeSuccess, setTradePortfolioTab]);
  return (
    <div className="syn-remove-liq-form">
      {/* {removeSuccess ? (
        <div className="syn-remove-liq-form-success">
          <img src={dataTheme === THEME_ENUM.LIGHT ? SucccessLogo : SucccessLogo_dark} />
          <div className="syn-remove-liq-form-success-line">{t('common.earn.removeSuccessLine')}</div>
        </div>
      ) : (
        <> */}
      <RemoveLiqFormDetail />
      <EarnFormAlert
        simulation={simulation}
        chainId={chainId}
        earnType={EARN_TYPE.REMOVE_LIQ}
        marginToken={pair?.rootInstrument?.quoteToken}
      />
      {/* </>
      )} */}
    </div>
  );
};

export default RemoveLiqForm;
