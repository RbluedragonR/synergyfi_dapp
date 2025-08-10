import { Button } from '@/components/Button';
import imgBgSrc from '../assets/images/end_bg.png';
import { ArrowRight } from '../assets/svg';
import BenefitCard from './components/BenefitCard';
import './index.less';
export default function OdysseyEnd() {
  return (
    <div className="syn-odyssey-end">
      <img src={imgBgSrc} className="syn-odyssey-end-img-top" />
      <div className="syn-odyssey-end-content">
        <h1 className="syn-odyssey-end-title">The Oyster Odyssey campaign has ended. </h1>
        <h3 className="syn-odyssey-end-subtitle">Stay tuned for the Season 1 Airdrop.</h3>
        <a
          target="_blank"
          rel="noreferrer"
          href={'https://medium.com/synfutures/introducing-synfutures-foundation-and-the-f-token-207bf843f0eb'}>
          <Button className="syn-odyssey-end-learn-more-btn" type="outline">
            Learn More <ArrowRight />
          </Button>
        </a>
      </div>

      <BenefitCard />
    </div>
  );
}
