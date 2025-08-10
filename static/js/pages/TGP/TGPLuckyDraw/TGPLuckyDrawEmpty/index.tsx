/**
 * @description Component-TGPLuckyDrawEmpty
 */
import './index.less';

import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import OdysseyButton from '@/pages/Odyssey/components/OdysseyButton';
interface IPropTypes {
  className?: string;
}
const TGPLuckyDrawEmpty: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const scrollToTop = useCallback(() => {
    const tgpEl = document.getElementById('tgp');
    if (tgpEl) {
      tgpEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);
  return (
    <div className="syn-tgp-lucky-draw-empty">
      <div className="syn-tgp-lucky-draw-empty-container">
        {t('tgp.luckydraw.joinAndShare')}
        <OdysseyButton onClick={scrollToTop} className="primary">
          {t('tgp.luckydraw.joinNow')}
        </OdysseyButton>
      </div>
    </div>
  );
};

export default TGPLuckyDrawEmpty;
