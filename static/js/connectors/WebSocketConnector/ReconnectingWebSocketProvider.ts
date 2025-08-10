/* eslint-disable @typescript-eslint/no-explicit-any */
import { providers } from 'ethers';
import { debounce } from 'lodash';

// Used to "trick" TypeScript into treating a Proxy as the intended proxied class
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fakeBaseClass = <T>(): new () => Pick<T, keyof T> => class {} as any;

// const EXPECTED_PONG_BACK = 15000;
// const KEEP_ALIVE_CHECK_INTERVAL = 8000;

// let keepAliveInterval: NodeJS.Timeout | null = null;
// let pingTimeout: NodeJS.Timeout | null = null;
// let reConnectTimeout: NodeJS.Timeout | null = null;

export class ReconnectingWebSocketProvider extends fakeBaseClass<providers.WebSocketProvider>() {
  private static instances: Record<number, ReconnectingWebSocketProvider> = {};
  private underlyingProvider?: providers.WebSocketProvider;
  events: providers.WebSocketProvider['_events'] = [];
  requests: providers.WebSocketProvider['_requests'] = {};

  // Define a handler that forwards all "get" access to the underlying provider
  private handler = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(target: ReconnectingWebSocketProvider, prop: string, receiver: any) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return Reflect.get(target.underlyingProvider!, prop, receiver);
    },
  };

  public static getInstance(chainId: number, url: string): ReconnectingWebSocketProvider {
    let instance = this.instances[chainId];
    if (!instance) {
      instance = new ReconnectingWebSocketProvider(url, chainId);
      this.instances[chainId] = instance;
    }
    return instance;
  }

  constructor(private url: string, private networkConfig?: providers.Networkish | undefined) {
    super();
    this.connect();

    return new Proxy(this, this.handler);
  }

  private async connect() {
    if (this.underlyingProvider) {
      this.events = [...this.events, ...this.underlyingProvider._events];

      this.requests = { ...this.requests, ...this.underlyingProvider._requests };
      // destroy old connect

      await this.underlyingProvider.destroy();
      await new Promise((r) => setTimeout(r, 2000));
      console.record('websocket', 'Destroy websocket connection', undefined, {
        provider: this.underlyingProvider,
        url: this.url,
        networkConfig: this.networkConfig,
      });
    }
    // Instantiate new provider with same url
    try {
      this.underlyingProvider = new providers.WebSocketProvider(this.url, this.networkConfig);
      console.record('websocket', 'Create websocket connection', this.underlyingProvider, {
        url: this.url,
        networkConfig: this.networkConfig,
      });

      this.keepAlive({
        onDisconnect: debounce((err) => {
          console.record('websocket', 'on disconnect websocket connection', err, {
            url: this.url,
            networkConfig: this.networkConfig,
          });
          // if (keepAliveInterval) clearInterval(keepAliveInterval);
          // if (pingTimeout) clearTimeout(pingTimeout);
          // if (reConnectTimeout) clearTimeout(reConnectTimeout);
          // setTimeout(() => {
          this.connect();
          // }, 3000);

          console.error('The ws connection was closed', JSON.stringify(err, null, 2));
        }, 500),
      });
    } catch (error) {
      console.error(
        '🚀 ~ file: ReconnectingWebSocketProvider.ts:59 ~ ReconnectingWebSocketProvider ~ connect ~ error:',
        error,
      );
    }
  }

  keepAlive = ({
    onDisconnect,
  }: // expectedPongBack = 5000,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onDisconnect: (err?: any) => void;
    expectedPongBack?: number;
    checkInterval?: number;
  }): void => {
    try {
      // if (pingTimeout) clearTimeout(pingTimeout);
      // if (keepAliveInterval) clearInterval(keepAliveInterval);
      if (!this.underlyingProvider) return;
      // reConnectTimeout = setTimeout(() => {
      //   onDisconnect();
      // }, KEEP_ALIVE_CHECK_INTERVAL);
      const onopen = this.underlyingProvider._websocket.onopen;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.underlyingProvider._websocket.onopen = (...args: any[]) => {
        if (!this.underlyingProvider) return;
        console.record('websocket', 'on open websocket connection', undefined, {
          url: this.url,
          networkConfig: this.networkConfig,
          args,
          provider: this.underlyingProvider,
        });
        // reConnectTimeout && clearTimeout(reConnectTimeout);
        // clear temporary events and requests
        let event;
        while ((event = this.events.pop())) {
          this.underlyingProvider?._events.push(event);
          this.underlyingProvider?._startEvent(event);
        }

        for (const key in this.requests) {
          if (this.requests[key]) {
            this.underlyingProvider._requests[key] = this.requests[key];
            this.underlyingProvider?._websocket.send(this.requests[key].payload);
            delete this.requests[key];
          }
        }

        onopen?.call(this.underlyingProvider?._websocket, ...args);

        // keepAliveInterval = setInterval(() => {
        //   // // call provider for keep alive
        //   // this.underlyingProvider?._websocket?.send('');
        //   // pingTimeout = setTimeout(() => {
        //   //   console.record(
        //   //     'websocket',
        //   //     `on websocket connection detection heartbeat expired[${KEEP_ALIVE_CHECK_INTERVAL}s]`,
        //   //     undefined,
        //   //     {
        //   //       url: this.url,
        //   //       networkConfig: this.networkConfig,
        //   //       provider: this.underlyingProvider,
        //   //       KEEP_ALIVE_CHECK_INTERVAL,
        //   //     },
        //   //   );
        //   //   // onDisconnect();
        //   // }, expectedPongBack);
        //   // if (this.underlyingProvider) {
        //   //   if (this.underlyingProvider._websocket.readyState === WebSocket.OPEN) return;
        //   //   this.underlyingProvider._websocket.close();
        //   // }
        // }, KEEP_ALIVE_CHECK_INTERVAL);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.underlyingProvider._websocket.onclose = (err: any) => {
        console.record('websocket', 'on websocket connection closed', err, {
          url: this.url,
          networkConfig: this.networkConfig,
          provider: this.underlyingProvider,
        });
        onDisconnect(err);
      };
      try {
        const onMessage = this.underlyingProvider._websocket.onmessage;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.underlyingProvider._websocket.onmessage = (...args: any[]) => {
          // console.log('🚀 onmessage', args);
          // reConnectTimeout && clearTimeout(reConnectTimeout);
          // if (pingTimeout) clearTimeout(pingTimeout);
          try {
            onMessage && onMessage.call(this.underlyingProvider?._websocket, ...args);
          } catch (error) {}
        };
      } catch (error) {
        console.log('🚀 ~ file: ReconnectingWebSocketProvider.ts:162 ~ ReconnectingWebSocketProvider ~ error:', error);
      }

      // }, 1000);
    } catch (error) {
      console.log('🚀 ~ file: ReconnectingWebSocketProvider.ts:142 ~ keepAlive ~ error:', error);
    }
  };
}
