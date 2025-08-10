import { createAction } from '@reduxjs/toolkit';

import { IMarginSearchProps } from '@/types/search';

export const setPartialMarginSearchProps = createAction<Partial<IMarginSearchProps>>(
  'market/setPartialMarginSearchProps',
);
