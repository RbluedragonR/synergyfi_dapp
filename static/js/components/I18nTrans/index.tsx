/**
 * @description Component-I18nTrans
 */
import { FC, useMemo } from 'react';

interface IPropTypes {
  msg?: string | JSX.Element;
  className?: string;
}
const I18nTrans: FC<IPropTypes> = function ({ msg }) {
  const isNormalString = useMemo(() => {
    return typeof msg === 'string';
  }, [msg]);
  if (isNormalString) {
    return <div className="syn-i18n-trans" dangerouslySetInnerHTML={{ __html: (msg as string) || '' }} />;
  }
  return <div className="syn-i18n-trans">{msg}</div>;
};

export default I18nTrans;
