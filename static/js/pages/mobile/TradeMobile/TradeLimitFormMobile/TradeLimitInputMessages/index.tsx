/**
 * @description Component-TradeLimitInputMessages
 */
import './index.less';

import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Alert from '@/components/Alert';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useLimitFormState } from '@/features/trade/hooks';
import { useChainId } from '@/hooks/web3/useChain';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  inputTouched?: boolean;
  inputTouchedChange: (entering: boolean) => void;
}
const TradeLimitInputMessages: FC<IPropTypes> = function ({ inputTouched }) {
  const chainId = useChainId();
  const { t } = useTranslation();
  const limitFormState = useLimitFormState(chainId);

  return (
    <div className="syn-trade-limit-input-messages">
      {inputTouched &&
        WrappedBigNumber.from(limitFormState.alignedPrice || 0)?.notEq(limitFormState.limitPrice || 0) && (
          <Alert
            message={
              <div className="syn-trade-limit-input-messages-alert">
                <Trans
                  t={t}
                  i18nKey={'common.tradePage.limitSub'}
                  components={{ b: <b /> }}
                  values={{ price: limitFormState.alignedPrice }}
                />
              </div>
            }
            type="info"
            showIcon
          />
        )}
    </div>
  );
};

export default TradeLimitInputMessages;
