// import ThemeSwitch from '@/components/Theme/ThemeSwitch';
import './index.less';

import { SearchOutlined } from '@ant-design/icons';
import { Divider, Space } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { Button, ButtonGroupSelector, SwitchBtn } from '@/components/Button';
import Card from '@/components/Card';
import { CardModalWrapper, CardWrapper } from '@/components/CardWrapper';
import HealthCapsule from '@/components/HealthCapsule';
import Input, { Search } from '@/components/Input';
import Loading from '@/components/Loading';
import BigLoading from '@/components/Loading/BigLoading';
import { useMediaQueryDevice } from '@/components/MediaQuery';
// import { MiniDescriptions } from '@/components/Descriptions';
import Slider from '@/components/Slider';
import Switch from '@/components/Switch';
import { useMessage } from '@/hooks/useMessage';
// import CardWrapper from '@/components/CardWrapper';
import { mockNotiDontClose } from '@/constants/mock';
import SentryService from '@/entities/SentryService';
import { useTxNotification } from '@/hooks/useTxNotification';
import SpinWheel from '@/pages/Odyssey/components/SpinWheel';
import SocketCard from './socket';
export default function ThemePage(): JSX.Element {
  const { deviceType } = useMediaQueryDevice();
  const txNotification = useTxNotification();
  const txMessage = useMessage();
  const [showSubCard, setShowSubCard] = useState(false);
  const [cardModalVisible, setCardModalVisible] = useState(false);

  return (
    <div className={classNames(`theme-container ${deviceType}`, 'text-color')}>
      {/* <WagmiTest /> */}
      <button
        onClick={() => {
          try {
            throw new Error('This is your first error!');
          } catch (error) {
            SentryService.captureException(error, { name: 'ThemePage:test' });
          }
        }}>
        Break the world
      </button>
      ;
      <SocketCard />
      <Card title="HealthCapsule">
        <HealthCapsule />
        <HealthCapsule level="mid" />
        <HealthCapsule level="high" />
      </Card>
      <Card title="CardWrapper">
        <CardModalWrapper
          open={cardModalVisible}
          onClose={() => setCardModalVisible(false)}
          cardProps={{
            showSubCard: showSubCard,
            subCardTitle: 'subCardTitle',
            subCardSlot: <div>subCardSlot</div>,
            mode: 'modal',
            tabList: [
              {
                tab: 'tab 1',
                disabled: false,
                key: '0',
              },
              {
                tab: 'tab 2',
                disabled: false,
                key: '1',
              },
            ],
            onFallbackClick: (fallback) => {
              console.log(fallback);
              setShowSubCard(fallback);
            },
            footer: <div>footer</div>,
          }}>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
          <p>children</p>
        </CardModalWrapper>
        <Button onClick={() => setCardModalVisible(true)}>show cardWrapperModal</Button>
        <CardWrapper
          title="card-title"
          showSubCard={showSubCard}
          subCardTitle="subCardTitle"
          subCardSlot={<div>subCardSlot</div>}
          mode="modal"
          onFallbackClick={(fallback) => {
            console.log(fallback);
            setShowSubCard(fallback);
          }}
          footer={<div>footer</div>}>
          children
        </CardWrapper>
        <CardWrapper
          showSubCard={showSubCard}
          subCardTitle="subCardTitle"
          subCardSlot={
            <div>
              <p>subCardSlot</p>
              <p>subCardSlot</p>
              <p>subCardSlot</p>
              <p>subCardSlot</p>
              <p>subCardSlot</p>
              <p>subCardSlot</p>
              <p>subCardSlot</p>
              <p>subCardSlot</p>
            </div>
          }
          tabList={[
            {
              tab: 'tab 1',
              disabled: false,
              key: '0',
            },
            {
              tab: 'tab 2',
              disabled: false,
              key: '1',
            },
          ]}
          onFallbackClick={(fallback) => {
            console.log(fallback);
            setShowSubCard(fallback);
          }}
          footer={<div>footer</div>}>
          children
        </CardWrapper>
      </Card>
      <Card title="ButtonGroupSelector">
        <ButtonGroupSelector
          items={[
            {
              label: 'group1',
              value: 1,
              group: 1,
            },
            {
              label: 'group1',
              value: 2,
              group: 1,
            },
            {
              label: 'group2',
              value: 2,
              group: 2,
            },
          ]}
          onClick={(values, group) => console.log({ values, group })}
        />
        <Slider />
      </Card>
      <Card title="Button">
        <div>
          <h1 className="text-color">Solid</h1>
          <Space direction="vertical">
            <div>
              <Space>
                Type
                <Button>Default</Button>
                <Button type="primary">Primary</Button>
                <Button ghost>Ghost</Button>
                <Button type="link">Link</Button>
                <Button type="text">Text</Button>
                {/* <Button danger>Text</Button> */}
              </Space>
            </div>
            <div>
              <Space>
                Color
                <Button>Default</Button>
                <Button type="primary">Primary</Button>
                {/* <Button >Success</Button> */}
                {/* <Button danger>Danger</Button> */}
              </Space>
            </div>
            <div>
              <Space>
                Disabled
                <Button disabled>Default</Button>
                <Button type="primary" disabled>
                  Primary
                </Button>
                <Button disabled>Success</Button>
                {/* <Button disabled danger>
                  Danger
                </Button> */}
              </Space>
            </div>
            <div>
              <Space>
                Loading
                <Button loading>Default</Button>
                <Button type="primary" loading>
                  Primary
                </Button>
                <Button loading>Success</Button>
                {/* <Button loading danger>
                  Danger
                </Button> */}
              </Space>
            </div>
          </Space>
        </div>

        <Divider />
        <div>
          <h1 className="text-color">Ghost</h1>
          <Space direction="vertical">
            <div>
              <Space>
                Color
                <Button ghost>Default</Button>
                <Button type="primary" ghost>
                  Primary
                </Button>
                <Button ghost>Success</Button>
                {/* <Button ghost danger>
                  Danger
                </Button> */}
              </Space>
            </div>
            <div>
              <Space>
                Shape
                <Button ghost type="primary">
                  Default
                </Button>
                <Button type="primary" ghost shape="round">
                  Round
                </Button>
                <Button ghost type="primary" shape="circle" icon={<SearchOutlined />} />
              </Space>
            </div>
            <div>
              <Space>
                Disabled
                <Button ghost disabled>
                  Default
                </Button>
                <Button type="primary" ghost disabled>
                  Primary
                </Button>
                <Button ghost disabled>
                  Success
                </Button>
                {/* <Button ghost disabled danger>
                  Danger
                </Button> */}
              </Space>
            </div>
            <div>
              <Space>
                Loading
                <Button ghost loading>
                  Default
                </Button>
                <Button type="primary" ghost loading>
                  Primary
                </Button>
                <Button ghost loading>
                  Success
                </Button>
                {/* <Button ghost loading danger>
                  Danger
                </Button> */}
              </Space>
            </div>
          </Space>
        </div>
      </Card>
      <Card title="SwitchBtn">
        <SwitchBtn
          isChecked={true}
          className="syn-btn-rounded"
          onSwitch={() => {
            console.log('switch');
          }}>
          All
        </SwitchBtn>
      </Card>
      <Card title="Input">
        <div>
          <h1 className="text-color">Size</h1>
          <Space direction="vertical">
            <div>
              <Space>
                <Input size="small" />
                <Input />
                <Input size="large" />
              </Space>
            </div>
          </Space>
        </div>
        <div>
          <h1 className="text-color">Type</h1>
          <Space direction="vertical">
            <div>
              <Space>
                <Input size="small" suffix={'small'} />
                <Input suffix={'Medium'} />
                <Input size="large" suffix={'large'} />
              </Space>
            </div>
          </Space>
        </div>
        <div>
          <h1 className="text-color">Search</h1>
          <Space direction="vertical">
            <div>
              <Space>
                <Search />
              </Space>
            </div>
          </Space>
        </div>
      </Card>
      <Card title="Switch">
        <div>
          <h1 className="text-color">Solid</h1>
          <Space direction="vertical">
            <div>
              <Space>
                <Switch />
              </Space>
            </div>
          </Space>
        </div>
      </Card>
      <Divider />
      <Card title="notification">
        <Button
          onClick={() => {
            const id = toast.loading('Please wait...', { autoClose: false });
            //do something else
            setTimeout(() => {
              toast.update(id, {
                render: 'All is good',
                type: 'success',
                isLoading: false,
                autoClose: mockNotiDontClose ? false : 5000,
                closeButton: true,
                closeOnClick: true,
                onClick: () => {
                  alert('1');
                },
              });
            }, 3000);
            toast.info(
              <div className="syn-notification-content">
                <div className="syn-notification-content-title">Trade tx sent, waiting for confirmation...</div>
                {/* <div className="syn-notification-content-desc">Trade Warning: 1.2345 ETH @ 1.2345</div> */}
              </div>,
              {
                onClick: () => {
                  alert('1');
                },
              },
            );
            // txNotification.open({
            //   type: 'success',
            //   tx: 'open!!!',
            //   message: 'open!!!',
            // });
          }}>
          open
        </Button>
        <Button
          type="primary"
          onClick={() => {
            toast.success(
              <div className="syn-notification-content">
                <div className="syn-notification-content-title">title</div>
                <div className="syn-notification-content-desc">Trade 1.2345 ETH @ 1.2345</div>
              </div>,
              {
                onClick: () => {
                  alert('1');
                },
              },
            );
            txNotification.success({
              type: 'success',
              tx: 'open!!!open!!!open!!!open!!!open!!!',
              message: 'open!!!open!!!open!!!open!!!open!!!',
              description: 'Trade 1.2345 ETH @ 1.2345',
              duration: 20,
            });
          }}>
          success
        </Button>
        <Button
          type="dashed"
          onClick={() => {
            toast.error(
              <div className="syn-notification-content">
                {/* <div className="syn-notification-content-title">title</div> */}
                <div className="syn-notification-content-desc">Trade Error: 1.2345 ETH @ 1.2345</div>
              </div>,
              {
                onClick: () => {
                  alert('1');
                },
              },
            );
            txNotification.error({
              message: 'open!!!',
              duration: 20,
            });
          }}>
          error
        </Button>
        <Button
          type="dashed"
          onClick={() => {
            toast.warning(
              <div className="syn-notification-content">
                <div className="syn-notification-content-title">Trade Warning: 1.2345 ETH @ 1.2345</div>
                {/* <div className="syn-notification-content-desc">Trade Warning: 1.2345 ETH @ 1.2345</div> */}
              </div>,
              {
                onClick: () => {
                  alert('1');
                },
              },
            );
            txNotification.info({
              message: 'open!!!',
              duration: 20,
            });
          }}>
          info
        </Button>
      </Card>
      <Card title="message">
        <Button
          onClick={() => {
            txMessage.open({
              type: 'success',
              tx: 'open!!!',
              content: 'open!!!',
              duration: 20,
            });
          }}>
          open
        </Button>
        <Button
          type="primary"
          onClick={() => {
            txMessage.success({
              type: 'success',
              tx: 'open!!!',
              content: <div>Success Prompt. lorem ipsum text lorem ipsum text</div>,
              duration: 20,
            });
          }}>
          success
        </Button>
        <Button
          type="dashed"
          onClick={() => {
            txMessage.error({
              content: (
                <div>
                  <div>Success Prompt. lorem ipsum text lorem ipsum text</div>
                  <div>Success Prompt. </div>
                </div>
              ),
              duration: 20,
            });
          }}>
          error
        </Button>
        <Button
          type="dashed"
          onClick={() => {
            txMessage.info({
              content: 'open!!!',
              duration: 200,
            });
          }}>
          info
        </Button>
      </Card>
      <Card title="loading">
        <div>
          <BigLoading></BigLoading>
        </div>
        <div style={{ marginTop: 50 }}>
          <Loading spinning={true}></Loading>
        </div>
      </Card>
      <Card title="Spin wheel">
        <SpinWheel />
      </Card>
    </div>
  );
}
