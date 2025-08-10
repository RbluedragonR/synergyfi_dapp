/**
 * @description Component-ClearCacheBtn
 */
import './index.less';

import { useDebounceFn } from 'ahooks';
import classNames from 'classnames';
import localforage from 'localforage';
import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { Button } from '@/components/Button';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { Tooltip } from '@/components/ToolTip';
import { useLoginInOrOutPrivyWallet } from '@/connectors/privy/usePrivyWallet';
import { queryClient } from '@/connectors/wagmi/config';
import { mockNotiDontClose } from '@/constants/mock';
import { useWagmiDisconnect } from '@/hooks/web3/useWagami';
import { IButtonProps } from '@/types/button';
const ClearCacheBtn: FC<IButtonProps> = function (props) {
  const [isCleared, setIsCleared] = useState(false);
  const { t } = useTranslation();
  const { deviceType } = useMediaQueryDevice();
  const disconnect = useWagmiDisconnect();
  const { logout } = useLoginInOrOutPrivyWallet();

  const deleteAllCookies = useCallback(() => {
    if (document?.cookie) {
      const cookies = document.cookie.split(';');

      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  }, []);
  const { run: onClickClearCache } = useDebounceFn(
    async () => {
      try {
        queryClient.clear();
        deleteAllCookies();
        localStorage.clear();
        await localforage.clear();
        disconnect();
        logout();

        setIsCleared(true);

        toast.info(
          <div className="syn-notification-content">
            <div className="syn-notification-content-title">{t('modal.userAddrModal.clearCacheBtn.title')}</div>
          </div>,
          {
            autoClose: mockNotiDontClose ? false : 2000,
            className: classNames(deviceType, 'syn-notification-toaster'),
          },
        );
        setTimeout(() => {
          setIsCleared(false);
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('🚀 ~ file: GlobalConfig.tsx ~ line 94 ~ onClickClearCache ~ error', error);
      }
    },
    { wait: 500 },
  );
  return (
    <Tooltip
      open={isCleared}
      title={
        isCleared ? t('modal.userAddrModal.clearCacheBtn.title') : ''
        //   : 'Clearing will remove cookies, localStorage, indexedDB, and other browsing data.'
      }>
      <Button
        type="link"
        {...props}
        onClick={onClickClearCache}
        className={classNames(props.className, ['clear-cache-btn'])}>
        {t('modal.userAddrModal.clearCacheBtn.clCache')}
      </Button>
    </Tooltip>
  );
};

export default ClearCacheBtn;
