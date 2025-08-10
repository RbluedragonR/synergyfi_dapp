/**
 * @description Component-socket
 */
import Card from '@/components/Card';
import useSocket from '@/hooks/useSocket';
import { useChainId } from '@/hooks/web3/useChain';
import { MESSAGE_TYPE, SUBSCRIBE_TYPE, UNSUBSCRIBE_TYPE } from '@/types/socket';
import { Space } from 'antd';
import ReactJson from 'react-json-view';

import { FC, useEffect, useState } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const SocketCard: FC<IPropTypes> = function ({}) {
  const { socket, isConnected } = useSocket();
  const [blockNumberInfo, setBlockNumberInfo] = useState(null);
  const [marketListChanged, setMarketListChanged] = useState(null);
  const [marketFeaturePairsChanged, setMarketFeaturePairsChanged] = useState(null);
  const [vaultListChanged, setVaultListChanged] = useState(null);
  const [eventChanged, setEventChanged] = useState(null);
  const [pairChanged, setPairChanged] = useState(null);
  const chainId = useChainId();

  useEffect(() => {
    if (!socket) return;

    socket.on(MESSAGE_TYPE.blockNumberChanged, (data) => {
      setBlockNumberInfo(data);
    });

    return () => {
      socket.off(MESSAGE_TYPE.blockNumberChanged);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !chainId) return;
    socket.emit(SUBSCRIBE_TYPE.MARKET, { chainId: chainId });

    socket.on(MESSAGE_TYPE.marketListChanged, (data) => {
      //console.log(MESSAGE_TYPE.marketListChanged, data);
      setMarketListChanged(data);
    });

    socket.on(MESSAGE_TYPE.marketFeaturePairsUpdated, (data) => {
      //console.log(MESSAGE_TYPE.marketFeaturePairsUpdated, data);
      setMarketFeaturePairsChanged(data);
    });

    socket.on(MESSAGE_TYPE.vaultChanged, (data) => {
      //console.log(MESSAGE_TYPE.vaultChanged, data);
      setVaultListChanged(data);
    });

    return () => {
      socket.off(MESSAGE_TYPE.marketListChanged);
      socket.emit(UNSUBSCRIBE_TYPE.MARKET);
    };
  }, [chainId, socket]);

  useEffect(() => {
    if (!socket || !chainId) return;
    socket.emit(SUBSCRIBE_TYPE.EVENT, { chainId: chainId });

    socket.on(MESSAGE_TYPE.perpEvent, (data) => {
      //console.log(MESSAGE_TYPE.perpEvent, data);
      setEventChanged(data);
    });

    return () => {
      socket.off(MESSAGE_TYPE.perpEvent);
      socket.emit(UNSUBSCRIBE_TYPE.EVENT);
    };
  }, [chainId, socket]);

  useEffect(() => {
    if (!socket || !chainId) return;
    socket.emit(SUBSCRIBE_TYPE.PAIR_INFO, { chainId: chainId });

    socket.on(MESSAGE_TYPE.pairInfo, (data) => {
      //console.log(MESSAGE_TYPE.pairInfo, data);
      setPairChanged(data);
    });

    return () => {
      socket.off(MESSAGE_TYPE.pairInfo);
      socket.emit(UNSUBSCRIBE_TYPE.PAIR_INFO);
    };
  }, [chainId, socket]);

  return (
    <Card title="Socket.IO Demo">
      <div>
        <h1>Socket.IO Demo</h1>
        <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        <div>
          <button onClick={() => socket?.emit('message', { text: 'Hello, Server!' })} disabled={!isConnected}>
            Send Message
          </button>
        </div>

        <Space>
          <div>
            <h2>event listener</h2>
            <div>
              <p>blockNumber: {JSON.stringify(blockNumberInfo)}</p>
            </div>
            <p>marketListChanged time: {JSON.stringify(marketListChanged)}</p>
            <p>marketFeaturePairsUpdated time: {JSON.stringify(marketFeaturePairsChanged)}</p>
            <p>vaultChanged time: {JSON.stringify(vaultListChanged)}</p>
            <p>pairChanged time: {JSON.stringify(pairChanged)}</p>
            <p>eventChanged:</p>
            {eventChanged && <ReactJson src={eventChanged} collapsed={true} />}
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default SocketCard;
