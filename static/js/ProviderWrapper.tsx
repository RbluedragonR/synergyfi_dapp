import { configureStore } from '@reduxjs/toolkit';
import { deviceType } from 'react-device-detect';
// import { save, load } from 'redux-localstorage-simple';
import { Provider as ReduxProvider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { CloseButton, IconLoading, IconNotificationError, IconNotificationSuccess } from '@/components/Notification';
import ActiveConnectorManager from '@/connectors/ActiveConnectorManager';

// import ActiveConnectorManager from '@/connectors/ActiveConnectorManager';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClientProvider } from '@tanstack/react-query';

import { WagmiProvider } from 'wagmi';
import { privyAppId, privyConfig } from './connectors/privy';
import { queryClient, wagmiConfig } from './connectors/wagmi/config';
import { store, storeReducer } from './features/store';
import { useDappChainConfig } from './hooks/web3/useChain';
import AntDConfigProvider from './layout/AntDConfigProvider';

// eslint-disable-next-line @typescript-eslint/no-explicit-any

const WrappedToastContainer = () => {
  const config = useDappChainConfig();
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      draggable={false}
      pauseOnHover={false}
      theme="light"
      closeButton={CloseButton}
      toastClassName={deviceType}
      icon={({ type }) => {
        const iconElement: JSX.Element = (type === 'success' && <IconNotificationSuccess />) ||
          (type === 'error' && <IconNotificationError />) ||
          (type === 'info' && <IconLoading />) || <IconLoading />;

        return (
          <div style={{ position: 'relative' }}>
            <img
              style={{ position: 'absolute', right: '-4px', bottom: '-4px', zIndex: 10 }}
              src={config?.network.icon}
            />
            {iconElement}
          </div>
        );
      }}
    />
  );
};
export function StoreProviderWrapper({
  children,
  reduxStore = store,
}: {
  children: JSX.Element;
  reduxStore?: typeof store;
}): JSX.Element {
  reduxStore = { ...store, ...reduxStore };
  return (
    <ReduxProvider store={reduxStore}>
      <AntDConfigProvider>
        <PrivyProvider appId={privyAppId} config={privyConfig}>
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              {/* 4. Wrap app in PersistQueryClientProvider */}
              {/* Your App */}
              <WrappedToastContainer />

              <ActiveConnectorManager>
                <HashRouter>{children}</HashRouter>
              </ActiveConnectorManager>
              {/* </QueryClientProvider> */}
            </QueryClientProvider>
          </WagmiProvider>
        </PrivyProvider>
      </AntDConfigProvider>
    </ReduxProvider>
  );
}

export default function ProviderWrapper({
  children,
  reducer = storeReducer,
}: {
  children: JSX.Element;
  reducer?: Partial<typeof storeReducer>;
}): JSX.Element {
  const sReducer = { ...storeReducer, ...reducer };
  const store = configureStore({
    reducer: sReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
    //     .concat(save({ states: PERSISTED_KEYS })),
    // preloadedState: load({ states: PERSISTED_KEYS, disableWarnings: true }),
  });
  return StoreProviderWrapper({ children, reduxStore: store });
}

export function getProviderWrapper(reducer?: Partial<typeof storeReducer>) {
  // eslint-disable-next-line react/display-name, @typescript-eslint/explicit-module-boundary-types
  return ({ children }: { children: JSX.Element }) => <ProviderWrapper reducer={reducer}>{children}</ProviderWrapper>;
}
