import { SOCKET_URL } from '@/constants/api';
import SocketService from '@/entities/SocketService';
import { useCallback, useEffect, useState } from 'react';

const useSocket = (url: string = SOCKET_URL) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState<SocketService | null>(null);

  useEffect(() => {
    if (!socketInstance) {
      const socketS = SocketService.getInstance();
      const socketInstance = socketS.connect();
      setSocketInstance(socketInstance);
      socketInstance.on('connect', () => {
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });
    }

    return () => {
      if (socketInstance) {
        console.log('🚀 ~ return ~ socketInstance:', socketInstance);
        // socketInstance.disconnect();
        // socketInstance = null;
      }
    };
  }, [url]);

  const emitEvent = useCallback((eventName: string, ...args: unknown[]) => {
    if (socketInstance)
      socketInstance.emit(eventName, ...args, (err: Error, response: unknown) => {
        if (err) {
          // the other side did not acknowledge the event in the given delay
          console.error(err);
        } else {
          console.record('socket', `emitEvent callback`, response);
        }
      });
  }, []);

  return { socket: socketInstance, isConnected, emitEvent };
};

export default useSocket;
