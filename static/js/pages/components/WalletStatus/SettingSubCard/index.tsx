/**
 * @description Component-SettingSubCard
 */
import { FC } from 'react';

import GlobalFormSetting from '@/pages/components/GlobalFormSettings';
// import './index.less';
interface IPropTypes {
  onSave: () => void;
  isMobile?: boolean;
  isSpot?: boolean;
}
const SettingSubCard: FC<IPropTypes> = function (props) {
  return (
    <div className="syn-SettingSubCard">
      <GlobalFormSetting isSpot={props.isSpot} isMobile={props.isMobile} onSave={props.onSave} />
    </div>
  );
};

export default SettingSubCard;
