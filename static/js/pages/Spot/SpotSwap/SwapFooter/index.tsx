/**
 * @description Component-SwapFooter
 */
import { ApproveWrapButton } from '@/pages/components/WalletStatus/ApproveButton';
import './index.less';

import { ZERO } from '@/constants';
import { OPERATION_TX_TYPE } from '@/constants/tx';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useGlobalConfig } from '@/features/global/hooks';
import { useSpotState } from '@/features/spot/store';
import { sendTransaction } from '@/features/transaction/actions';
import { useAppProvider, useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { parseSendingTxMessageMapping } from '@/utils/notification';
import { toWad } from '@/utils/numberUtil';
import { addedDeadline, perToTenThousands } from '@/utils/trade';
import { BigNumber, PopulatedTransaction, ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useSimulateBestAmount } from '@/features/spot/hooks';
import { useSimulateSwap } from '@/features/spot/query';
import { useUnConnectSubCard } from '@/pages/components/WalletStatus/UnconnectSubCard';
import { WorkerEventNames } from '@/types/worker';
import { bothNative } from '@/utils/spot';
import { OYSTER_AGGREGATOR_ADDRESS, SplitPathInfo } from '@synfutures/sdks-aggregator';
import SpotSwapAlert from '../SpotSwapDetail/SpotSwapAlert';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const SwapFooter: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const {
    sellAmount,
    token0: sellToken,
    token1: buyToken,
    setSellAmount: setAmount,
    swapping,
    setSwapping,
    setNewTxHashForFetchingHistory: setNewTransactionHashForFetchingHistory,
  } = useSpotState();
  const dispatch = useAppDispatch();
  const signer = useWalletSigner();
  const sdk = useSDK(chainId);
  const provider = useAppProvider();
  const { deadline, slippage } = useGlobalConfig(chainId);
  const { data: simulation } = useSimulateSwap();
  const userAddr = useUserAddr();
  const bestAmountSimulation = useSimulateBestAmount();
  const swap = useCallback(async () => {
    if (WrappedBigNumber.from(sellAmount).eq(0)) {
      return;
    }
    const nativeWrapNativeSwap = bothNative(sellToken, buyToken);
    if (sellAmount && sellToken && buyToken && sdk && signer && chainId && provider && userAddr) {
      const sellAmountBN = parseUnits(sellAmount, sellToken.decimals);
      try {
        setSwapping(true);

        const result = await dispatch(
          sendTransaction({
            signer,
            sendFunc: async () => {
              let populatedTx;
              if (nativeWrapNativeSwap && !bestAmountSimulation.bestPathInfo) {
                populatedTx = (await sdk?.aggregator.wethConvert({
                  fromTokenAddress: sellToken.address,
                  toTokenAddress: buyToken.address,
                  amount: sellAmountBN,
                })) as PopulatedTransaction;
                // imperative gas limit for this tx 63000gw
                populatedTx.gasLimit = BigNumber.from(63000);
              } else {
                populatedTx = await sdk?.aggregator.multiSwap(
                  {
                    fromTokenAddress: sellToken.address,
                    toTokenAddress: buyToken.address,
                    fromTokenAmount: sellAmountBN,
                    bestPathInfo: bestAmountSimulation.bestPathInfo as SplitPathInfo,
                    bestAmount: parseUnits(bestAmountSimulation.bestAmount, buyToken.decimals),
                    slippageInBps: perToTenThousands(Number(slippage)),
                    deadline: addedDeadline(Number(deadline)),
                    broker: ethers.constants.AddressZero,
                    brokerFeeRate: ZERO,
                  },
                  { from: userAddr },
                );
              }
              return signer.sendTransaction(populatedTx);
            },
            chainId,
            userAddr,
            txParams: {
              type: nativeWrapNativeSwap ? OPERATION_TX_TYPE.NATIVE_SWAP : OPERATION_TX_TYPE.SWAP,
              instrument: {
                baseSymbol: buyToken.symbol,
                quoteSymbol: sellToken.symbol,
                isInverse: false,
                quoteDecimal: sellToken.decimals,
                baseDecimal: buyToken.decimals,
              },
              sendingTemplate: parseSendingTxMessageMapping[OPERATION_TX_TYPE.SWAP]?.(
                WrappedBigNumber.from(sellAmount),
                buyToken.symbol,
                sellToken.symbol,
                WrappedBigNumber.from(bestAmountSimulation.bestAmount),
              ),
            },
            wssProvider: provider,
          }),
        ).unwrap();
        if (result?.status) {
          // need update balance
        }
        if (result?.transactionHash) {
        }

        window.userWorker.postMessage({
          eventName: WorkerEventNames.MulticallBalance,
          data: {
            chainId,
            userAddr,
            tokens: [sellToken, buyToken],
          },
        });
        result?.transactionHash && setNewTransactionHashForFetchingHistory(result?.transactionHash);
        setSwapping(false);
        if (result?.status === 1) {
          setAmount('');
        }
        return result;
      } catch (e) {
        console.log('🚀 ~ swap ~ e:', e);
        setSwapping(false);
      }
    }
  }, [
    sellAmount,
    sellToken,
    buyToken,
    sdk,
    signer,
    chainId,
    provider,
    userAddr,
    setSwapping,
    dispatch,
    bestAmountSimulation.bestAmount,
    bestAmountSimulation.bestPathInfo,
    setNewTransactionHashForFetchingHistory,
    slippage,
    deadline,
    setAmount,
  ]);
  const { t } = useTranslation();
  const res = useUnConnectSubCard(
    undefined,
    () => {
      return;
    },
    true,
    t('common.connectWal'),
  );
  return (
    <div className="syn-swap-footer">
      <SpotSwapAlert />
      {res !== undefined ? (
        res.footer
      ) : (
        <ApproveWrapButton
          disabled={simulation?.data?.tokens.length === 0}
          className={`syn-swap-footer-btn`}
          amount={toWad(sellAmount || 0)}
          marginToken={sellToken}
          afterApproved={swap}
          spenderAddress={chainId ? OYSTER_AGGREGATOR_ADDRESS[chainId] : undefined}
          loading={swapping}>
          {t('common.swap')}
        </ApproveWrapButton>
      )}
    </div>
  );
};

export default SwapFooter;
