import './index.less';

import { Card as AntDCard, CardProps, Spin } from 'antd';
import cls from 'classnames';
import { FC, memo, useMemo } from 'react';

import { useMediaQueryDevice } from '@/components/MediaQuery';
interface ICardProps extends CardProps {
  total?: number;
  loadingItem?: boolean;
}
const CardComponent: FC<ICardProps> = ({ loadingItem, ...props }) => {
  const { deviceType } = useMediaQueryDevice();

  const title = useMemo(() => {
    if (props.title) {
      return (
        <div className="syn-card-title">
          <span>{props.title}</span>
          {/* remove total */}
          {/* {!!props.total && props.total > 0 && <div className="syn-card-rows-length">{props.total}</div>} */}

          {(loadingItem || props.loading) && <Spin className="syn-card-rows-loading" spinning={true} />}
        </div>
      );
    }
    return undefined;
  }, [props.title, props.loading, loadingItem]);

  return <AntDCard {...props} title={title} className={cls(`syn-card`, props.className, deviceType)}></AntDCard>;
};
const Card = memo(CardComponent);
export default Card;
