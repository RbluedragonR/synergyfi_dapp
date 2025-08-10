/**
 * @description Component-TGPTwitterDiscord
 */

import React, { FC, useEffect, useState } from 'react';

import { TGP_LUCK_USER_STATUS } from '@/constants/tgp';
import { useUserAddr } from '@/hooks/web3/useChain';
import { getShareStorageKey } from '@/utils/tgp';

import TGPModalDiscordJoin from '../TGPModalDiscordJoin';
import TGPModalTwitterShare from '../TGPModalTwitterShare';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  type: 'luckyDraw' | 'rank';
  onConfirm: () => void;
  week: number;
  modalStatus: 'claim' | 'shareToGetTicket';
  isMaster: boolean;
}
const TGPTwitterDiscord: FC<IPropTypes> = function ({
  type = 'luckyDraw',
  onConfirm,
  week,
  modalStatus = 'claim',
  isMaster,
}) {
  const userAddr = useUserAddr();
  const [status, setStatus] = useState<TGP_LUCK_USER_STATUS | undefined>();
  useEffect(() => {
    if (userAddr && week) {
      const storageKey = getShareStorageKey(type, isMaster, week, userAddr);
      const userStatus = localStorage.getItem(storageKey);
      setStatus(Number(userStatus || 1) as TGP_LUCK_USER_STATUS);
    }
  }, [userAddr]);
  return (
    <>
      <TGPModalTwitterShare
        type={type}
        status={status}
        statusChange={setStatus}
        week={week}
        modalStatus={modalStatus}
        isMaster={isMaster}
      />
      <TGPModalDiscordJoin
        week={week}
        isMaster={isMaster}
        modalStatus={modalStatus}
        type={type}
        status={status}
        statusChange={setStatus}
        onConfirm={onConfirm}
      />
    </>
  );
};

export default TGPTwitterDiscord;
