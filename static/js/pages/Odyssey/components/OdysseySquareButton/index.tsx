/**
 * @description Component-OdysseySquareButton
 */
import './index.less';

import { FC } from 'react';

import { Button } from '@/components/Button';
import { IButtonProps } from '@/types/button';

const OdysseySquareButton: FC<IButtonProps> = function (props) {
  return <Button {...props} className="syn-odyssey-square-button" />;
};

export default OdysseySquareButton;
