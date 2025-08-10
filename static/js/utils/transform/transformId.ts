export function getPairId(instrumentAddr: string, expiry: number): string {
  return `${instrumentAddr}-${expiry}`.toLowerCase();
}
export function getAccountId(userAddr: string, instrumentAddr: string): string {
  return `${userAddr}-${instrumentAddr}`.toLowerCase();
}

export function getPortfolioId(accountId: string, expiry: number): string {
  return `${accountId}-${expiry}`.toLowerCase();
}

export function getOrderId(portfolioId: string, oid: number): string {
  return `${portfolioId}-${oid}`.toLowerCase();
}

export function getRangeId(portfolioId: string, rid: number): string {
  return `${portfolioId}-${rid}`.toLowerCase();
}
