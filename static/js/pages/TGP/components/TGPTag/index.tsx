/**
 * @description Component-TGPTag
 */
import './index.less';

import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { Tooltip } from '@/components/ToolTip';
import { useIsPairInTGP, useTGPDappConfig } from '@/features/tgp/hooks';
import { ReactComponent as TrophyIcon } from '@/pages/TGP/assets/svg/icon_tgp_trophy.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  pairSymbol: string | undefined;
}
const TGPTag: FC<IPropTypes> = function ({ pairSymbol }) {
  const isSupportedInTGP = useIsPairInTGP(pairSymbol);
  const tgpDappConfig = useTGPDappConfig();
  if (!tgpDappConfig?.trade?.isShowTrade || !isSupportedInTGP) {
    return null;
  }

  return (
    <Tooltip title={<Trans i18nKey={'tgp.tagTooltip'} components={{ b: <b /> }} />}>
      <TrophyIcon />
    </Tooltip>
  );
};

export default TGPTag;
