import { PRICE_BASIS_FOR_PNL } from '../storage';

export enum PriceBasisForPnl {
  MARK_PRICE = 'MARK_PRICE',
  FAIR_PRICE = 'FAIR_PRICE',
}
export const priceBasisForPnlInfos = {
  [PriceBasisForPnl.FAIR_PRICE]: {
    i18nId: 'common.fairP',
  },
  [PriceBasisForPnl.MARK_PRICE]: {
    i18nId: 'common.markP',
  },
};

export const priceBasisForPnlInLS = localStorage.getItem(PRICE_BASIS_FOR_PNL);
// need to check priceBasisForPnlInLS is vaild or not
export const isPriceBasisForPnlInLSVaild = Object.values(PriceBasisForPnl).includes(
  (priceBasisForPnlInLS as PriceBasisForPnl) || '',
);
export const initPriceBasisForPnl = isPriceBasisForPnlInLSVaild
  ? (priceBasisForPnlInLS as PriceBasisForPnl)
  : PriceBasisForPnl.MARK_PRICE;
