export const decimalShortFormSymbolMap: {
  [id in number]: string;
} = {
  1: '₁',
  2: '₂',
  3: '₃',
  4: '₄',
  5: '₅',
  6: '₆',
  7: '₇',
  8: '₈',
  9: '₉',
  10: '₁₀',
  11: '₁₁',
  12: '₁₂',
  13: '₁₃',
  14: '₁₄',
  15: '₁₅',
  16: '₁₆',
  17: '₁₇',
  18: '₁₈',
  19: '₁₉',
  20: '₂₀',
};

// when num = 0.000999 -> 0.0_3_999
// if num = 0.001, it won't be short form since 0.001 exclusive
export const minExclusiveNumToShowShortDecimal = 0.001;
