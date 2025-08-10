/**
 * @description Page-Footer
 */
import { FC, memo, Suspense } from 'react';

import SocialList from '@/components/List/SocialList';
import { Default } from '@/components/MediaQuery';
import BlockNumberText from '@/components/Text/BlockNumberText';
import './index.less';

const Footer: FC = function () {
  return (
    <Suspense>
      <Default>
        <div className="syn-desktop-footer">
          <BlockNumberText />

          <SocialList />
        </div>
      </Default>
    </Suspense>
  );
};

export default memo(Footer);
