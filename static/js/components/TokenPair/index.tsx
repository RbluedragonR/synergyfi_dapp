import './index.less';

import { MarketType } from '@synfutures/sdks-perp';
import classNames from 'classnames';
import React, { useMemo } from 'react';

import { TokenInfo } from '@/types/token';

import { CHAIN_ID } from '@/constants/chain';
import { useTranslation } from 'react-i18next';
import Tag from '../Tag';
import TokenFavorite from '../TokenFavorite';
import TokenLogo from '../TokenLogo';
import TokenPairExpiry from './TokenPairExpiry';
import TokenPairLeverage from './TokenPairLeverage';
import TokenPairOracle from './TokenPairOracle';
import TokenPairSymbol from './TokenPairSymbol';
type TokenPairProps = {
  baseToken: TokenInfo;
  quoteToken: TokenInfo;
  marketType?: MarketType;
  expiry?: number;
  instrumentAddr?: string;
  showFavorite?: boolean;
  infoMode?: boolean;
  isInverse?: boolean;
  showOracle?: boolean;
  tokenSize?: number;
  highlightExpiry?: boolean;
  favoriteClicked?: (fav: boolean) => void;
  isShowLogo?: boolean;
  isShowExpiryTag?: boolean;
  showShortPerp?: boolean;
  leverage?: number;
  showLeverage?: boolean;
  extra?: React.ReactNode;
  verticalMode?: boolean;
  dropdownIcon?: React.ReactNode;
  mouseOver?: () => void;
  mouseLeave?: () => void;
  tagExtra?: React.ReactNode;
  isMobile?: boolean;
  isShowPairSettleIcon?: boolean;
  showMargin?: boolean;
  symbol?: string;
  chainId?: CHAIN_ID;
  showChainIcon?: boolean;
  showMarginText?: boolean;
  requiredMarginIcon?: boolean;
};

function TokenPair({
  baseToken,
  quoteToken,
  expiry,
  showFavorite,
  instrumentAddr,
  infoMode,
  tokenSize,
  isInverse = false,
  showOracle = false,
  marketType,
  highlightExpiry,
  isShowLogo = true,
  isShowExpiryTag = true,
  showShortPerp = true,
  leverage,
  showLeverage,
  extra,
  verticalMode,
  tagExtra,
  dropdownIcon,
  isMobile,
  showMargin,
  chainId,
  // symbol,
  showChainIcon,
  showMarginText,
}: TokenPairProps): JSX.Element {
  const { t } = useTranslation();
  const expiryDom = useMemo(() => {
    if (expiry) {
      const dom = (
        <TokenPairExpiry expiry={expiry} highlight={highlightExpiry} showShortPerp={showShortPerp}></TokenPairExpiry>
      );
      if (isShowExpiryTag) {
        return (
          <Tag bordered={true} className="token-pair-expiry-tag">
            {dom}
          </Tag>
        );
      }
      return dom;
    }
  }, [expiry, highlightExpiry, isShowExpiryTag, showShortPerp]);

  if (verticalMode) {
    return (
      <div className="syn-token-pair-vertical">
        <>{showFavorite && <TokenFavorite chainId={chainId} instrumentAddr={instrumentAddr} expiry={expiry} />}</>
        <div className={classNames('token-pair', 'compact', 'vertical', isMobile && 'mobile')}>
          {isShowLogo && (
            <TokenLogo
              chainId={chainId}
              showChainIcon={showChainIcon}
              size={tokenSize || 24}
              token={isInverse ? quoteToken : baseToken}
            />
          )}
          <div className="token-pair-content">
            <div className="token-pair-content-top">
              <TokenPairSymbol
                requiredMarginIcon={false}
                isInverse={isInverse}
                baseToken={baseToken}
                quoteToken={quoteToken}
              />
              {dropdownIcon}
            </div>
            <div className="token-pair-content-bottom">
              {showMarginText && (
                <div className="token-pair-content-bottom-margin">
                  {quoteToken.symbol} {t('common.margin')}
                </div>
              )}
              {expiryDom}
              {showLeverage && (
                <Tag bordered={true} className="token-pair-expiry-tag leverage">
                  <TokenPairLeverage leverage={leverage} highlight={highlightExpiry} />
                </Tag>
              )}
              {showOracle && <TokenPairOracle marketType={marketType} />}
              {tagExtra}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (showMargin) {
    return (
      <div
        className={classNames('token-pair', 'compact', 'vertical', 'new', isMobile && 'mobile', isMobile && 'mobile')}>
        <TokenFavorite chainId={chainId} instrumentAddr={instrumentAddr} expiry={expiry} />
        <TokenLogo
          chainId={chainId}
          showChainIcon={showChainIcon}
          size={tokenSize || 24}
          token={isInverse ? quoteToken : baseToken}
        />
        <div className="token-pair-content">
          <div className="token-pair-content-top">
            <TokenPairSymbol
              requiredMarginIcon={false}
              isInverse={isInverse}
              baseToken={baseToken}
              quoteToken={quoteToken}
            />
            {expiryDom}
            <Tag bordered={true} className="token-pair-expiry-tag leverage">
              <TokenPairLeverage leverage={leverage} highlight={highlightExpiry} />
            </Tag>
          </div>
          <div className="token-pair-content-bottom">
            <div className="token-pair-content-bottom-margin">
              {quoteToken.symbol} {t('common.margin')}
            </div>
            {/* {chainId && symbol && (
              <OdysseyBoostTag chainId={chainId} isShowNonOoPoint pairSymbol={symbol} quoteSymbol={quoteToken.symbol} />
            )} */}
            {showOracle && <TokenPairOracle marketType={marketType} />}
            {tagExtra}
          </div>
        </div>
        {extra}
      </div>
    );
  }
  return (
    <div className={classNames('token-pair', infoMode ? 'info' : 'compact', isMobile && 'mobile')}>
      <>{showFavorite && <TokenFavorite chainId={chainId} instrumentAddr={instrumentAddr} expiry={expiry} />}</>
      {isShowLogo && (
        <TokenLogo
          size={tokenSize || 24}
          chainId={chainId}
          showChainIcon={showChainIcon}
          token={isInverse ? quoteToken : baseToken}
        />
      )}
      <div className="token-pair-content">
        <TokenPairSymbol isInverse={isInverse} baseToken={baseToken} quoteToken={quoteToken} />
        {infoMode ? (
          <>{showFavorite && <TokenFavorite chainId={chainId} instrumentAddr={instrumentAddr} expiry={expiry} />}</>
        ) : (
          expiryDom
        )}
        {showLeverage && (
          <Tag bordered={true} className="token-pair-expiry-tag leverage">
            <TokenPairLeverage leverage={leverage} highlight={highlightExpiry} />
          </Tag>
        )}
        {showOracle && <TokenPairOracle marketType={marketType} />}
        {tagExtra}
      </div>
      {extra}
    </div>
  );
}

export default React.memo(TokenPair, (prevProps, nextProps) => {
  return (
    prevProps.baseToken?.id === nextProps.baseToken?.id &&
    prevProps.baseToken?.symbol === nextProps.baseToken?.symbol &&
    prevProps.quoteToken?.id === nextProps.quoteToken?.id &&
    prevProps.quoteToken?.symbol === nextProps.quoteToken?.symbol &&
    prevProps.expiry === nextProps.expiry &&
    prevProps.showFavorite === nextProps.showFavorite &&
    prevProps.infoMode === nextProps.infoMode &&
    prevProps.isInverse === nextProps.isInverse &&
    prevProps.showOracle === nextProps.showOracle &&
    prevProps.tokenSize === nextProps.tokenSize &&
    prevProps.highlightExpiry === nextProps.highlightExpiry &&
    prevProps.isShowLogo === nextProps.isShowLogo &&
    prevProps.isShowExpiryTag === nextProps.isShowExpiryTag &&
    prevProps.showShortPerp === nextProps.showShortPerp &&
    prevProps.leverage === nextProps.leverage &&
    prevProps.showLeverage === nextProps.showLeverage &&
    prevProps.extra === nextProps.extra &&
    prevProps.verticalMode === nextProps.verticalMode &&
    prevProps.tagExtra === nextProps.tagExtra
  );
});
