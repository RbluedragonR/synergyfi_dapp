/**
 * @description Component-OrderBookSkeleton
 */
import './index.less';

import classNames from 'classnames';
import React, { FC, useMemo } from 'react';

import Loading from '@/components/Loading';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { Skeleton } from '@/components/Skeleton';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  isLoading: boolean;
}
const OrderBookSkeleton: FC<IPropTypes> = function ({ children, isLoading }) {
  const { isMobile } = useMediaQueryDevice();
  const sellData = useMemo(() => {
    return new Array(isMobile ? 5 : 8).fill(undefined).map((_, index) => `sell_${index}`);
  }, [isMobile]);

  const buyData = useMemo(() => {
    return new Array(isMobile ? 5 : 8).fill(undefined).map((_, index) => `buy_${index}`);
  }, [isMobile]);

  if (!isLoading) {
    return <>{children}</>;
  }
  return (
    <div className="syn-order-book-skeleton">
      {isLoading && <Loading size="large" spinning={true} />}

      <div className="syn-order-book-body">
        <div className="syn-order-book-table syn-order-book-table_sell">
          {sellData.map((key) => (
            <div className="syn-order-book-item" key={key}>
              <div className="syn-order-book-item_price">
                <Skeleton active={true} title={false} paragraph={{ rows: 1 }} />
              </div>
              <div className="syn-order-book-item_size">
                <Skeleton active={true} title={false} paragraph={{ rows: 1 }} />
              </div>
              <div className="syn-order-book-item_sum">
                <Skeleton active={true} title={false} paragraph={{ rows: 1 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="syn-order-book-price-wrap">
          <div className={classNames('syn-order-book-price')}>
            <Skeleton active={true} title={false} paragraph={{ rows: 1 }} />
          </div>
          {!isMobile && (
            <div className="syn-order-book-price-secondary">
              <Skeleton active={true} title={false} paragraph={{ rows: 1 }} />
            </div>
          )}
        </div>
        <div className="syn-order-book-table syn-order-book-table_buy">
          {buyData.map((key) => (
            <div className="syn-order-book-item" key={key}>
              <div className="syn-order-book-item_price">
                <Skeleton active={true} title={false} paragraph={{ rows: 1 }} />
              </div>
              <div className="syn-order-book-item_size">
                <Skeleton active={true} title={false} paragraph={{ rows: 1 }} />
              </div>
              <div className="syn-order-book-item_sum">
                <Skeleton active={true} title={false} paragraph={{ rows: 1 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBookSkeleton;
