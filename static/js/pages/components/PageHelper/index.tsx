/**
 * @description Component-PageHelper
 */
import { FC, ReactNode } from 'react';

import { Default, Mobile } from '@/components/MediaQuery';
interface IPropTypes {
  mobileComponent: ReactNode;
  desktopComponent?: ReactNode;
}
const PageHelper: FC<IPropTypes> = function ({ mobileComponent, desktopComponent }) {
  return (
    <>
      <Default>
        <>{desktopComponent}</>
      </Default>
      <Mobile>
        <>{mobileComponent}</>
      </Mobile>
    </>
  );
};

export default PageHelper;
