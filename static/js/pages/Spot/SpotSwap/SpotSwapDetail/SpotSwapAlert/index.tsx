/**
 * @description Component-TradeFormAlert
 */
import './index.less';

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Alert from '@/components/Alert';
import I18nTrans from '@/components/I18nTrans';
import { useSpotState } from '@/features/spot/store';
import useMsgIds, { MsgInfo } from '@/spot/useMsg';

interface IPropTypes {}
const SpotSwapAlert: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const msgIds = useMsgIds();
  const { token0: sellToken } = useSpotState();

  if (msgIds.length === 0) return null;

  return (
    <>
      {msgIds.map((id) => {
        const { type, i18nId } = MsgInfo[id];
        const message = t(i18nId, { symbol: sellToken.symbol });

        return (
          <div key={id} className="spot-swap-alert">
            <Alert message={<I18nTrans msg={message} />} type={type} showIcon></Alert>
          </div>
        );
      })}
    </>
  );
};

export default React.memo(SpotSwapAlert);
