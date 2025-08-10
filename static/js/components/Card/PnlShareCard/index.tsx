import { useMediaQueryDevice } from '@/components/MediaQuery';
import useTradePositionNode from '@/hooks/trade/useTradePositionNode';
import { useChainId } from '@/hooks/web3/useChain';

import { TimeIcon } from '@/assets/svg';
import { getIconPath, getPnlLevel, getTokenImgPath, OptionId } from '@/utils/trade/pnlShare';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import logoSrc from './asset/logo_light.svg';
import './index.less';

export default function PnlShareCard({
  optionStatus,
  isExport = false,
}: {
  isExport?: boolean;
  optionStatus: { [id in OptionId]: boolean };
}) {
  const chainId = useChainId();
  const { t } = useTranslation();
  const { isNotMobile } = useMediaQueryDevice();
  const {
    tradePositionNode: {
      side,
      tokenPairNode,
      leverageNode,
      averagePriceNode,
      pnlQuoteValueNode,
      pnlPercentNode,
      markPriceNode,
      isNotification,
      tradePrice,
      qouteToken,
      pnlRatio,
    },
  } = useTradePositionNode();
  const color = (side === 'SHORT' && '#F66') || (side === 'LONG' && '#14B84B') || 'white';
  const pnlLevel = getPnlLevel(pnlRatio);
  const { bodySrc, tokenSrc } = getTokenImgPath(qouteToken?.symbol || 'default', pnlLevel);
  return (
    <div className={classNames('syn-psc', { default: isNotMobile || isExport })}>
      <div className="syn-psc-top">
        <div className="syn-psc-header">
          <img className="header-logo" src={logoSrc} />
          {chainId && <img className="header-chain" src={getIconPath(chainId)} />}
        </div>
        <div className="position">
          <span style={{ color }} className="direction">
            {_.get(
              {
                SHORT: 'Short',
                LONG: 'Long',
              },
              [side || ''],
            )}
          </span>
          {optionStatus.leverage && <span className="margin">{leverageNode}</span>}
          <span className="pair">{tokenPairNode}</span>
        </div>
      </div>
      <div className="syn-psc-content-wrapper">
        <div className="syn-psc-content-shadow" />
        <div className="syn-psc-content">
          <div className="pnl">
            {pnlPercentNode}
            {optionStatus.pnlAmount && <span className="in-token">{pnlQuoteValueNode}</span>}
          </div>
          {optionStatus.price && (
            <div className="prices">
              <span className="price">
                {t('common.avgP')}: <span className="number">{averagePriceNode}</span>
              </span>
              {isNotification ? (
                <span className="price">
                  {t('common.tradePrice')}: <span className="number">{tradePrice?.formatPriceNumberWithTooltip()}</span>
                </span>
              ) : (
                <span className="price">
                  {t('common.markP')}: <span className="number">{markPriceNode}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="syn-psc-footer">
        <TimeIcon />
        {moment(Date.now()).format('HH:mm:ss MMM Do, YYYY')}
      </div>
      <img className="syn-psc-token-img" src={bodySrc} />
      <img className="syn-psc-token-img" src={tokenSrc} />
    </div>
  );
}
