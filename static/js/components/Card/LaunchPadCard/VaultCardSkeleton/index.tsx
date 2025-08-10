/**
 * @description Component-VaultCardSkeleton
 */
import { Input, Skeleton } from 'antd';
import './index.less';

import { Button } from '@/components/Button';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const VaultCardSkeleton: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  return (
    <div className="syn-vault-card-skeleton syn-launch-pad-card">
      <div className="syn-vault-card-skeleton-top">
        <Skeleton.Avatar size={48} shape="circle" active />
        <div className="syn-vault-card-skeleton-top-right">
          <div className="syn-vault-card-skeleton-top-right-top">
            <Skeleton style={{ height: 24, width: 106 }} paragraph={false} active />
            <Skeleton.Avatar size={16} shape="circle" active />
            <Skeleton style={{ height: 20, width: 40 }} paragraph={false} active />
          </div>
          <Skeleton title={{ style: { height: 16 } }} style={{ height: 16, width: 180 }} paragraph={false} active />
        </div>
      </div>
      <div className="syn-vault-card-skeleton-middle">
        <div className="syn-vault-card-skeleton-middle-row">
          <Skeleton
            title={{
              style: {
                height: 16,
                width: 121,
              },
            }}
            paragraph={false}
            active
          />
          <Skeleton
            title={{
              style: {
                height: 16,
                width: 155,
              },
            }}
            paragraph={false}
            active
          />
        </div>
        <div className="syn-vault-card-skeleton-middle-row">
          <Skeleton
            title={{
              style: {
                height: 16,
                width: 73,
              },
            }}
            paragraph={false}
            active
          />
          <Skeleton
            title={{
              style: {
                height: 16,
                width: 155,
              },
            }}
            paragraph={false}
            active
          />
        </div>
        <div className="syn-vault-card-skeleton-middle-row">
          <Skeleton
            title={{
              style: {
                height: 20,
                width: 175,
              },
            }}
            paragraph={false}
            active
          />
          <Skeleton
            title={{
              style: {
                height: 16,
                width: 51,
              },
            }}
            paragraph={false}
            active
          />
        </div>
      </div>
      <div className="syn-vault-card-skeleton-divider" />
      <div className="syn-vault-card-skeleton-bottom">
        <div className="syn-vault-card-skeleton-bottom-top">
          <Skeleton title={{ style: { height: 20, width: 61 } }} paragraph={false} active />
          <Skeleton title={{ style: { height: 20, width: 71 } }} paragraph={false} active />
        </div>
        <div className="syn-vault-card-skeleton-bottom-middle">
          <Skeleton title={{ style: { height: 20, width: 61 } }} paragraph={false} active />
          <Input placeholder="0.0" />
        </div>
        <div className="syn-vault-card-skeleton-bottom-bottom">
          <Skeleton title={{ style: { height: 20, width: 188 } }} paragraph={false} active />
          <Skeleton title={{ style: { height: 20, width: 113 } }} paragraph={false} active />
        </div>
        <Button type="primary">{t('launchpad.deposit')}</Button>
      </div>
    </div>
  );
};

export default VaultCardSkeleton;
