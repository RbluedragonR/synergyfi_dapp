/**
 * @description Component-SocialWallet
 */
import { ISocialWalletInfo, IWalletConfigInfo, WalletType } from '@/types/wallet';

import { ReactComponent as ChrevronRight } from '@/assets/svg/icon_chevron_right.svg';
import BigLoading from '@/components/Loading/BigLoading';
import './index.less';

import { useLoginInOrOutPrivyWallet, usePrivyWalletAddress } from '@/connectors/privy/usePrivyWallet';
import { GlobalModalType } from '@/constants';
import { useToggleModal } from '@/features/global/hooks';
import { useAppDispatch } from '@/hooks';
import classNames from 'classnames';
import { FC, useCallback, useMemo } from 'react';
import WalletBrand from '../../WalletBrand';
import { setWalletType } from '../../walletSlice';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  wallet: ISocialWalletInfo;
  pendingWallet?: WalletType;
  onChangePendingWallet?: (wallet?: IWalletConfigInfo) => void;
}
const SocialWallet: FC<IPropTypes> = function ({ wallet, pendingWallet, onChangePendingWallet }) {
  const dispatch = useAppDispatch();
  const privyAddr = usePrivyWalletAddress();
  const toggleModal = useToggleModal(GlobalModalType.Wallet);

  const { login } = useLoginInOrOutPrivyWallet((isLogin, successLogin) => {
    console.log('🚀 ~ login:', { isLogin, successLogin });
    onChangePendingWallet && onChangePendingWallet(undefined);
  });

  const handleChangeWallet = useCallback(
    (wallet: ISocialWalletInfo) => {
      onChangePendingWallet && onChangePendingWallet(wallet);
      if (wallet.type === WalletType.PRIVY) {
        if (privyAddr) {
          dispatch(setWalletType({ type: WalletType.PRIVY }));
          onChangePendingWallet && onChangePendingWallet(undefined);
          toggleModal(false);
        } else login();
      }
    },
    [dispatch, login, onChangePendingWallet, privyAddr, toggleModal],
  );

  const content = useMemo(() => {
    return (
      <div
        key={wallet.name}
        className={classNames('syn-social-wallet')}
        onClick={() => {
          handleChangeWallet(wallet);
        }}>
        <WalletBrand type={wallet.type} />
        <div className="syn-social-wallet-connect">
          {/* {wallet.type === TRENDING_WALLET && (
            <span className={classNames('trending-wallet', deviceType)}>
              🔥{' '}
              <Default>
                <> {t('modal.walletModal.walletItem.Trending')}</>
              </Default>
            </span>
          )} */}
          {pendingWallet === wallet.type ? <BigLoading /> : <ChrevronRight />}
        </div>
      </div>
    );
  }, [handleChangeWallet, pendingWallet, wallet]);

  return (
    <div className="syn-social-wallet-wrap" key={wallet.name}>
      {content}
      {/* {pendingError === wallet.connector && (
        <div className="syn-social-wallet-retry">
          <InfoCircleFilled className="text-danger" />
          <span>{walletError}</span>
          <Button
            ghost
            type="link"
            onClick={() => {
              handleChangeWallet(wallet, chainId);
            }}>
            {t('modal.walletModal.walletItem.TryAgain')}
          </Button>
        </div>
      )} */}
    </div>
  );
};

export default SocialWallet;
