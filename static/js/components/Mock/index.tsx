import { MockDevToolProps, toggleMockDevTool } from '@/features/global/globalSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { Flex } from 'antd';
import { useEffect, useState } from 'react';
export const useMockDevTool = () => {
  const state = useAppSelector((state) => state.global.mockDevToolProps);
  return state;
};
export default function DevTool() {
  const { isMockSkeleton, isMockVaultShowWithdrawlRequest, isMockNumber, isMockNetworkError } = useMockDevTool();
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (isMockNetworkError) {
      throw 'Please close this window to see the network error.';
    }
  }, [isMockNetworkError]);
  return process.env.REACT_APP_API_ENV === 'dev' ? (
    <div
      style={{
        position: 'fixed',
        bottom: '120px',
        left: '60px',
        zIndex: 100,
      }}>
      {isOpen ? (
        <button onClick={() => setIsOpen(false)}>x</button>
      ) : (
        <button onClick={() => setIsOpen(true)}>Open Dev Tool</button>
      )}
      {isOpen && (
        <Flex
          gap={12}
          vertical
          style={{
            background: 'white',
            padding: 12,
          }}>
          Dev tools(Only exist in REACT_APP_API_ENV=dev)
          <button
            onClick={() => {
              dispatch(toggleMockDevTool(MockDevToolProps.isMockSkeleton));
            }}>
            {isMockSkeleton ? 'Hide Skeleton' : 'Show Skeleton'}
          </button>
          <div>Vault:</div>
          <Flex gap={12} vertical>
            <button
              onClick={() => {
                dispatch(toggleMockDevTool(MockDevToolProps.isMockVaultShowWithdrawlRequest));
              }}>
              {isMockVaultShowWithdrawlRequest ? 'Hide WithdrawlRequest' : 'Show WithdrawlRequest'}
            </button>
          </Flex>
          <div>Number:</div>
          <Flex gap={12} vertical>
            <button
              onClick={() => {
                dispatch(toggleMockDevTool(MockDevToolProps.isMockNumber));
              }}>
              {isMockNumber ? 'Use Real Number' : 'Use Mock Number'}
            </button>
          </Flex>
          <div>Network Error:</div>
          <Flex gap={12} vertical>
            <button
              onClick={() => {
                dispatch(toggleMockDevTool(MockDevToolProps.isMockNetworkError));
              }}>
              {isMockNetworkError ? 'Please refresh' : 'Show Network Error'}
            </button>
          </Flex>
        </Flex>
      )}
    </div>
  ) : null;
}
