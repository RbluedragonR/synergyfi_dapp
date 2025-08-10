/**
 * @description Component-TradeMobileHeader
 */
import './index.less';

import classNames from 'classnames';
import React, { FC, useCallback } from 'react';

import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';
import TokenPair from '@/components/TokenPair';
import { useTheme } from '@/features/global/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useChainId, useChainShortName } from '@/hooks/web3/useChain';
import Change24 from '@/pages/components/Change24';

import { PAIR_PAGE_TYPE } from '@/constants/global';
import { useIsFetchedPairInfo } from '@/features/futures/hooks';
import { ReactComponent as IconBack } from '@/pages/mobile/assets/svg/icon_chevron_left_12x24.svg';
import { ReactComponent as EearnChartIcon } from '@/pages/mobile/assets/svg/icon_earn_nav_chart.svg';
import { ReactComponent as EarnChartShowIcon } from '@/pages/mobile/assets/svg/icon_earn_nav_chart_show.svg';
import { ReactComponent as ChartIcon } from '@/pages/mobile/assets/svg/icon_trade_nav_chart.svg';
import { ReactComponent as ChartShowIcon } from '@/pages/mobile/assets/svg/icon_trade_nav_chart_show.svg';
import { useLocalStorageState } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MobileInfoDrawer from './MobileInfoDrawer';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  showChart: boolean;
  toggleShowChart: () => void;
  closeDetail: () => void;
  type?: PAIR_PAGE_TYPE;
}
const MobileSubPageHeader: FC<IPropTypes> = function ({
  toggleShowChart,
  showChart,
  closeDetail,
  type = PAIR_PAGE_TYPE.TRADE,
}) {
  const chainId = useChainId();
  const currentPair = useCurrentPairFromUrl(chainId);
  const isFetchedPair = useIsFetchedPairInfo(
    chainId,
    currentPair?.instrumentAddr,
    currentPair?.expiry,
    type === PAIR_PAGE_TYPE.EARN,
  );
  const [lastFutures, setLastFuturesToStorage] = useLocalStorageState('last_futures', {
    defaultValue: 'trade',
    listenStorageChange: true,
  });

  const { dataTheme } = useTheme();
  const { t } = useTranslation();
  const chainShortName = useChainShortName();
  const navigate = useNavigate();
  const goTo = useCallback(
    (root: string) => {
      setLastFuturesToStorage(root);
      navigate(`/${root}/${chainShortName}/${currentPair?.symbol}`);
    },
    [chainShortName, currentPair?.symbol, navigate, setLastFuturesToStorage],
  );

  return (
    <div className={classNames('syn-mobile-subpage-header', dataTheme)}>
      <div className="syn-mobile-subpage-header-left">
        <Button type="text" icon={<IconBack className="icon" />} onClick={closeDetail} />
        {isFetchedPair && currentPair ? (
          <div className="syn-mobile-subpage-header-left-right">
            <TokenPair
              isShowLogo={false}
              baseToken={currentPair?.rootInstrument.baseToken}
              quoteToken={currentPair?.rootInstrument.quoteToken}
              isInverse={currentPair?.rootInstrument.isInverse || false}
              expiry={currentPair?.expiry}
              showShortPerp={true}
              verticalMode={true}
              leverage={currentPair.maxLeverage}
              showLeverage={true}
              tagExtra={
                <>
                  {type === PAIR_PAGE_TYPE.TRADE ? (
                    <Change24
                      instrumentAddr={currentPair?.instrumentAddr}
                      expiry={currentPair?.expiry}
                      chainId={chainId}
                    />
                  ) : (
                    currentPair.stats?.liquidityApy?.formatPercentage({ colorShader: false })
                  )}
                </>
              }
            />
          </div>
        ) : (
          <Skeleton className="syn-mobile-subpage-header-left-right" active={true} paragraph={false} />
        )}
      </div>
      <div className="syn-mobile-subpage-header-right">
        <Button
          type="text"
          onClick={toggleShowChart}
          icon={
            showChart ? (
              type === PAIR_PAGE_TYPE.TRADE ? (
                <ChartIcon className="icon" />
              ) : (
                <EearnChartIcon className="icon" />
              )
            ) : type === PAIR_PAGE_TYPE.TRADE ? (
              <ChartShowIcon className="icon" />
            ) : (
              <EarnChartShowIcon className="icon" />
            )
          }
        />
        <MobileInfoDrawer type={type} />
        {lastFutures === 'earn' ? (
          <Button className="nav trade" onClick={() => goTo('trade')}>
            {t('mobile.trade')}
          </Button>
        ) : (
          <Button className="nav liq" onClick={() => goTo('earn')}>
            {t('mobile.liquidity')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileSubPageHeader;
