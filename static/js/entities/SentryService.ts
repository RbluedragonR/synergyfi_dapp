/* eslint-disable @typescript-eslint/no-explicit-any */
import { getContractError } from '@/utils/error';
import { Context, SeverityLevel } from '@sentry/core';
import { captureException, withScope } from '@sentry/react';

const excludeErrors = [
  'user rejected', //user rejected transaction, user rejected request with method
  'JsonRpcEngine:',
  'Pop up window failed to open',
  // 'Internal JSON-RPC error'
];

class SentryService {
  static captureException(
    error: any,
    context:
      | ({
          name: string;
        } & Context)
      | null,
    level?: SeverityLevel,
  ) {
    // exclude some errors
    if (excludeErrors.some((exclude) => error?.message?.includes(exclude))) {
      return;
    }

    // exclude contract errors
    if (error?.message) {
      const contractError = getContractError(error?.message?.trim());
      if (contractError) {
        return;
      }
    }

    withScope((scope) => {
      context && scope.setContext(context.name, context);
      scope.setExtra('error message', error?.message);
      scope.setExtra('cause error', (error as any)?.cause?.message);
      scope.setLevel(level || 'error');

      captureException(error);
    });
  }

  static captureMessage(message: string, context?: Record<string, any>) {
    captureException(message, {
      extra: context,
    });
  }
}

export default SentryService;
