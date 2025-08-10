import { ConfigProvider } from 'antd';
import { useMemo } from 'react';

import Empty from '@/components/Empty';
import { THEME_ENUM } from '@/constants';
import { useTheme } from '@/features/global/hooks';

export default function AntDConfigProvider({ children }: { children: JSX.Element }): JSX.Element {
  const { dataTheme } = useTheme();
  const colorBgElevated = useMemo(() => (dataTheme === THEME_ENUM.DARK ? '#061c2d' : '#fff'), [dataTheme]);
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#29b5bc',
          colorLinkHover: '#29b5bc',
          colorLinkActive: '#29b5bc',

          fontFamily: `Ubuntu, 'Roboto', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
        },
        components: {
          Segmented: {
            colorBgElevated,
          },
          Button: {
            colorPrimary: '#29b5bc',
          },
        },
      }}
      wave={{ disabled: true }}
      renderEmpty={() => <Empty></Empty>}>
      {children}
    </ConfigProvider>
  );
}
