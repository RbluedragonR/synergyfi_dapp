import { LeaderboardIcon } from '@/assets/svg/icons/leaderboard';
import { SecondGlobalModalType } from '@/constants';
import { CampaignStatus, CampaignStatusInfo } from '@/constants/campaign';
import { useSecondModal } from '@/features/global/hooks';
import classNames from 'classnames';
import { ComponentProps, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';
export default function CampaignCardContainer({
  className,
  href,
  ...others
}: ComponentProps<'div'> & { href: string }) {
  return (
    <div
      {...others}
      onClick={(e) => {
        if (
          !['A', 'BUTTON'].includes((e.target as HTMLElement).tagName) &&
          !('syn-campaign-card-tags-hovered' === (e.target as HTMLElement).className)
        ) {
          window.open(href, '_blank');
        }
      }}
      className={classNames('syn-campaign-card-container', className)}
    />
  );
}

export const CampaignCardTag = ({
  className,
  backgroundColor,
  color,
  hoverBackgroundColor,
  hoverColor,
  ...others
}: ComponentProps<'a'> & {
  backgroundColor: string;
  color: string;
  hoverBackgroundColor: string;
  hoverColor: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  return (
    <a
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor: isHovered ? hoverBackgroundColor : backgroundColor,
        color: isHovered ? hoverColor : color,
      }}
      {...others}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames('syn-campaign-card-tag', className)}
    />
  );
};
function isHidden(parent: HTMLElement, child: HTMLElement) {
  return child.offsetWidth > parent.offsetWidth;
}
export const CampaignCardTags = ({ className, ...others }: ComponentProps<'div'>) => {
  const [isPopShown, setIsPopShown] = useState(false);
  const [parentWidth, setParentWidth] = useState(0);
  const [parentTop, setParentTop] = useState(0);
  const [parentLeft, setParentLeft] = useState(0);
  const childRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const handleMouseOver = () => {
    if (parentRef.current && childRef.current && isHidden(parentRef.current, childRef.current)) {
      setParentWidth(parentRef.current.offsetWidth);
      setParentTop(parentRef.current.getBoundingClientRect().y);
      setParentLeft(parentRef.current.getBoundingClientRect().x);
      setIsPopShown(true);
    }
  };
  const handlePopupMouseLeave = () => {
    setIsPopShown(false);
  };
  return (
    <div
      {...others}
      onMouseOver={() => handleMouseOver()}
      className={classNames('syn-campaign-card-tags', className)}
      ref={parentRef}>
      <div ref={childRef} className="syn-campaign-card-tags-items">
        {others.children}
      </div>

      {isPopShown && (
        <div
          className="syn-campaign-card-tags-hovered"
          onMouseLeave={handlePopupMouseLeave}
          style={{ width: parentWidth, position: 'fixed', top: parentTop, left: parentLeft }}>
          {others.children}
        </div>
      )}
    </div>
  );
};

export const CampaignStatusTag = ({
  className,
  campaignStatus,
  ...others
}: ComponentProps<'div'> & {
  campaignStatus: CampaignStatus;
}) => {
  return (
    <div {...others} className={classNames('syn-campaign-status-tag', className)}>
      <div
        className="syn-campaign-status-tag-circle"
        style={{ backgroundColor: CampaignStatusInfo[campaignStatus].color }}
      />
      {campaignStatus}
    </div>
  );
};

export const CampaignLeaderboardBtn = ({ className, onClick }: ComponentProps<'button'>) => {
  const { t } = useTranslation();
  const { toggleModal } = useSecondModal(SecondGlobalModalType.CAMPAIGN_LEADERBOARD);

  return (
    <button
      className={classNames(className, 'syn-campaign-leaderboard-tag')}
      onClick={(e) => {
        onClick?.(e);
        toggleModal();
      }}>
      <LeaderboardIcon />
      {t('common.leaderboard')}
    </button>
  );
};
