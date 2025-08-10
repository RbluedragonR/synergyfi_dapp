import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { notification } from 'antd';
import React, { Suspense, useEffect, useMemo } from 'react';
import { hot } from 'react-hot-loader/root';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import ErrorBoundary from '@/components/ErrorBoundary';
import Loading from '@/components/Loading';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { useUserAddr } from '@/hooks/web3/useChain';
import LayoutComponent from '@/layout';
import PageLayout from '@/layout/PageLayout';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import spindl from '@spindl-xyz/attribution';
import { QueryClient } from '@tanstack/react-query';
import { useTitle } from 'ahooks';
import GlobalComponent from './GlobalComponent';
import GlobalEffect from './GlobalEffect';
import { RouteBasePath, mobileRouters, routers } from './routers';

const defaultUrl = '/market';
const defaultUrlMobile = '/market';
notification.config({
  bottom: 88,
});
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: process.env.REACT_APP_API_ENV === 'dev' ? 0 : 3,
      retryDelay: 1000,
      // would refresh unless polling or invalidate
      staleTime: Infinity,
      // cache the data forever
      gcTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
});
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});
// eslint-disable-next-line react/display-name, @typescript-eslint/no-explicit-any
const blockerWrap = (Component: React.ComponentType<any>) => (props: any) => {
  const location = useLocation();
  const { isMobile } = useMediaQueryDevice();
  const currentRoute = useMemo(() => location.pathname, [location.pathname]);
  const isShowBlocker = useMemo(() => {
    return isMobile && currentRoute === '/blocker';
  }, [currentRoute, isMobile]);
  return isShowBlocker ? <div {...props}></div> : <Component {...props} />;
};

const WrappedLayoutComponent = blockerWrap(LayoutComponent);

function App(): JSX.Element {
  const { deviceType, isMobile } = useMediaQueryDevice();
  useEffect(() => {
    window.document.documentElement.className = deviceType;
  }, [deviceType]);
  const NavigateToDefaultPage = useMemo(() => {
    return <Navigate to={defaultUrl} />;
  }, []);
  const NavigateToDefaultPageMobile = useMemo(() => {
    return <Navigate to={defaultUrlMobile} />;
  }, []);

  useEffect(() => {
    // adapt mobile height
    const documentHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty('--doc-height', `${window.innerHeight}px`);
      doc.style.setProperty('--doc-width', `${window.innerWidth}px`);
    };
    window.addEventListener('resize', documentHeight);
    documentHeight();
  }, []);

  const location = useLocation();
  useEffect(() => {
    const layers = location.pathname.split('/').length;
    if (layers > 2) {
      document.body.classList.add('second-layer');
    } else {
      document.body.classList.remove('second-layer');
    }
  }, [location.pathname]);
  const userAddr = useUserAddr();
  useEffect(() => {
    if (userAddr) {
      gtag('event', 'connect_wallet_address', {
        address: `@${userAddr}`,
      });
      spindl.attribute(userAddr);
    }
  }, [userAddr]);

  useTitle('SynFutures');

  return (
    <div className={`App ${deviceType}`}>
      <WrappedLayoutComponent>
        <ErrorBoundary>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
              persister: localStoragePersister,
              maxAge: Infinity,
              dehydrateOptions: {
                shouldDehydrateQuery: (query) => {
                  return ((query.meta?.isPersist || false) as boolean) && query.state.status === 'success';
                },
              },
            }}>
            {/* <DevTool /> */}
            <Suspense
              fallback={
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
                  <Loading spinning size="large" />
                </div>
              }>
              <GlobalEffect></GlobalEffect>
              <GlobalComponent></GlobalComponent>
              <Routes>
                <Route>
                  {isMobile ? (
                    <Route path="/" element={<PageLayout />}>
                      {mobileRouters.map((item, i) => {
                        return <Route key={i} path={item.path} element={item.element} />;
                      })}
                      <Route path="tgp" element={<Navigate to={'/blocker'} />}></Route>
                      <Route path={RouteBasePath.launchpad} element={<Navigate to={'/blocker'} />}></Route>
                      <Route path="odyssey" element={<Navigate to={'/blocker'} />}></Route>
                      <Route path="odyssey/:referralCode" element={<Navigate to={'/blocker'} />}></Route>
                      <Route path="" element={NavigateToDefaultPageMobile}></Route>
                    </Route>
                  ) : (
                    <Route path="/" element={<PageLayout />}>
                      {routers.map((item, i) => {
                        return <Route key={i} path={item.path} element={item.element} />;
                      })}
                      <Route path="" element={NavigateToDefaultPage}></Route>
                    </Route>
                  )}
                  <Route path="*" element={isMobile ? NavigateToDefaultPageMobile : NavigateToDefaultPage} />
                </Route>
              </Routes>
            </Suspense>
            <ReactQueryDevtools initialIsOpen={true} position="bottom" buttonPosition="bottom-left" />
          </PersistQueryClientProvider>
        </ErrorBoundary>
      </WrappedLayoutComponent>
    </div>
  );
}

export default hot(App);
