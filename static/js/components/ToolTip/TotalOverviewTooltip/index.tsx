import TokenLogo from '@/components/TokenLogo';
import { TokenInfo } from '@/types/token';
import classNames from 'classnames';
import { ComponentProps, ReactNode } from 'react';
import './index.less';

type TotalOverviewTooltipProps = {
  title: string;
  value: ReactNode;
  data: (
    | {
        type: 'quote';
        subtitle?: string;
        items: {
          color: string;
          symbol: ReactNode;
          tokenAmount: ReactNode;
          usdAmount: ReactNode;
          token?: TokenInfo;
        }[];
      }
    | {
        type: 'usage';
        subtitle?: string;
        items: {
          title: string;
          value: ReactNode;
        }[];
      }
  )[];
  isDisplayTokenIconInsteadOfColorDot?: boolean;
} & ComponentProps<'div'>;
export default function TotalOverviewTooltip({
  title,
  value,
  data,
  className,
  isDisplayTokenIconInsteadOfColorDot,
  ...others
}: TotalOverviewTooltipProps): JSX.Element {
  return (
    <div className={classNames('syn-total-overview-tooltip', className)} {...others}>
      <div className="syn-total-overview-tooltip-title">
        <span>{title}</span>
        <span>{value}</span>
      </div>
      {data.map(({ subtitle, items, type }, i) => {
        if (items.length === 0) return null;
        return (
          <div key={`${title}_${others.id}_TotalOverviewTooltip_${i}`}>
            <div className="syn-total-overview-tooltip-table-container">
              {subtitle && <div className="syn-total-overview-tooltip-subtitle">{subtitle}</div>}
              <table className="syn-total-overview-tooltip-table">
                <tbody>
                  {type === 'usage' &&
                    items.map((item, j) => (
                      <tr
                        className="syn-total-overview-tooltip-table-usage-row"
                        key={`${type}_${others.id}_${subtitle}_${j}`}>
                        <td className="title">{item.title}</td>
                        <td className="value">{item.value}</td>
                      </tr>
                    ))}
                  {type === 'quote' &&
                    items.map((item, i) => {
                      return item.tokenAmount === undefined ? null : (
                        <tr
                          className="syn-total-overview-tooltip-table-row"
                          key={`${type}_${others.id}_${subtitle}_${i}`}>
                          <td className={classNames('point', isDisplayTokenIconInsteadOfColorDot && 'token-icon-dot')}>
                            {isDisplayTokenIconInsteadOfColorDot ? (
                              <TokenLogo size={12} token={item.token} />
                            ) : (
                              <span style={{ backgroundColor: item.color }} />
                            )}
                          </td>
                          <td className="symbol">{item.symbol}</td>
                          <td className="tokenAmount">{item.tokenAmount}</td>
                          <td className="usdAmount">{item.usdAmount}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            {i + 1 !== data.length && <div className="syn-total-overview-tooltip-table-separate-line" />}
          </div>
        );
      })}
    </div>
  );
}
