import { socialInfos } from '@/constants/routes';
import { useGa } from '@/hooks/useGa';
import { GaCategory } from '@/utils/analytics';
import { useCallback } from 'react';
import './index.less';
export default function SocialList(): JSX.Element {
  const gaEvent = useGa();
  const onMenuClick = useCallback(
    (menuKey: string) => {
      gaEvent({ category: GaCategory.HEADER, action: `Community-Click on${menuKey}` });
    },
    [gaEvent],
  );
  return (
    <div className="syn-social-list">
      {Object.entries(socialInfos).map(([socialId, info]) => {
        return (
          <a
            key={`${socialId}_HeaderMenuDropdown`}
            href={info.href}
            onClick={() => onMenuClick(socialId)}
            target="_blank"
            rel="noreferrer"
            className="syn-social-list-link">
            {info.icon}
          </a>
        );
      })}
    </div>
  );
}
