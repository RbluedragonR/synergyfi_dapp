import React, { useState } from 'react';
import { HelpCircle } from 'react-feather';
import { ImageProps } from 'rebass';

const BAD_SRCS: { [tokenAddress: string]: true } = {};
interface ILogoProps extends Pick<ImageProps, 'style' | 'alt' | 'className'> {
  srcs: string[];
  width: string | number;
  height: string | number;
}

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
const Logo = function ({ srcs, alt, ...rest }: ILogoProps): JSX.Element {
  const [, refresh] = useState<number>(0);

  const src: string | undefined = srcs.find((src) => !BAD_SRCS[src]);

  if (src) {
    return (
      <img
        loading="lazy"
        {...rest}
        alt={alt}
        src={src}
        onError={() => {
          if (src) BAD_SRCS[src] = true;
          refresh((i) => i + 1);
        }}
      />
    );
  }

  return <HelpCircle {...rest} />;
};

export default React.memo(Logo, (prevProps, nextProps) => {
  return prevProps.srcs.join() === nextProps.srcs.join();
});
