import Loading from '@/components/Loading';
import PairInfoSkeleton from '@/pages/components/PairInfo/PairInfoSkeleton';
import './index.less';
export function DesktopTradeFallback() {
  return (
    <div className="desktop-trade-fallback">
      <div className="desktop-trade-fallback-top">
        <div className="desktop-trade-fallback-top-left">
          <PairInfoSkeleton />
          <Loading spinning />
        </div>
        <div className="desktop-trade-fallback-top-right" />
      </div>

      <div className="desktop-trade-fallback-bottom-right" />
    </div>
  );
}
