import i18n from '@/i18n';

export function getContractError(errorCode: string): string {
  return i18n.t(errorCode);
}

export function getMappedRevertReason(originErr: string): string {
  const error = getContractError(originErr) || originErr;
  return error;
}

export function parsedEthersError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  error: any,
): { errorMsg: string; errorData: string } | undefined {
  const errorData = error?.error?.data?.originalError?.data || error?.data;
  // if throw error with revert data, parse it and show parsed error in notify
  if (error?.code === 'CALL_EXCEPTION' && errorData) {
    const errorMsg = getMappedRevertReason(errorData);
    return {
      errorData,
      errorMsg: errorData || errorMsg,
    };
  }
}
