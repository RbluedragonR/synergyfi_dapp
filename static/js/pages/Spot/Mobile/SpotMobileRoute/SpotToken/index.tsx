import TokenLogo from '@/components/TokenLogo';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { TokenInfoInSpot } from '@/features/spot/types';
import classNames from 'classnames';
import './index.less';
export default function SpotToken({
  token,
  amountBn,
  type,
}: {
  token: TokenInfoInSpot;
  amountBn?: WrappedBigNumber;
  type: 'from' | 'to' | 'middle';
}) {
  return (
    <div className={classNames('syn-spot-route-mobile-token', type)}>
      {token && <TokenLogo isSpot={true} token={token} size={32} />}
      <div className="syn-spot-route-content-token-right ">
        {amountBn && !amountBn.eq(0) && <span>{amountBn.formatNumberWithTooltip({ isShowTBMK: true })}</span>}
        {token?.symbol}
      </div>
    </div>
  );
}
