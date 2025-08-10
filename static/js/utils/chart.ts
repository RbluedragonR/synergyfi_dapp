import { DepthChartData } from '@synfutures/sdks-perp-datasource';
import _ from 'lodash';

export function transformData(data: DepthChartData[] | undefined): DepthChartData[] {
  data = _.cloneDeep(data);
  if (data) {
    let baseAcc = 0;
    const dataRaw = [{ ..._.first(data), base: 0 }, ...data];
    const result = dataRaw.map((d) => {
      baseAcc = baseAcc + d.base;
      d.base = baseAcc;
      return d;
    });
    return result as DepthChartData[];
  }
  return [];
}
