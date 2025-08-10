/**
 * @description Component-HistoryRefreshSimple
 */
import './index.less';

import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CloseIcon } from '@/assets/svg/icon_close_24.svg';
import { Button } from '@/components/Button';
import { HIDE_REFRESH_HISTORY_DATA } from '@/constants/storage';

interface IPropTypes {
  className?: string;
  onMessageClose: (closed: true) => void;
}
const HistoryRefreshSimple: FC<IPropTypes> = function ({ onMessageClose }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const hideRefresh = localStorage.getItem(HIDE_REFRESH_HISTORY_DATA);
  useEffect(() => {
    if (hideRefresh) {
      onMessageClose(true);
    }
  }, [hideRefresh, onMessageClose]);

  if (!open || hideRefresh) {
    return null;
  }
  return (
    <div className="syn-history-refresh-simple">
      <div className="syn-history-refresh-simple-line">
        <span>💡</span>
        {t('common.historyC.refreshLine')}
      </div>
      <Button
        onClick={() => {
          setOpen(false);
          localStorage.setItem(HIDE_REFRESH_HISTORY_DATA, 'true');
          onMessageClose(true);
        }}
        icon={<CloseIcon />}
        className={'syn-history-refresh-simple-btn'}
        type="text"
      />
    </div>
  );
};

export default HistoryRefreshSimple;
