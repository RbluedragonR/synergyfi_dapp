import { useMediaQueryDevice } from '@/components/MediaQuery';
import { TabType } from '@/constants';
import { setTabType } from '@/features/global/actions';
import { getSpotLink } from '@/features/spot/hooks';
import { useSpotState } from '@/features/spot/store';
import { useAppDispatch } from '@/hooks';
import { getAffiliatesLink } from '@/hooks/affiliates/useAffiliatesRouter';
import { useGa } from '@/hooks/useGa';
import { getIsPageSupported } from '@/hooks/usePageSupported';
import { getVaultLink } from '@/hooks/vault/useVaultRouter';
import { useChainId, useChainShortName } from '@/hooks/web3/useChain';
import { RouteBasePath } from '@/pages/routers';
import { GaCategory } from '@/utils/analytics';
import { useLocalStorageState } from 'ahooks';
import classNames from 'classnames';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import './Menu.less';
import rocket from './assets/rocket.svg';
import HeaderMenuDropdown from './headerMenuDropdown/HeaderMenuDropdown';

export default function HeaderMenu(): JSX.Element {
  const { deviceType } = useMediaQueryDevice();
  const location = useLocation();
  const chainId = useChainId();
  const dispatch = useAppDispatch();
  const gaEvent = useGa();
  const { token0, token1 } = useSpotState();

  const [menuType, setMenuType] = useState('');
  const { t } = useTranslation();
  // const ooDappConfig = useOdysseyDappConfig();
  const [lastFutures] = useLocalStorageState('last_futures', { defaultValue: 'trade', listenStorageChange: true });
  const onMenuClick = useCallback(
    (menuKey: string, isExternalLink?: boolean) => {
      document.getElementById('pageLayout')?.scroll({ top: 0 });
      !isExternalLink && setMenuType(menuKey);
    },
    [setMenuType],
  );

  useEffect(() => {
    const urlType = _.get(location.pathname.split('/'), [1]) || '';
    if (urlType === 'trade' || urlType === 'earn') {
      setMenuType('futures');
    } else {
      setMenuType(urlType);
    }
    if (Object.values(TabType).includes(urlType as TabType)) {
      dispatch(setTabType({ type: urlType as TabType }));
    }
  }, [dispatch, location.pathname]);

  const chainShortName = useChainShortName();

  return (
    <>
      <ul className={`header-menu ${deviceType}`}>
        <li>
          <Link
            className={classNames('header-item', menuType === 'market' && 'header-item-selected')}
            to={`/market`}
            onClick={() => {
              onMenuClick('market');
              gaEvent({ category: GaCategory.HEADER, action: 'Menu-Click on market' });
            }}>
            <span>{t('header.menu.Market')}</span>
          </Link>
        </li>
        <li>
          <Link
            className={classNames('header-item', menuType === 'futures' && 'header-item-selected')}
            to={`${lastFutures === 'earn' ? '/earn' : `/trade`}/${chainShortName}`}
            onClick={() => {
              onMenuClick('futures');
              gtag('event', 'enter_futures', {
                entrance: 'nav_bar', // link, nav_bar, market, portfolio, odyssey_place_limit_order
              });
            }}>
            <span>{t('header.menu.Futures')}</span>
          </Link>
        </li>
        {chainId && getIsPageSupported(chainId, RouteBasePath.spot) && (
          <li>
            <Link
              style={{ position: 'relative' }}
              className={classNames('header-item', 'spot-item', menuType === 'spot' && 'header-item-selected')}
              to={getSpotLink({ chainId, buySymbolOrAddr: token1?.symbol, sellSymbolOrAddr: token0?.symbol })}
              onClick={() => {
                onMenuClick('spot');
                gaEvent({ category: GaCategory.HEADER, action: 'Menu-Click on spot' });
              }}>
              <span>{t('header.menu.spot')}</span>
              <img src={rocket} alt="rocket" style={{ position: 'absolute' }} />
            </Link>
          </li>
        )}
        <li>
          <Link
            className={classNames('header-item', menuType === 'portfolio' && 'header-item-selected')}
            to={`/portfolio`}
            onClick={() => {
              onMenuClick('portfolio');
              gaEvent({ category: GaCategory.HEADER, action: 'Menu-Click on Portfolio' });
            }}>
            <span>{t('header.menu.Portfolio')}</span>
          </Link>
        </li>
        {process.env.REACT_APP_HIDE_VAULT !== 'true' &&
          chainId &&
          getIsPageSupported(chainId, RouteBasePath.launchpad) && (
            <li>
              <Link
                className={classNames('header-item', menuType === RouteBasePath.launchpad && 'header-item-selected')}
                to={getVaultLink({ chainId })}
                onClick={() => {
                  onMenuClick(RouteBasePath.launchpad);
                  gaEvent({ category: GaCategory.HEADER, action: 'Menu-Click on Launchpad' });
                }}>
                <span>{t('launchpad.launchpadMenu')}</span>
              </Link>
            </li>
          )}

        {process?.env?.REACT_APP_AWS_ENV !== 'prod' &&
          chainId &&
          getIsPageSupported(chainId, RouteBasePath.referral) && (
            <li>
              <Link
                className={classNames('header-item', menuType === RouteBasePath.referral && 'header-item-selected')}
                to={getAffiliatesLink({ chainId })}
                onClick={() => {
                  onMenuClick(RouteBasePath.referral);
                  gaEvent({ category: GaCategory.HEADER, action: 'Menu-Click on Affiliates' });
                }}>
                <span>{t('affiliates.affiliatesMenu')} 🔥</span>
              </Link>
            </li>
          )}

        {/* {chainId && ooDappConfig.supportChains.includes(chainId) && (
          <li>
            <Link
              className={classNames('header-item', menuType === 'odyssey' && 'header-item-selected')}
              to={`/odyssey`}
              onClick={() => {
                onMenuClick('odyssey');
                gtag('event', 'enter_odyssey', {
                  entrance: 'nav_bar',
                });
              }}>
              <span>{t('header.menu.odyssey')}</span> <RewardsIcon />
            </Link>
          </li>
        )} */}
        <li>
          <Link
            className={classNames('header-item', menuType === 'campaign' && 'header-item-selected')}
            to={`/campaign`}
            onClick={() => {
              onMenuClick('campaign');
              gaEvent({ category: GaCategory.HEADER, action: 'Menu-Click on Portfolio' });
            }}>
            <span>{t('common.campaign')}</span>
          </Link>
        </li>
        <li>
          <HeaderMenuDropdown />
        </li>
      </ul>
    </>
  );
}
