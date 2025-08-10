/**
 * @description Component-SpotTokensModal
 */
import { ReactComponent as DropDownIcon } from '@/assets/svg/dropdown.svg';
import { Button } from '@/components/Button';
import Drawer from '@/components/Drawer';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import Modal from '@/components/Modal';
import TokenLogo from '@/components/TokenLogo';
import { mockOpenDropdown } from '@/constants/mock';
import { TokenInfoInSpot } from '@/features/spot/types';
import { useDebounceEffect } from 'ahooks';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../index.less';
import { SpotTokensModalContent } from './SpotTokensModalContent';
import './index.less';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  search?: string;
  setSearch: (search: string) => void;
  isSell?: boolean;
  currentToken?: TokenInfoInSpot;
  isFetched: boolean;
  filteredTokens: TokenInfoInSpot[] | undefined;
  onTokenChange: (token: TokenInfoInSpot) => void;
}
const SpotTokensModal: FC<IPropTypes> = function ({
  search,
  setSearch,
  isSell,
  currentToken,
  isFetched,
  filteredTokens,
  onTokenChange,
}) {
  const [open, setOpen] = useState(mockOpenDropdown);
  const searchRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useMediaQueryDevice();
  const { t } = useTranslation();
  useDebounceEffect(() => {
    if (open) {
      searchRef.current?.querySelector('input')?.focus();
    }
  }, [open]);
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open, setSearch]);
  const contentNode = useMemo(() => {
    return (
      <SpotTokensModalContent
        search={search}
        setSearch={setSearch}
        isFetched={isFetched}
        filteredTokens={filteredTokens}
        onTokenChange={onTokenChange}
        setOpen={setOpen}
        ref={searchRef}
      />
    );
  }, [filteredTokens, isFetched, onTokenChange, search, setSearch]);
  return (
    <div className="syn-spot-tokens">
      <Button onClick={() => setOpen(true)} className="syn-spot-tokens-btn">
        <TokenLogo isSpot={true} token={currentToken} size={40} />
        <DropDownIcon className={open ? 'rotate' : ''} />
      </Button>
      {open && isMobile ? (
        <Drawer
          title={isSell ? t('common.spot.selectTokenSell') : t('common.spot.selectToken')}
          open={open}
          width={420}
          onClose={() => {
            setOpen(false);
            setSearch('');
            // setPage(1);
          }}
          destroyOnClose={true}
          className="syn-spot-tokens-drawer">
          {contentNode}
        </Drawer>
      ) : (
        <Modal
          title={isSell ? t('common.spot.selectTokenSell') : t('common.spot.selectToken')}
          open={open}
          width={420}
          onCancel={() => {
            setOpen(false);
            setSearch('');
            // setPage(1);
          }}
          onClose={() => {
            setOpen(false);
            setSearch('');
            // setPage(1);
          }}
          destroyOnClose={true}
          centered={true}
          className="syn-spot-tokens-modal">
          {contentNode}
        </Modal>
      )}
    </div>
  );
};

export default SpotTokensModal;
