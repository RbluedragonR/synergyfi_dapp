import useSocket from '@/hooks/useSocket';
import { ISocketBlockInfo, MESSAGE_TYPE } from '@/types/socket';
import _ from 'lodash';
import { useEffect } from 'react';
import { useBlockInfoStore } from './store';

export function useBlockInfo(chainId: number | undefined): ISocketBlockInfo | undefined {
  const { blockInfo, setBlockInfo } = useBlockInfoStore();
  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;

    socket.on(MESSAGE_TYPE.blockNumberChanged, (data: ISocketBlockInfo) => {
      // console.record('socket', MESSAGE_TYPE.blockNumberChanged, data);
      setBlockInfo(data.chainId, data);
    });

    return () => {
      socket.off(MESSAGE_TYPE.blockNumberChanged);
    };
  }, [socket, setBlockInfo]);

  return _.get(blockInfo, chainId || 0);
}
