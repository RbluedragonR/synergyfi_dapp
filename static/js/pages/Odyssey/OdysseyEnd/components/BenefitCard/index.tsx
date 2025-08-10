import { B1, B2, B3 } from '@/pages/Odyssey/assets/svg';
import './index.less';
export default function BenefitCard() {
  return (
    <div className="syn-benefit-card">
      <div className="syn-benefit-card-content">
        <div className="syn-benefit-card-title">F Token Staking Benefits</div>
        <div className="syn-benefit-card-items">
          <div className="syn-benefit-card-item">
            <B1 />
            Airdrop Boost
          </div>
          <div className="syn-benefit-card-item">
            <B2 />
            Voting Power
          </div>
          <div className="syn-benefit-card-item">
            <B3 />
            Fee Rebate
          </div>
        </div>
      </div>
    </div>
  );
}
