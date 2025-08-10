/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash';
import moment from 'moment';

import { getChainName } from './chain';
const LogRecordTypes = [
  'event',
  'syn',
  'tx',
  'graph',
  'websocket',
  'other',
  'campaign',
  'ERC',
  'wallet',
  'simulate',
  'web3',
  'socket',
];

const enableLogTypes = ['wallet', 'simulate', 'web3', 'socket'];

const LogRecordTypeColors = [
  '#8572e3',
  '#1f8599',
  '#f5841f',
  '#124e59',
  '#434343',
  '#434343',
  '#cb8700',
  '#363636',
  '#f5841f',
  '#2b4ace',
  '#2c8747',
];
export declare type LogRecordType = (typeof LogRecordTypes)[number];

const PREFIX = '├─';
// const PREFIX_SUB = '├───';
// const RIGHT_ARROW = '=>';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const consoleRecord = (
  type: LogRecordType,
  title?: string,
  result?: any,
  params?: any,
  ...optionalParams: any[]
): void => {
  try {
    if (!enableLogTypes.includes(type)) {
      return;
    }
    const logArgs = [];
    if (title) {
      let color = LogRecordTypeColors[LogRecordTypes.indexOf(type) || 0];
      if (type === 'tx') {
        if (result?.receipt) {
          if (result?.receipt?.status === 1) {
            color = '#1f9933';
          } else {
            color = '#ff4d6a';
          }
        }
      }
      console.group(
        `%c ${_.padEnd(_.upperFirst(type), 8)} `,
        `color: white; background-color: ${color}`,
        PREFIX + '─'.repeat(5),

        title,
        '─'.repeat(5),
      );
    }

    logArgs.push(' '.repeat(10) + '| ' + `[Time: ${moment().format('YYYY-MM-DD HH:mm:ss')}]`);
    if (params?.chainId) {
      logArgs.push(` [Chain: ${getChainName(params.chainId)}]`);
    }
    if (params?.userAddr) {
      logArgs.push(` [User: ${params?.userAddr}]`);
    }
    if (params?.underlying?.symbol) {
      logArgs.push(` [Symbol: ${params?.underlying?.symbol}]`);
    }
    if (params?.txHash) {
      logArgs.push(` [txHash: ${params?.txHash}]`);
    }

    if (params) {
      logArgs.push('\n' + ' '.repeat(10) + '| ' + 'params:', params);
    }
    if (result) {
      logArgs.push('\n' + ' '.repeat(10) + '| ' + 'result:', result);
    }

    console.log(...logArgs, ...optionalParams);
    console.groupEnd();
  } catch (error) {
    console.error('🚀 ~ file: log.ts:23 ~ error:', error);
  }
};

console.record = consoleRecord;

if (self) {
  self.console.record = consoleRecord;
}

export {};
