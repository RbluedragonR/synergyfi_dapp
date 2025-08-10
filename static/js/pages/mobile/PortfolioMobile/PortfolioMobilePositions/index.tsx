/**
 * @description Component-PortfolioMobilePosiitions
 */
import './index.less';

import { MarketType } from '@synfutures/sdks-perp';
import classNames from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { SocialLossAlert } from '@/components/Alert/SocialLossAlert';
import Empty from '@/components/Empty';
import TokenPair from '@/components/TokenPair';
import { GlobalModalType } from '@/constants';
import { usePositionListByUser } from '@/features/account/positionHook';
import { clickOpenSettledPairModal } from '@/features/portfolio/actions';
import { useAppDispatch } from '@/hooks';
import { usePriceBasisForPnl } from '@/hooks/usePriceBasisForPnl';
import { useChainId, useChainShortName, useUserAddr } from '@/hooks/web3/useChain';
import TradeSide from '@/pages/components/TradeSide';

import { useMockDevTool } from '@/components/Mock';
import { useToggleModal } from '@/features/global/hooks';
import { useIsFetchedPortfolioList } from '@/features/portfolio/hook';
import { useNavigate } from 'react-router-dom';
import PortfolioMobilePositionsSkeleton from './PortfolioMobilePositionsSkeleton';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PortfolioMobilePositions: FC<IPropTypes> = function () {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const positions = usePositionListByUser(chainId, userAddr, false);
  const chainName = useChainShortName(chainId);
  const isFetchedPortfolio = useIsFetchedPortfolioList(chainId, userAddr);
  const { priceBasisForPnl } = usePriceBasisForPnl();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toggleModal = useToggleModal(GlobalModalType.MOBILE_TRADE);
  const { isMockSkeleton } = useMockDevTool();
  return (
    <div className="syn-portfolio-mobile-positions">
      {(isMockSkeleton || (!isFetchedPortfolio && !positions?.length)) && <PortfolioMobilePositionsSkeleton />}
      {!isMockSkeleton &&
        positions?.map((position) => (
          <div
            key={position.id}
            className={classNames(
              'syn-portfolio-mobile-positions-position',
              position.rootInstrument.isNormalInstrument ? '' : 'emergency',
            )}
            onClick={() => {
              if (!position.rootPair.isNormalPair) {
                chainId &&
                  userAddr &&
                  dispatch(clickOpenSettledPairModal({ chainId, userAddr, portfolio: position.rootPortfolio }));
                return;
              }
              toggleModal(true);
              navigate(`/trade/${chainName}/${position.rootPair.symbol}`);
            }}>
            <div className="syn-portfolio-mobile-positions-position-top">
              <div className="syn-portfolio-mobile-positions-position-top-left">
                <TokenPair
                  baseToken={position.rootInstrument.baseToken}
                  quoteToken={position.rootInstrument.quoteToken}
                  instrumentAddr={position.rootInstrument.instrumentAddr}
                  marketType={position.rootInstrument.market.info.type as MarketType}
                  isInverse={position.rootInstrument?.isInverse}
                  isShowExpiryTag={true}
                  showLeverage={true}
                  verticalMode
                  leverage={position.rootPair.maxLeverage}
                  expiry={position.rootPair.expiry}
                  tokenSize={32}
                />
                {!position.rootPair?.isNormalPair && (
                  <>{position.rootInstrument.isNormalInstrument ? <>💰</> : <>🚧 </>}</>
                )}
              </div>
              <TradeSide side={position.wrappedSide} />
            </div>
            <div className="syn-portfolio-mobile-positions-position-bottom">
              <dl>
                <dt>
                  {t('mobile.size')} ({position.rootInstrument.baseToken.symbol})
                </dt>
                <dd>{position.wrapAttribute('size').formatNumberWithTooltip({ isShowTBMK: true })}</dd>
              </dl>
              <dl>
                <dt>{t('mobile.leverage')}</dt>
                <dd>{position.wrapAttribute('leverageWad').formatLeverageWithTooltip()}</dd>
              </dl>
              <dl>
                <dt>
                  {t('mobile.unrealPnl')}
                  {/* ({position.rootInstrument.marginToken.symbol}) */}
                </dt>
                <dd>
                  {position.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl).formatNumberWithTooltip({
                    colorShader: true,
                    showPositive: true,
                  })}
                  {position.equity.gt(0) &&
                    position.getUnrealizedPnlPercentage(priceBasisForPnl).formatPercentage({
                      decimals: 2,
                      suffix: ')',
                      prefix: '(',
                      isHiddenIfZero: true,
                    })}
                </dd>
              </dl>
            </div>
            <SocialLossAlert position={position} isDesktop={false} />
          </div>
        ))}
      {(isMockSkeleton || (isFetchedPortfolio && !positions?.length)) && <Empty type="vertical" />}
    </div>
  );
};

export default PortfolioMobilePositions;
