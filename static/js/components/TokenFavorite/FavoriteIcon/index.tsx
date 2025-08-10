/**
 * @description Component-FavoriteIcon
 */
import './index.less';

import cls from 'classnames';
import { FC } from 'react';

import { ReactComponent as StarWhite } from '../assets/icon_fav_off.svg';
import { ReactComponent as Star } from '../assets/icon_fav_on.svg';
interface IPropTypes {
  className?: string;
  favorite: boolean;
  onClick?: () => void;
}
const FavoriteIcon: FC<IPropTypes> = function ({ className, favorite, onClick }) {
  const props: Omit<IPropTypes, 'favorite'> = {
    onClick,
  };
  return (
    <>
      {favorite ? (
        <Star className={cls('syn-favorite-icon', 'syn-favorite-icon_star', className)} {...props} />
      ) : (
        <StarWhite className={cls('syn-favorite-icon', className)} {...props} />
      )}
    </>
  );
};

export default FavoriteIcon;
