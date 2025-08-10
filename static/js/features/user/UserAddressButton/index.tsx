import './index.less';

import classNames from 'classnames';

import { Button } from '@/components/Button';
import { Mobile, useMediaQueryDevice } from '@/components/MediaQuery';
import { GlobalModalType } from '@/constants';
import { useToggleModal } from '@/features/global/hooks';
import { useGa } from '@/hooks/useGa';
import { IButtonProps } from '@/types/button';
import { GaCategory } from '@/utils/analytics';

import { useDappChainConfig } from '@/hooks/web3/useChain';
import UserAddressStatus from '../UserAddressStatus';
import UserAddressDrawer from './UserAddressDrawer';

export default function UserAddressButton(props: IButtonProps): JSX.Element | null {
  const toggleUserAddressModal = useToggleModal(GlobalModalType.Account);
  const gaEvent = useGa();
  const config = useDappChainConfig();
  const { deviceType } = useMediaQueryDevice();
  return (
    <>
      <Button
        ghost
        {...props}
        style={{
          ...props.style,
          backgroundColor: config?.colors?.bg1,
          border: config?.colors?.border1 && `1px solid ${config.colors.border1}`,
        }}
        onClick={() => {
          toggleUserAddressModal();
          gaEvent({
            category: GaCategory.HEADER,
            action: 'click user address status',
          });
        }}
        className={classNames('user-address-btn', deviceType)}>
        <UserAddressStatus />
      </Button>

      <Mobile>
        <UserAddressDrawer />
      </Mobile>
    </>
  );
}
