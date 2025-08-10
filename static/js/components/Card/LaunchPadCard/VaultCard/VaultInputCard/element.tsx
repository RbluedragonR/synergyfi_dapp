import Alert from '@/components/Alert';
import { SwitchBtn } from '@/components/Button';
import FormInputComponent from '@/components/FormInput';
import I18nTrans from '@/components/I18nTrans';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { useMockDevTool } from '@/components/Mock';
import WrappedButton from '@/components/WrappedButton';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedVault } from '@/entities/WrappedVault';
import { useTokenBalance } from '@/features/balance/hook';
import { useNativeToken, useWrappedNativeToken } from '@/features/chain/hook';
import { useVaultUserPendingWithdraw } from '@/features/vault/hook';
import { AccountAction, useGoToAccountBalanceAction } from '@/hooks/portfolio/usePortfolioParams';
import useVaultDepositInput from '@/hooks/vault/useDepositInput';
import useVaultWithdrawInput from '@/hooks/vault/useWithdrawInput';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { useWalletAccount } from '@/hooks/web3/useWalletNetwork';
import NativeTokenSelector from '@/pages/components/Portfolio/Vault/AccountButtons/Deposit/DepositModal/DepositForm/NativeTokenSelector';
import { TokenInfo } from '@/types/token';
import { Stage } from '@synfutures/sdks-perp-launchpad';
import classNames from 'classnames';
import { formatEther } from 'ethers/lib/utils';
import { ComponentProps, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import './element.less';
export enum VaultInputTabKey {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}
type VaultInputBottomCardProps = {
  checkMinApprove?: boolean;
  spenderAddress: string;
  marginToken?: TokenInfo;
  activeTabKey: VaultInputTabKey;
  availableValue: WrappedBigNumber;
  loading?: boolean;
  noNeedApprove?: boolean;
  inputAmount: string;
  inputAmountStrChanged: (inputAmountStr: string) => void;
  afterApproved: () => void;
  isRequestWithdraw?: boolean;
  pendingWithdrawalAmount?: string;
  quoteSymbol?: string;
  onClickMax: () => void;
  prefixNode?: React.ReactNode;
  aboveButtonNode?: React.ReactNode;
  belowButtonNode?: React.ReactNode;
  belowInputNode?: React.ReactNode;
  min?: string;
  placeHolder?: string;
  disabledOverride?: boolean;
};

export const MaxBtn = (props: ComponentProps<'span'>) => (
  <span {...props} className="syn-vault-input-bottom-card-max">
    MAX
  </span>
);
export function VaultInputBottomCard({
  marginToken,
  spenderAddress,
  activeTabKey,
  availableValue,
  inputAmount,
  loading,
  noNeedApprove,
  inputAmountStrChanged,
  afterApproved,
  pendingWithdrawalAmount,
  quoteSymbol,
  onClickMax,
  isRequestWithdraw,
  prefixNode,
  aboveButtonNode: abroveButtonNode,
  belowButtonNode,
  belowInputNode,
  checkMinApprove,
  min,
  placeHolder,
  disabledOverride: disabledOvervided,
}: VaultInputBottomCardProps) {
  const { isMobile } = useMediaQueryDevice();
  const { t } = useTranslation();

  return (
    <>
      {prefixNode}
      <div className="syn-vault-input-card-amount">
        <span className="syn-vault-input-card-amount-title">{t('launchpad.amount')}</span>
      </div>
      <FormInputComponent
        inputProps={{
          type: 'text',
          pattern: '^[0-9]*[.,]?[0-9]*$',
          inputMode: 'decimal',
          autoComplete: 'off',
          id: 'earnAmount',
          autoCorrect: 'off',
          onKeyDown: (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault(),
          step: 1e18,
        }}
        placeHolder={placeHolder || '0'}
        min={min}
        max={availableValue.stringValue}
        className="syn-vault-input-card-form-input-component"
        inputAmountStr={inputAmount}
        inputAmountStrChanged={inputAmountStrChanged}
        tokenInfo={marginToken}
      />
      {belowInputNode}
      <div className="syn-vault-input-card-available">
        <span className="syn-vault-input-card-available-title">
          {t(`launchpad.vaultInputTab.${activeTabKey}.available`)}
          <MaxBtn onClick={onClickMax} />
        </span>
        <span className="syn-vault-input-card-available-value">
          {availableValue.formatNumberWithTooltip({
            isShowTBMK: true,
            suffix: marginToken?.symbol,
            isShowApproximatelyEqualTo: false,
            showToolTip: true,
          })}
        </span>
      </div>
      {abroveButtonNode}
      <WrappedButton
        disabledOvervided={disabledOvervided}
        checkMinApprove={checkMinApprove}
        maxAmount={availableValue.wadValue}
        spenderAddress={spenderAddress}
        type="primary"
        className={classNames('syn-vault-input-card-btn', { pending: !!pendingWithdrawalAmount })}
        unConnectedText={isMobile ? t('mobile.earnUnConnected') : ''}
        afterApproved={afterApproved}
        amount={WrappedBigNumber.from(inputAmount || 0).wadValue}
        marginToken={marginToken}
        loading={loading}
        showChainIcon={false}
        noNeedApprove={noNeedApprove}>
        {isRequestWithdraw && pendingWithdrawalAmount
          ? t('launchpad.description.requestWithdraw', {
              withdrawalText: `${pendingWithdrawalAmount} ${quoteSymbol}`,
            })
          : t(`launchpad.vaultInputTab.${activeTabKey}.btn`)}
      </WrappedButton>
      {belowButtonNode}
    </>
  );
}

export const VaultInputDepositBottomCard = ({ vault }: { vault: WrappedVault }) => {
  const chainId = vault.quoteToken.chainId;
  const {
    depositInputAmount,
    updateDepositInputAmount,
    handleClickMax,
    handleDeposit,
    isDepositing,
    isVaultCanBeNative,
    setMarginTokenAddr,
    availableValue,
    marginToken,
    isMarginTokenNative,
    isTokenBalanceLessThanMinDeposit,
    isInputLessThanMinDeposit,
    isTokenPlusAccountBalanceGreaterMinDeposit,
  } = useVaultDepositInput(vault);
  const wrappedTokenBalance = useTokenBalance(vault?.quoteToken.address, chainId);
  const { goToAccountBalanceAction } = useGoToAccountBalanceAction();
  const { t } = useTranslation();
  const account = useWalletAccount();
  const NativeTokenSelectorNode = useMemo(() => {
    if (isVaultCanBeNative) {
      return (
        <NativeTokenSelector
          tokenBalance={wrappedTokenBalance}
          onSideChange={(address) => {
            setMarginTokenAddr(address);
          }}
        />
      );
    }
    return null;
  }, [isVaultCanBeNative, setMarginTokenAddr, wrappedTokenBalance]);
  const minQuoteAmountStr = useMemo(() => {
    return formatEther(vault.minQuoteAmount.wadValue).toString();
  }, [vault.minQuoteAmount]);
  return (
    <VaultInputBottomCard
      disabledOverride={
        vault.stageForUi === Stage.SUSPENDED || isInputLessThanMinDeposit || isTokenBalanceLessThanMinDeposit
      }
      placeHolder={vault.minQuoteAmount.gt(0) ? t('launchpad.minimumDeposit', { amount: minQuoteAmountStr }) : '0'}
      checkMinApprove
      prefixNode={NativeTokenSelectorNode}
      loading={isDepositing}
      onClickMax={handleClickMax}
      activeTabKey={VaultInputTabKey.DEPOSIT}
      availableValue={availableValue}
      inputAmount={depositInputAmount}
      min={minQuoteAmountStr}
      inputAmountStrChanged={updateDepositInputAmount}
      afterApproved={handleDeposit}
      spenderAddress={vault.vaultAddress}
      marginToken={marginToken}
      aboveButtonNode={
        <>
          {isMarginTokenNative && (
            <Alert
              message={
                <I18nTrans
                  msg={t('launchpad.description.depositEth', {
                    nativeToken: marginToken?.symbol,
                    wrappedToken: vault?.quoteToken.symbol,
                  })}
                />
              }
              type="info"
              showIcon></Alert>
          )}
          {(isTokenBalanceLessThanMinDeposit || isInputLessThanMinDeposit) &&
            account &&
            vault.stageForUi !== Stage.SUSPENDED && (
              <Alert
                style={{ marginTop: 8 }}
                type="warning"
                message={
                  <>
                    {t('launchpad.description.minDeposit', {
                      amount: minQuoteAmountStr,
                      tokenSymbol: marginToken?.symbol,
                    })}
                    {isTokenBalanceLessThanMinDeposit && (
                      <>
                        {' '}
                        &nbsp;
                        {isTokenPlusAccountBalanceGreaterMinDeposit && (
                          <span
                            onClick={() => goToAccountBalanceAction(AccountAction.withdraw, vault.quoteToken.address)}
                            className="syn-vidbc-underline">
                            {t('launchpad.withdrawFromAccount')}
                          </span>
                        )}
                      </>
                    )}
                  </>
                }
                showIcon
              />
            )}
        </>
      }
      belowButtonNode={
        <div className="syn-vault-input-card-reminder">
          <Trans
            values={{
              tokenName: vault.quoteToken.symbol,
              tokenAmount: vault.targetTvl.formatDisplayNumber(),
            }}
            i18nKey={`launchpad.description.vaultInputCard.${vault.stageForUi}.${VaultInputTabKey.DEPOSIT}`}
            components={{ b: <b /> }}
          />
        </div>
      }
    />
  );
};

export const VaultInputWithdrawBottomCard = ({
  vault,
  activeTabKey,
}: {
  vault: WrappedVault;
  activeTabKey: VaultInputTabKey;
}) => {
  const userAddr = useUserAddr();
  const chainId = useChainId();
  const {
    withdrawInputAmount,
    updateWithdrawInputAmount,
    isRequestWithdraw,
    handleClickMax,
    debouncedWithdrawInputAmount,
    handleWithdraw,
    isWithdrawing,
    isVaultCanBeNative,
    marginToken,
    setMarginTokenAddr,
    haveArrear,
  } = useVaultWithdrawInput(vault, userAddr || '');
  const { userPendingWithdrawInfo } = useVaultUserPendingWithdraw(chainId, userAddr, vault?.vaultAddress);
  const { isMockVaultShowWithdrawlRequest } = useMockDevTool();
  const pendingWithdrawalAmount = useMemo(() => {
    const num = userPendingWithdrawInfo?.quantity;
    const amount = WrappedBigNumber.from(num || debouncedWithdrawInputAmount || 0);
    return amount.notEq(0)
      ? amount.formatDisplayNumber({
          isShowTBMK: true,
        })
      : undefined;
  }, [debouncedWithdrawInputAmount, userPendingWithdrawInfo?.quantity]);
  const nativeToken = useNativeToken(vault.quoteToken.chainId);
  const wrappedNativeToken = useWrappedNativeToken(vault.quoteToken.chainId);
  const { t } = useTranslation();
  const availableValue = vault.getUserDeposit(userAddr);
  const aboveButtonNode = useMemo(() => {
    return (
      isVaultCanBeNative && (
        <>
          <div className="syn-vault-input-withdraw-bottom-card-switch">
            <span>
              {t('common.depositForm.withdrawNativeToken', {
                wrappedToken: wrappedNativeToken?.symbol,
                nativeToken: nativeToken?.symbol,
              })}
            </span>
            <SwitchBtn
              isChecked={marginToken?.address === nativeToken?.address}
              onSwitch={(checked) => {
                nativeToken && setMarginTokenAddr(checked ? nativeToken?.address : vault?.quoteToken.address);
              }}
            />
          </div>
        </>
      )
    );
  }, [
    isVaultCanBeNative,
    marginToken?.address,
    nativeToken,
    setMarginTokenAddr,
    t,
    vault?.quoteToken.address,
    wrappedNativeToken?.symbol,
  ]);
  const disabledBtn = useMemo(() => {
    return vault.stageForUi === Stage.SUSPENDED || haveArrear || !vault.getUserDeposit(userAddr)?.gt(0);
  }, [haveArrear, userAddr, vault]);
  return (
    <VaultInputBottomCard
      marginToken={marginToken}
      disabledOverride={disabledBtn || userPendingWithdrawInfo?.quantity.gt(0)}
      spenderAddress={vault.vaultAddress}
      loading={isWithdrawing}
      onClickMax={handleClickMax}
      isRequestWithdraw={
        isMockVaultShowWithdrawlRequest || isRequestWithdraw || userPendingWithdrawInfo?.quantity.gt(0)
      }
      activeTabKey={activeTabKey}
      availableValue={availableValue}
      pendingWithdrawalAmount={pendingWithdrawalAmount}
      quoteSymbol={vault.quoteToken.symbol}
      inputAmount={withdrawInputAmount}
      noNeedApprove
      inputAmountStrChanged={updateWithdrawInputAmount}
      afterApproved={handleWithdraw}
      aboveButtonNode={aboveButtonNode}
      belowButtonNode={
        <div className="syn-vault-input-card-reminder">
          {isMockVaultShowWithdrawlRequest || userPendingWithdrawInfo || isRequestWithdraw ? (
            t('launchpad.description.withdrawalTime')
          ) : (
            <Trans
              values={{
                tokenName: vault.quoteToken.symbol,
                tokenAmount: vault.targetTvl.formatDisplayNumber(),
              }}
              i18nKey={`launchpad.description.vaultInputCard.${vault.stageForUi}.${activeTabKey}`}
              components={{ b: <b /> }}
            />
          )}
        </div>
      }
    />
  );
};
