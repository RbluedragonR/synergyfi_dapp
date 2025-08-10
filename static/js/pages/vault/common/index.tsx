import { Flex } from 'antd';
import { ComponentProps, ReactNode } from 'react';
import './index.less';
export const UsdValueContainer = ({
  topNode,
  bottomNode,
  ...props
}: Omit<ComponentProps<typeof Flex>, 'children'> & {
  topNode: ReactNode;
  bottomNode: ReactNode;
}) => {
  return (
    <Flex {...props} vertical gap={4} align="end" className="syn-usd-value-container">
      <div className="syn-usd-value-container-top">{topNode}</div>
      <div className="syn-usd-value-container-bottom">{bottomNode}</div>
    </Flex>
  );
};
