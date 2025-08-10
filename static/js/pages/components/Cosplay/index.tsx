/**
 * @description Component-Cosplay
 */
import { FC, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { setImpostorAddress } from '@/features/user/userSlice';
import { useAppDispatch } from '@/hooks';
import { isAddress } from '@/utils/address';
import { getAddress } from 'ethers/lib/utils';

const Cosplay: FC = function () {
  const dispatch = useAppDispatch();
  const { impostorAddress } = useParams();

  useEffect(() => {
    if (impostorAddress && isAddress(impostorAddress)) {
      dispatch(setImpostorAddress({ account: getAddress(impostorAddress).toLowerCase() }));
    }
  }, [dispatch, impostorAddress]);

  return <Navigate to="/" replace />;
};

export default Cosplay;
