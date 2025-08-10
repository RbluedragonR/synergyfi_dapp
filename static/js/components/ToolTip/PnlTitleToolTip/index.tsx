import './index.less';

import { Checkbox } from 'antd';
import { Trans, useTranslation } from 'react-i18next';

import { PriceBasisForPnl, priceBasisForPnlInfos } from '@/constants/trade/priceBasisForPnl';
import { usePriceBasisForPnl } from '@/hooks/usePriceBasisForPnl';

import UnderlineToolTip from '../UnderlineToolTip';
export default function PnlTitleToolTip(): JSX.Element {
  const { t } = useTranslation();
  const { onClickPriceBasisCheckbox, priceBasisForPnl } = usePriceBasisForPnl();
  return (
    <UnderlineToolTip
      overlayClassName="syn-pnl-title-tooltip"
      title={
        <>
          <div className="syn-pnl-title-tooltip-top">
            <div className="syn-pnl-title-tooltip-top-title">
              {t('common.tradePage.tradePosition.selectPriceBasis')}
            </div>
            {Object.values(PriceBasisForPnl).map((thisPriceBasisForPnl, key) => (
              <div className="syn-pnl-title-tooltip-top-checkbox" key={`${thisPriceBasisForPnl}_${key}`}>
                <Checkbox
                  onClick={() => {
                    onClickPriceBasisCheckbox(thisPriceBasisForPnl);
                  }}
                  checked={priceBasisForPnl === thisPriceBasisForPnl}
                />
                {t(priceBasisForPnlInfos[thisPriceBasisForPnl].i18nId)}
              </div>
            ))}
          </div>

          <Trans i18nKey={'common.tradePage.tradePosition.unRealizedPnlTooltip'} components={{ b: <b /> }} />
        </>
      }>
      {t('common.unrealizedPl')}
    </UnderlineToolTip>
  );
}
