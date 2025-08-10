import './index.less';

export const FundingLegend = (): JSX.Element => {
  return (
    <div className="syn-funding-legend-wrapper">
      <div className="syn-funding-legend-container">
        <span className="syn-funding-legend-item">
          <svg width="8" height="2" viewBox="0 0 8 2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="8" height="2" rx="1" fill="#FF6666" />
          </svg>{' '}
          Pay
        </span>
        <span className="syn-funding-legend-item">
          <svg width="8" height="2" viewBox="0 0 8 2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="8" height="2" rx="1" fill="#14B84B" />
          </svg>{' '}
          Receive
        </span>
      </div>
    </div>
  );
};
