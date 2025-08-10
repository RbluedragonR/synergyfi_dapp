/**
 * @description Component-TradeSettingAlert
 */
import './index.less';

import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Alert from '@/components/Alert';
import { SLIPPAGE_THRESHOLDS } from '@/constants/global';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
interface IPropTypes {
  slippage: string;
  deadline: string;
  gasPrice: string;
}
const TradeSettingAlert: FC<IPropTypes> = function ({ slippage }) {
  const { t } = useTranslation();

  const isShowSlippageLowAlert = useMemo(() => {
    return WrappedBigNumber.from(slippage).lt(SLIPPAGE_THRESHOLDS.LOW);
  }, [slippage]);

  const isShowSlippageHighAlert = useMemo(() => {
    return WrappedBigNumber.from(slippage).gte(SLIPPAGE_THRESHOLDS.HIGH);
  }, [slippage]);

  const isShowSlippageAlert = useMemo(() => {
    return isShowSlippageLowAlert || isShowSlippageHighAlert;
  }, [isShowSlippageLowAlert, isShowSlippageHighAlert]);

  if (!isShowSlippageAlert) return null;

  return (
    <div className="trade-setting-alert">
      {isShowSlippageLowAlert && (
        <Alert
          message={t('common.walletCardWrapper.formSettings.slippage.lowWarningTxt')}
          type="warning"
          showIcon></Alert>
      )}
      {isShowSlippageHighAlert && (
        <Alert
          message={t('common.walletCardWrapper.formSettings.slippage.highWarningTxt')}
          type="warning"
          showIcon></Alert>
      )}
    </div>
  );
};

export default TradeSettingAlert;
