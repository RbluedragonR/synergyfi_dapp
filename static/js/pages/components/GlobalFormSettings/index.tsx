// import { CHAIN_ID } from '@derivation-tech/context';
import classNames from 'classnames';
import { FC, memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import SettingSelectorFormItem from '@/components/SettingSelector/SettingSelectorFormItem';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
// import { CHAIN_ID } from '@derivation-tech/context';
import { DEADLINE_THRESHOLDS, SLIPPAGE_THRESHOLDS } from '@/constants/global';
import { setGlobalConfig } from '@/features/global/actions';
import { useGlobalConfig, useResetTempGlobalConfig } from '@/features/global/hooks';
import { useAppDispatch } from '@/hooks';
import { useGa } from '@/hooks/useGa';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { SettingSelectorData } from '@/types/global';
import { GaCategory } from '@/utils/analytics';
import { saveGlobalConfigToLocalForage } from '@/utils/storage';

import { QUERY_KEYS } from '@/constants/query';
import { useConfigStoreWithChainId } from '@/features/global/store';
import { useSpotState } from '@/features/spot/store';
import { queryClient } from '@/pages/App';
import SpotSwapPools from '@/pages/Spot/SpotSwapPools';
import { Button } from '../../../components/Button';
import TradeSettingAlert from './TradeSettingAlert';
import './index.less';
interface IGlobalSettingsProps {
  onSave: () => void;
  isMobile?: boolean;
  isSpot?: boolean;
}
export const GlobalFormSetting: FC<IGlobalSettingsProps> = ({ onSave, isMobile, isSpot }) => {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  const globalConfig = useGlobalConfig(chainId);
  const resetConfigByChain = useResetTempGlobalConfig(chainId);
  const { configTemByChain, setConfigTempByChainId } = useConfigStoreWithChainId(chainId);
  const { sellAmount, token0: sellToken, token1: buyToken, setPoolsToExclude, poolsToExcludeTemp } = useSpotState();
  const gaEvent = useGa();
  const { t } = useTranslation();
  useEffect(() => {
    setConfigTempByChainId(globalConfig);
  }, [globalConfig]);

  const updateSpotQueries = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.SPOT.SIMULATE_SWAP(chainId, userAddr, sellAmount, sellToken?.address, buyToken?.address),
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.SPOT.SIMULATE_BEST_ROUTE(
        chainId,
        userAddr,
        sellAmount,
        sellToken?.address,
        buyToken?.address,
      ),
    });
  }, [buyToken?.address, chainId, sellAmount, sellToken?.address, userAddr]);
  const deadlineDatas = useMemo(() => {
    return [
      {
        key: '5',
        value: (
          <span>
            <span className="font-number">5</span>
            {' Min'}
          </span>
        ),
        desc: 'Min',
      },
      {
        key: '10',
        value: (
          <span>
            <span className="font-number">10</span>
            {' Min'}
          </span>
        ),
        desc: 'Min',
      },
      {
        key: '15',
        value: (
          <span>
            <span className="font-number">15</span>
            {' Min'}
          </span>
        ),
        desc: 'Min',
      },
    ] as SettingSelectorData[];
  }, []);
  const slippageDatas = useMemo(() => {
    return [
      { key: '0.1', value: <span className="font-number">{'0.1%'}</span> },
      { key: '0.5', value: <span className="font-number">{'0.5%'}</span> },
      { key: '1', value: <span className="font-number">{'1%'}</span> },
    ] as SettingSelectorData[];
  }, []);

  const updateSlippage = useCallback(
    (value: string) => {
      setConfigTempByChainId({ ...configTemByChain, slippage: value });
      gaEvent({
        category: GaCategory.SETTING_MODULE,
        action: 'Setting-Click on Setting',
      });
    },
    [setConfigTempByChainId, configTemByChain, gaEvent],
  );
  const updateDeadline = useCallback(
    (value: string) => {
      setConfigTempByChainId({ ...configTemByChain, deadline: value });
      gaEvent({
        category: GaCategory.SETTING_MODULE,
        action: 'Setting-Click on Setting',
      });
    },
    [setConfigTempByChainId, configTemByChain, gaEvent],
  );
  const saveConfig = useCallback(() => {
    if (chainId) {
      const newConfig = { ...configTemByChain };
      saveGlobalConfigToLocalForage(newConfig);
      dispatch(setGlobalConfig(newConfig));
      setPoolsToExclude(poolsToExcludeTemp);
      onSave();
      updateSpotQueries();
      gaEvent({
        category: GaCategory.SETTING_MODULE,
        action: 'Setting-Click on Save',
        label: JSON.stringify(newConfig),
      });
    }
  }, [chainId, configTemByChain, dispatch, setPoolsToExclude, poolsToExcludeTemp, onSave, updateSpotQueries, gaEvent]);

  const resetConfig = useCallback(() => {
    resetConfigByChain();
    gaEvent({
      category: GaCategory.SETTING_MODULE,
      action: 'Setting-Click on Reset',
    });
  }, [resetConfigByChain, gaEvent]);

  return (
    <div className={classNames('global-form-setting', isMobile && 'mobile')}>
      <SettingSelectorFormItem
        formClassName="global-form-setting__item"
        label={
          <UnderlineToolTip title={t('common.walletCardWrapper.formSettings.slippageTooltip')}>
            {t('common.walletCardWrapper.formSettings.slippageLabel')}
          </UnderlineToolTip>
        }
        keyChanged={updateSlippage}
        value={configTemByChain.slippage}
        isMobile={isMobile}
        customInputLabel="%"
        datas={slippageDatas}
        checkThreshold={true}
        threshold={{
          max: SLIPPAGE_THRESHOLDS.MAX.toString(),
          min: SLIPPAGE_THRESHOLDS.MIN.toString(),
          default: SLIPPAGE_THRESHOLDS.DEFAULT.toString(),
          low: SLIPPAGE_THRESHOLDS.LOW,
          high: SLIPPAGE_THRESHOLDS.HIGH,
        }}
      />
      <SettingSelectorFormItem
        formClassName="global-form-setting__item"
        label={
          <UnderlineToolTip title={t('common.walletCardWrapper.formSettings.deadlinesTooltip')}>
            {t('common.walletCardWrapper.formSettings.deadline')}
          </UnderlineToolTip>
        }
        keyChanged={updateDeadline}
        value={configTemByChain.deadline}
        isMobile={isMobile}
        customInputLabel="Min"
        datas={deadlineDatas}
        checkThreshold={true}
        threshold={{
          max: DEADLINE_THRESHOLDS.MAX.toString(),
          min: DEADLINE_THRESHOLDS.MIN.toString(),
          default: DEADLINE_THRESHOLDS.DEFAULT.toString(),
        }}
      />
      <TradeSettingAlert
        slippage={configTemByChain.slippage}
        deadline={configTemByChain.deadline}
        gasPrice={configTemByChain.gasPrice}></TradeSettingAlert>
      {isSpot && <SpotSwapPools />}
      <div className={classNames('global-form-setting__footer', isMobile && 'mobile')}>
        <Button ghost onClick={resetConfig}>
          {t('common.reset')}
        </Button>
        <Button type="primary" disabled={!configTemByChain.slippage || !configTemByChain.deadline} onClick={saveConfig}>
          {t('common.confirm')}
        </Button>
      </div>
    </div>
  );
};
export default memo(GlobalFormSetting);
