import { ContractTransaction } from 'ethers';
import { useCallback, useMemo } from 'react';

import { GlobalModalType, OPERATION_TX_TYPE } from '@/constants';
import { CHAIN_ID } from '@/constants/chain';
import { fetchTokenBalanceAction } from '@/features/balance/actions';
import { useWrappedQuoteMap } from '@/features/chain/hook';
import { useToggleModal } from '@/features/global/hooks';
import { addTransaction } from '@/features/transaction/actions';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useSDK } from '@/features/web3/hook';
import { TokenInfo } from '@/types/token';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import { isTestnet } from '@/utils/chain';

import { useAppDispatch } from '.';
import { useChainId, useDappChainConfig, useUserAddr } from './web3/useChain';
import { useErc20Contract } from './web3/useContract';
import { useSwitchNetwork } from './web3/useSwitchConnectorNetwork';
import { useWalletSigner } from './web3/useWalletNetwork';

export function useTestnetMint(tokenInfo: TokenInfo | undefined): {
  onClickMintToken: () => Promise<void>;
} {
  const dispatch = useAppDispatch();
  const userAddr = useUserAddr();
  const chainId = useChainId();
  const signer = useWalletSigner();
  const testNetErc20Contract = useErc20Contract(tokenInfo?.address, signer);
  const walletConnectStatus = useWalletConnectStatus();
  const sdk = useSDK(chainId);
  const toggleWalletModal = useToggleModal(GlobalModalType.Wallet);
  const { switchWalletNetwork } = useSwitchNetwork();
  const onClickMintToken = useCallback(async () => {
    if (testNetErc20Contract && chainId && userAddr) {
      try {
        if (walletConnectStatus === WALLET_CONNECT_STATUS.UN_CONNECT) {
          toggleWalletModal(true);
          return;
        } else if (walletConnectStatus === WALLET_CONNECT_STATUS.WRONG_NETWORK) {
          switchWalletNetwork && switchWalletNetwork(chainId);
          return;
        }
        const mintTx = await testNetErc20Contract.populateTransaction.mint();
        if (sdk && signer) {
          const response = (await sdk.tx.sendTx(mintTx, { signer: signer })) as ContractTransaction;
          console.record('tx', '[Erc20] [Mint] tx sent', response, {
            tokenInfo,
            userAddr,
            chainId,
          });
          dispatch(
            addTransaction({
              chainId,
              traderAddr: userAddr,
              txInfo: {
                type: OPERATION_TX_TYPE.MINT,
                chainId,
                from: userAddr,
                gasLimit: response.gasLimit.toString(),
                txHash: response.hash,
                transactionResponse: response,
              },
            }),
          );
          const receipt = await response.wait();
          if (receipt.status === 1) {
            tokenInfo &&
              dispatch(fetchTokenBalanceAction({ chainId, userAddr, token: tokenInfo, block: receipt.blockNumber }));
          }
        }
      } catch (error) {
        console.error('🚀 ~ file: index.tsx:49 ~ onClickMintToken ~ error:', error);
      }
    }
  }, [
    testNetErc20Contract,
    chainId,
    userAddr,
    walletConnectStatus,
    sdk,
    signer,
    toggleWalletModal,
    switchWalletNetwork,
    tokenInfo,
    dispatch,
  ]);

  return { onClickMintToken };
}

export function useMintToken(
  chainId: CHAIN_ID | undefined,
  tokenInfo?: TokenInfo,
): {
  onClickMintToken: () => Promise<void>;
  tokenInfo: TokenInfo | undefined;
} {
  const dappConfig = useDappChainConfig(chainId);
  const marginTokenMap = useWrappedQuoteMap(chainId);

  const token = useMemo(() => {
    if (marginTokenMap) {
      if (isTestnet(chainId)) {
        const tokens = Object.values(marginTokenMap);
        const token = tokens.find((t) => t.symbol === dappConfig?.network.testnet?.mintTokens[0]);
        if (token) return token;
      } else if (dappConfig?.network.mockTokenConfig?.mockTokenSymbol) {
        const tokens = Object.values(marginTokenMap);
        const token = tokens.find((t) => t.symbol === dappConfig?.network.mockTokenConfig?.mockTokenSymbol);
        if (token) return token;
      }
    }
  }, [
    chainId,
    dappConfig?.network.mockTokenConfig?.mockTokenSymbol,
    dappConfig?.network.testnet?.mintTokens,
    marginTokenMap,
  ]);
  const { onClickMintToken } = useTestnetMint(tokenInfo || token);
  return {
    onClickMintToken,
    tokenInfo: tokenInfo || token,
  };
}
