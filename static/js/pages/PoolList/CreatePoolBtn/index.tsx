/**
 * @description Component-CreatePoolBtn
 */
import './index.less';

import classNames from 'classnames';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
// import { GlobalModalType } from '@/constants';
import { LIQUIDITY_FORM_TYPE } from '@/constants/global';
// import { useToggleModal } from '@/features/global/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import { QUERY_KEYS } from '@/constants/query';
import { queryClient } from '@/pages/App';
import LiquidityFormModal from '../LiquidityFormModal';
interface IProps {
  white: boolean;
}
const CreatePoolBtn: FC<IProps> = function ({ white }) {
  const [createVisible, setCreateVisible] = useState(false);
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { t } = useTranslation();
  // const toggleSignUpModal = useToggleModal(GlobalModalType.CREATE_POOL);
  const onCloseCreateModal = useCallback(() => {
    setCreateVisible(false);
  }, [setCreateVisible]);
  useEffect(() => {
    setCreateVisible(false);
  }, [chainId, userAddr]);
  return (
    <div className={classNames('syn-CreatePoolBtn', white ? 'white' : '')}>
      <Button
        type="primary"
        onClick={() => {
          setCreateVisible(!createVisible);
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MARKET.CREATIVE_PAIR_LIST() });
        }}
        className={'syn-CreatePoolBtn-btn'}>
        {t('common.newFutures')}
      </Button>
      <LiquidityFormModal
        title={t('common.poolList.modalTitle')}
        type={LIQUIDITY_FORM_TYPE.CREATE}
        chainId={chainId}
        visible={createVisible}
        onClose={onCloseCreateModal}
      />
    </div>
  );
};

export default memo(CreatePoolBtn);
