import 'react-toastify/dist/ReactToastify.css';

import './i18n';
import './initSettings';
import './themes/index.less';

import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import ProviderWrapper from './ProviderWrapper';
// import IntercomProviderWrapper from './components/IntercomProviderWrapper';
// const IntercomProviderWrapper = React.lazy(() => import('./components/IntercomProviderWrapper'));

export default function main(App: () => JSX.Element): void {
  const container = document.getElementById('root');

  if (container) {
    const root = createRoot(container);
    root.render(
      <div>
        <Suspense fallback="">
          {/* <IntercomProviderWrapper> */}
          <ProviderWrapper>
            <App />
          </ProviderWrapper>
          {/* </IntercomProviderWrapper> */}
        </Suspense>
      </div>,
    );
  }
}
