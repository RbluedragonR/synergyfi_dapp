/**
 * @description Component-OdysseyButton
 */
import './index.less';

import classNames from 'classnames';
import { FC } from 'react';

import { Button } from '@/components/Button';
import { IButtonProps } from '@/types/button';

const OdysseyButton: FC<IButtonProps> = function (props) {
  return <Button {...props} className={classNames('syn-odyssey-button', props.className)} />;
};

export default OdysseyButton;
