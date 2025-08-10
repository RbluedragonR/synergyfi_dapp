/**
 * @description Component-LeaderTablePagination
 */
import './index.less';

import { Pagination } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TGP_PAGE_SIZE, TGP_TYPE } from '@/constants/tgp';
import { useTGPType } from '@/features/tgp/hooks';
import { ReactComponent as ChevronLeft } from '@/pages/TGP/assets/svg/icon_chevron_left.svg';
import { ReactComponent as ChevronRight } from '@/pages/TGP/assets/svg/icon_chevron_right.svg';
import { ReactComponent as IconRecent } from '@/pages/TGP/assets/svg/icon_title_recent.svg';
interface IPropTypes {
  className?: string;
  total: number;
  page: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  updatedAt: string;
}
const LeaderTablePagination: FC<IPropTypes> = function ({
  total,
  onPageChange,
  updatedAt,
  page,
  pageSize = TGP_PAGE_SIZE,
}) {
  const { t } = useTranslation();
  // const [startNumber, setStartNumber] = useState(1);
  // const [endNumber, setEndNumber] = useState(TGP_PAGE_SIZE);
  const tgpType = useTGPType();
  return (
    <div className={classNames('syn-leader-table-pagination', { master: tgpType === TGP_TYPE.MASTER })}>
      {tgpType !== TGP_TYPE.MASTER && (
        <>
          {/* <div className="syn-leader-table-pagination-left">
            {total === 0
              ? t('tgp.leaderboard.zeroPagination')
              : t('tgp.leaderboard.paginationLine', {
                  startNumber,
                  endNumber,
                  total,
                })}
          </div> */}
          <Pagination
            prevIcon={<ChevronLeft />}
            nextIcon={<ChevronRight />}
            pageSize={pageSize}
            total={total}
            current={page}
            showSizeChanger={false}
            defaultCurrent={1}
            showTotal={(_, range) => {
              return (
                <div className="syn-leader-table-pagination-left">
                  {total === 0
                    ? t('tgp.leaderboard.zeroPagination')
                    : t('tgp.leaderboard.paginationLine', {
                        startNumber: range[0] || 1,
                        endNumber: range[1] || TGP_PAGE_SIZE,
                        total,
                      })}
                </div>
              );
              // setStartNumber(range[0]);
              // setEndNumber(range[1]);
              // return null;
            }}
            onChange={onPageChange}
          />
        </>
      )}
      <div className="syn-leader-table-pagination-right">
        <IconRecent />
        {t('tgp.leaderboard.lastUpdated', {
          lastUpdated: moment.utc(updatedAt).local().format('MM/DD/YYYY HH:mm'),
        })}
      </div>
    </div>
  );
};

export default LeaderTablePagination;
