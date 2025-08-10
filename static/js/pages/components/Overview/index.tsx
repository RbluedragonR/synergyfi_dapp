import './index.less';

import { useEffect, useMemo, useState } from 'react';

import { useMockDevTool } from '@/components/Mock';
import { useFetchMarketBannerList } from '@/features/market/query';
import { preload } from '@/utils/image';
import { Carousel } from 'antd';
import SkeletonButton from 'antd/es/skeleton/Button';

export default function MarketBanner(): JSX.Element | null {
  const { data: bannerRes } = useFetchMarketBannerList();
  const bannerConfig = useMemo(() => bannerRes || [], [bannerRes]);

  const [numberOfLoaded, setNumberOfLoaded] = useState(0);
  const { isMockSkeleton } = useMockDevTool();
  const allLoaded = useMemo(() => {
    if (isMockSkeleton) {
      return false;
    }
    return numberOfLoaded >= bannerConfig?.length;
  }, [bannerConfig.length, isMockSkeleton, numberOfLoaded]);
  useEffect(() => {
    preload(
      bannerConfig?.map((config) => config.image),
      () => {
        setNumberOfLoaded((prev) => (prev += 1));
      },
    );
  }, [bannerConfig]);
  return (
    <div className="pair-banner-container">
      {/* <OverviewTitle /> */}
      {/* {chainId === CHAIN_ID.BASE ? (
        <Carousel autoplay autoplaySpeed={10000} slidesToShow={1} dotPosition="right" className="pair-banner">
          <BalanceCard
            loading={!pairs.length}
            titleLeft={{
              icon: <SmileCircle />,
              text: t('common.banners.basedDeposit'),
            }}
          />
          <NewListingCard pairs={pairs} />
          <TopVolumeCard pairs={pairs} />
        </Carousel>
      ) : (
        <Carousel autoplay autoplaySpeed={10000} slidesToShow={1} dotPosition="right" className="pair-banner">
          <EarnRewardCard />
          <BalanceCard loading={!pairs.length} />
          <TopVolumeCard pairs={pairs} />
        </Carousel>
      )} */}
      {allLoaded ? (
        <Carousel
          dots={{ className: 'pair-banner-container-item-dot' }}
          autoplay
          autoplaySpeed={10000}
          slidesToShow={1}
          dotPosition="right"
          className="pair-banner">
          {bannerConfig?.map((config) => (
            <a
              href={config.linkUrl}
              target={config.openNewTab ? '_blank' : '_self'}
              rel="noreferrer"
              className="pair-banner-container-item"
              key={config.image}>
              {/* <div className="pair-banner-container-item-title">{config.title}</div>
            <div className="pair-banner-container-item-subTitle">{config.subTitle}</div> */}
              <img className="pair-banner-container-item-bg" src={config.image} />
            </a>
          ))}
        </Carousel>
      ) : (
        <SkeletonButton size="small" shape="round" active block />
      )}
    </div>
  );
}
