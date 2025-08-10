/**
 * @description Component-TokenFavorite
 */
import './index.less';

import cls from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '@/components/ToolTip';
import { useFavorite, useSaveFavorite } from '@/hooks/useFavorites';

import FavoriteIcon from './FavoriteIcon';
interface IPropTypes {
  instrumentAddr?: string;
  expiry: number | undefined;
  className?: string;
  favoriteClicked?: (fav: boolean) => void;
  chainId: number | undefined;
}
const TokenFavorite: FC<IPropTypes> = function ({ className, instrumentAddr, expiry, favoriteClicked, chainId }) {
  const [favorite, setFavorite] = useState<boolean>(false);
  const valueInLocalStorage = useFavorite(chainId, instrumentAddr, expiry !== undefined ? expiry.toString() : '');
  const saveFavoriteToLocalStorage = useSaveFavorite(chainId);
  const { t } = useTranslation();
  useEffect(() => {
    setFavorite(valueInLocalStorage);
  }, [chainId, valueInLocalStorage]);

  const toggleFavorite = useCallback(() => {
    setFavorite(!favorite);
    favoriteClicked && favoriteClicked(!favorite);
    instrumentAddr &&
      saveFavoriteToLocalStorage(instrumentAddr, expiry !== undefined ? expiry.toString() : '', !favorite);
  }, [favorite, instrumentAddr, saveFavoriteToLocalStorage, expiry, favoriteClicked]);

  return (
    <Tooltip title={t('common.favorite')}>
      <div
        className={cls('syn-token_favorite', className)}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite();
        }}>
        <FavoriteIcon favorite={favorite} />
      </div>
    </Tooltip>
  );
};

export default TokenFavorite;
