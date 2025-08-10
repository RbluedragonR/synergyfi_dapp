export const getOrderBookSizeInQuote = (
  sizeInBaseToken: number,
  quoteTokenPriceInBaseToken: number,
  isNonInverse: boolean,
) => {
  if (isNonInverse) {
    return sizeInBaseToken * quoteTokenPriceInBaseToken;
  }
  return sizeInBaseToken / quoteTokenPriceInBaseToken;
};
