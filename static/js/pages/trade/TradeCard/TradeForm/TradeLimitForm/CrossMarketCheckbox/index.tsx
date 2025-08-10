/**
 * @description Component-CrossMarketCheckbox
 */
import Checkbox from '@/components/Checkbox';
import './index.less';

import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { CHAIN_ID } from '@/constants/chain';
import { setIsTurnOnCrossMarket } from '@/features/trade/actions';
import { useLimitFormState } from '@/features/trade/hooks';
import { useAppDispatch } from '@/hooks';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  chainId: CHAIN_ID | undefined;
}
const CrossMarketCheckbox: FC<IPropTypes> = function ({ chainId }) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const limitState = useLimitFormState(chainId);

  return (
    <Checkbox
      className="syn-cross-market-checkbox"
      checked={limitState.isTurnOnCrossMarket}
      onChange={(e) => {
        const checked = e.target.checked;
        chainId && dispatch(setIsTurnOnCrossMarket({ chainId, isTurnOnCrossMarket: checked }));
      }}>
      <UnderlineToolTip title={t('tooltip.tradePage.crossMarketCheckbox')}>
        <span className="syn-cross-market-checkbox-text">{t('common.tradePage.allowCrossMarket')}</span>
      </UnderlineToolTip>
    </Checkbox>
  );
};

export default CrossMarketCheckbox;
