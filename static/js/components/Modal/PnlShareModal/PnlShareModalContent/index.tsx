import { Button } from '@/components/Button';
import PnlShareCard from '@/components/Card/PnlShareCard';
import Checkbox from '@/components/Checkbox';
import CopySrc from '../asset/copy_icon.svg';
import DownloadSrc from '../asset/download_icon.svg';
import LinkSrc from '../asset/tweet_icon.svg';
import './index.less';

import { Tooltip } from 'antd';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { CHAIN_ID } from '@/constants/chain';
import { useChainId } from '@/hooks/web3/useChain';
import classNames from 'classnames';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import usePnlSharePanel, { optionInfos } from '../../../../hooks/trade/usePnlSharePanel';

export default function PnlShareModalContent({ pnlStorageKey }: { pnlStorageKey: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const chainId = useChainId();
  const { isMobile } = useMediaQueryDevice();
  const farcasterSupported = chainId === CHAIN_ID.BASE;
  const {
    handleClickDownload,
    handleCopy,
    toggleOption,
    optionStatus,
    handleTweet,
    btnStatus,
    btnMessage,
    handleFarcaster,
    shareLink,
  } = usePnlSharePanel({ cardRef, storageKey: pnlStorageKey });
  return (
    <div className="syn-psmc">
      <PnlShareCard optionStatus={optionStatus} />
      {/* // This is for export image */}
      <div ref={cardRef} style={{ position: 'absolute', top: -1000000, display: 'flex' }}>
        <PnlShareCard optionStatus={optionStatus} isExport />
      </div>
      <div className="syn-psmc-panel">
        <div className="syn-psmc-panel-title">{t('common.pnlShareModal.optionShare')}</div>
        <div className="syn-psmc-panel-options">
          {optionInfos.map((info) => (
            <div key={info.optionId} className="syn-psmc-panel-option">
              <Checkbox
                checked={optionStatus[info.optionId]}
                onChange={() => {
                  toggleOption(info.optionId);
                }}>
                <span>{t(info.i18nId)}</span>
              </Checkbox>
            </div>
          ))}
        </div>
        <div className={classNames('syn-psmc-panel-btns', farcasterSupported && 'farcaster-supported')}>
          <Tooltip title={btnMessage.copy} open={btnMessage.copy !== null} overlayStyle={{ zIndex: 10000 }}>
            <Button
              loading={btnStatus.copy === 'loading'}
              onClick={() => handleCopy()}
              id="copy"
              type="primary"
              suffixNode={<img src={CopySrc} />}>
              {t('common.pnlShareModal.copy')}
            </Button>
          </Tooltip>

          <Tooltip title={btnMessage.download} open={btnMessage.download !== null} overlayStyle={{ zIndex: 10000 }}>
            <Button
              loading={btnStatus.download === 'loading'}
              id="download"
              onClick={() => handleClickDownload()}
              type="primary"
              suffixNode={<img src={DownloadSrc} />}>
              {t('common.download')}
            </Button>
          </Tooltip>

          <Tooltip title={btnMessage.tweet} open={btnMessage.tweet !== null} overlayStyle={{ zIndex: 10000 }}>
            <Button
              loading={btnStatus.tweet === 'loading'}
              onClick={() => handleTweet()}
              id="tweet"
              type="primary"
              suffixNode={<img src={LinkSrc} />}>
              {t('common.tweet')}
            </Button>
          </Tooltip>
          {farcasterSupported && (
            <Tooltip title={btnMessage.farcaster} open={btnMessage.farcaster !== null}>
              {shareLink ? (
                <a
                  id="farcaster"
                  className={classNames(`syn-btn`, `syn-btn-primary`, isMobile && 'mobile')}
                  href={shareLink}
                  target="_blank"
                  rel="noreferrer">
                  <span>{t('common.farcaster')}</span>
                  <span className="syn-btn-suffix">
                    <img src={LinkSrc} />
                  </span>
                </a>
              ) : (
                <Button
                  loading={btnStatus.farcaster === 'loading' || !shareLink}
                  onClick={() => handleFarcaster()}
                  id="farcaster"
                  type="primary"
                  suffixNode={<img src={LinkSrc} />}>
                  {t('common.farcaster')}
                </Button>
              )}
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
