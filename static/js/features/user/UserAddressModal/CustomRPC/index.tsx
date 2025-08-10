/**
 * @description Component-CustomRPC
 */
import { useChainId } from '@/hooks/web3/useChain';
import './index.less';

import { Button } from '@/components/Button';
import Input from '@/components/Input';
import { getRpcFromLocalForage, saveRpcToLocalForage } from '@/utils/storage';
import { useAsyncEffect } from 'ahooks';
import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const CustomRPC: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const [rpcInput, setRpcInput] = useState<string>();
  useAsyncEffect(async () => {
    if (chainId) {
      const rpc = await getRpcFromLocalForage(chainId);
      if (rpc) {
        setRpcInput(rpc.rpc);
      }
    }
  }, [chainId]);

  const onSaveRpc = useCallback(async () => {
    setRpcInput(rpcInput);
    chainId && (await saveRpcToLocalForage(chainId, rpcInput?.trim() || ''));
    window.location.reload();
  }, [chainId, rpcInput]);

  return (
    <div className="syn-custom-rpc">
      <div className="syn-custom-rpc-title">{t('modal.userAddrModal.customRPC.title')}</div>
      <div className="syn-custom-rpc-form">
        <Input
          className="syn-custom-rpc-input"
          placeholder="RPC URL"
          value={rpcInput}
          onChange={(e) => {
            setRpcInput(e.target.value.trim());
          }}
        />
        <Button size="small" className="syn-custom-rpc-btn" type="primary" onClick={onSaveRpc}>
          {t('modal.userAddrModal.customRPC.save')}
        </Button>
      </div>

      <div className="syn-custom-rpc-footer">{t('modal.userAddrModal.customRPC.footer')} </div>
    </div>
  );
};

export default CustomRPC;
