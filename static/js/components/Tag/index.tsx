/**
 * @description Component-tag
 */
import './index.less';

import { Tag as AntTag, TagProps } from 'antd';
import cls from 'classnames';
import { FC, useMemo } from 'react';
interface ITagProps extends TagProps {
  type?: 'primary';
}
const Tag: FC<ITagProps> = function ({ children, type, ...props }) {
  const typeClass = useMemo(() => {
    if (!type) return '';
    const map = {
      primary: 'syn-tag-primary',
    };
    return map[type];
  }, [type]);
  return (
    <AntTag className={cls('syn-tag', typeClass)} {...props}>
      {children}
    </AntTag>
  );
};

export default Tag;
