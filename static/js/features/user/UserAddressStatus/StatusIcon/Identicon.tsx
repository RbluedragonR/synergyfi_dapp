import { Jazzicon } from '@uktvs/jazzicon-react';
import React from 'react';

import { useUserAddr } from '@/hooks/web3/useChain';

function Identicon({ size = 16 }: { size?: number }): JSX.Element {
  const account = useUserAddr();

  return (
    <div className="identicon" style={{ width: size, height: size }}>
      <Jazzicon address={account || ''} />
    </div>
  );
}

export default React.memo(Identicon);
