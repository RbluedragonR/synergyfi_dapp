import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { TGP_SHARED_JOIN_STATUS } from '@/constants/storage';
import { useTGPDappConfig } from '@/features/tgp/hooks';

export function useTGPWeek(week: number | undefined):
  | {
      weekStr: string;
      weekDates: string;
    }
  | undefined {
  const { t } = useTranslation();
  const config = useTGPDappConfig();
  if (!week || !config) return;
  const weekStr = t(`tgp.week.week${week}`);
  let weekDates = '';
  const weekConfig = config.weeks.find((w) => w.week === week);
  if (weekConfig) {
    weekDates = `${moment.utc(weekConfig.startTs).local().format('MM/DD')}~${moment
      .utc(weekConfig.endTs)
      .local()
      .format('MM/DD')}`;
  }
  return { weekStr, weekDates };
}

export function getWeekNumByWeekStr(weekStr: string): number {
  return parseInt(weekStr.replace('week', ''), 10);
}

export function getShareStorageKey(
  type: 'luckyDraw' | 'rank',
  isMaster: boolean,
  week: number,
  userAddr: string,
  modalStatus: 'claim' | 'shareToGetTicket' = 'claim',
): string {
  return `${TGP_SHARED_JOIN_STATUS}-${type}-${isMaster ? 'master' : 'open'}-week${week}-${modalStatus}-${userAddr}`;
}

export function getRandomTwitterClientId(ids: string[]): string {
  const randomIndex = Math.floor(Math.random() * ids.length);
  return ids[randomIndex];
}
