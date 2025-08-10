import React from 'react';

import { useChainId } from '@/hooks/web3/useChain';

import { useUserWorkerEventListener } from '@/hooks/data/useListenEventOnWorker';
import { UserEventListener } from '../EventListener';
import { useSetSentryUser } from '../hooks';
export const MOCK_SPENDER = '0xF672C510acbf516edaA87EB3aB4f0454c26F3Ad6';
// function useCheckTokenApprovalStatus(chainId: CHAIN_ID | undefined, account: string | undefined): void {
//   const dispatch = useAppDispatch();
//   // global control for token approval status
//   const provider = useProvider();
//   const marginTokenMap = useWrappedQuoteMap(chainId);
//   const sdk = useSDK(chainId);
//   // automatically check all margin tokens approval
//   useDebounceEffect(
//     () => {
//       if (account && chainId && provider && marginTokenMap && sdk) {
//         const marginTokens = Object.values(marginTokenMap);
//         if (marginTokens?.length) {
//           dispatch(
//             multiCheckTokenAllowancesAction({
//               userAddress: account,
//               chainId,
//               marginTokens: marginTokens,
//               spenderAddress: sdk.perp.contracts.gate.address,
//             }),
//           );
//         }
//       }
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     },
//     [account, chainId, dispatch, provider, marginTokenMap, sdk],
//     { wait: 500 },
//   );
// }

function UserGlobalEffect(): JSX.Element {
  const chainId = useChainId();
  // const account = useUserAddr();
  // useCheckTokenApprovalStatus(chainId, account);
  useUserWorkerEventListener(chainId);
  useSetSentryUser();
  return <UserEventListener></UserEventListener>;
}

export default React.memo(UserGlobalEffect);
