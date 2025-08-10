import './header.less';

import { Col, Layout, Row } from 'antd';
import classNames from 'classnames';
import { Suspense } from 'react';
import { Link } from 'react-router-dom';

import LanguageSelector from '@/components/LanguageSelector';
import { Default, Desktop, useMediaQueryDevice } from '@/components/MediaQuery';
import { useTheme } from '@/features/global/hooks';
import { useChainId } from '@/hooks/web3/useChain';

// import { isTestnet } from '@/utils/chain';
// import GoToMintButton from './GoToMintButton';
import IpBlocker from '@/components/IpBlocker';
import Logo from './Logo';
import HeaderMenu from './Menu';
import SwitchTheme from './SwitchTheme';
import TutorialButton from './TutorialButton';
import Web3Network from './Web3Network';
import Web3Status from './Web3Status';

const { Header: AntHeader } = Layout;
export default function Header({ className }: { className?: string }): JSX.Element {
  const { deviceType, isNotMobile } = useMediaQueryDevice();
  const chainId = useChainId();
  // const walletProvider = useWalletProvider();
  const { dataTheme } = useTheme();
  return (
    <>
      {/* <Suspense>{isNotMobile && <TopNotice />}</Suspense> */}
      <IpBlocker />
      <div className={classNames('header', deviceType, className)}>
        <AntHeader className={`header-container  ${deviceType}`}>
          <Row justify="space-between">
            <Col className="header-main" flex="1">
              <Link
                id="logo"
                onClick={() => {
                  !isNotMobile && chainId;
                }}
                className="logo"
                to="/">
                <Logo dataTheme={dataTheme} />
              </Link>
              <Default>
                <>
                  <HeaderMenu />
                </>
              </Default>
            </Col>
            <Col className="header-right">
              <>
                <Suspense>
                  <>
                    <Web3Network />
                    <Web3Status />
                  </>
                </Suspense>
                {/* <Desktop> */}
                {/* <Suspense> */}
                {/* {!!chainId && isTestnet(chainId) && <GoToMintButton></GoToMintButton>} */}
                {/* {!!walletProvider && walletProvider.provider.isMetaMask && <BridgeAssets></BridgeAssets>} */}
                {/* </Suspense> */}
                {/* </Desktop>  */}
                <Desktop>
                  <>
                    <TutorialButton />
                    <LanguageSelector />
                    <SwitchTheme />
                  </>
                </Desktop>
              </>
            </Col>
          </Row>
        </AntHeader>
      </div>
    </>
  );
}
