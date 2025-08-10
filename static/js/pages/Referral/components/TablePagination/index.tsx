/**
 * @description Component-LeaderTablePagination
 */
import './index.less';

import { Pagination } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { REFERRAL_PAGE_SIZE } from '@/constants/referral';
import { ReactComponent as ChevronRight } from '@/pages/TGP/assets/svg/icon_chevron_right.svg';
interface IPropTypes {
  className?: string;
  total: number;
  page: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}
const TablePagination: FC<IPropTypes> = function ({ total, onPageChange, page, pageSize = REFERRAL_PAGE_SIZE }) {
  const { t } = useTranslation();
  return (
    <div className={classNames('syn-table-pagination')}>
      <>
        <Pagination
          prevIcon={<ChevronRight className="syn-table-pagination-rotate" />}
          nextIcon={<ChevronRight />}
          pageSize={pageSize}
          total={total}
          current={page}
          showSizeChanger={false}
          defaultCurrent={1}
          showTotal={(_, [startNumber, endNumber]) => {
            return (
              <div className="syn-table-pagination-left">
                {total === 0
                  ? t('affiliates.pagination.zeroPagination')
                  : t('affiliates.pagination.paginationLine', {
                      startNumber,
                      endNumber,
                      total,
                    })}
              </div>
            );
          }}
          onChange={onPageChange}
        />
      </>
    </div>
  );
};

export default TablePagination;
