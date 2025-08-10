// import { useTabType } from '@/features/global/hooks';
import { useCallback } from 'react';

import { GaCategory } from '@/utils/analytics';
// import { useChainId, useUserAddr } from './web3/useChain';

export function useGa(): ({
  category,
  action,
  label,
  value,
}: {
  category: GaCategory;
  action: string;
  label?: string | Record<string, unknown>;
  value?: number;
}) => void {
  // const chainId = useChainId();
  // const account = useUserAddr();
  return useCallback(
    ({
      category,
      action,
      label,
      value,
    }: {
      category: GaCategory;
      action: string;
      label?: string | Record<string, unknown>;
      value?: number;
    }) => {
      let labelFinal: Record<string, unknown> = {
        // account,
        // chainId,
      };
      if (label) {
        if (typeof label === 'string') {
          labelFinal = { ...labelFinal, info: label };
        } else {
          labelFinal = { ...labelFinal, ...label };
        }
      }
      let params: {
        category: GaCategory;
        action: string;
        label?: string;
        value?: number;
      } = {
        category,
        action,
        label: JSON.stringify(labelFinal),
      };
      if (value !== undefined) {
        params = { ...params, value };
      }
      params;
      // gaEvent(params);
    },
    [
      // chainId, account
    ],
  );
}
