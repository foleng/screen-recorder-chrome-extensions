import { MediaType } from '@/extensions/recorder';
import { recordingStore, useAsyncStore, useStore } from '@/extensions/store';
import {
  AppstoreOutlined,
  CameraOutlined,
  DesktopOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import { Tabs } from 'antd';
import React, { useState } from 'react';
import RecordContent from '../RecordContent';

// Tab 内容组件
const CaptureModeTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(MediaType.Screen);
  const isRecording = useStore(recordingStore, (state) => state.isRecording);
  const recordingTime = useStore(
    recordingStore,
    (state) => state.recordingTime,
  );

  // 如果需要处理异步初始化的情况
  const mediaType = useAsyncStore(
    recordingStore,
    (state) => state.mediaType,
    null,
  );

  // Tab 配置
  const tabConfig = [
    { key: MediaType.Screen, label: 'Screen', icon: <DesktopOutlined /> },
    { key: MediaType.Videos, label: 'Tab area', icon: <AppstoreOutlined /> },
    { key: MediaType.Camera, label: 'Camera', icon: <CameraOutlined /> },
    { key: MediaType.Mockup, label: 'Mockup', icon: <MobileOutlined /> },
  ];

  // Tab 内容配置映射
  const tabContentMap: Record<string, React.ReactNode> = {};

  // 渲染 Tab Item 的函数
  const renderTabLabel = (
    tabKey: string,
    label: string,
    icon: React.ReactNode,
  ) => {
    const isActive = activeTab === tabKey;
    return (
      <div style={tabItemStyle(isActive)}>
        <div style={iconStyle(isActive)}>{icon}</div>
        {label}
      </div>
    );
  };

  const items = tabConfig.map(({ key, label, icon }) => ({
    key,
    label: renderTabLabel(key, label, icon),
    children: tabContentMap[key] || <RecordContent mediaType={key} />, // 根据 key 渲染对应的组件
  }));

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        tabBarStyle={{
          display: 'flex',
          justifyContent: 'center',
          borderBottom: '1px solid #d9d9d9',
        }}
      />
    </div>
  );
};

// 样式辅助函数
const tabItemStyle = (isActive: boolean) => ({
  display: 'flex',
  flexDirection: 'column' as 'column',
  alignItems: 'center',
  color: isActive ? '#0057FF' : '#555',
  fontWeight: isActive ? 'bold' : 'normal',
  cursor: 'pointer',
});

const iconStyle = (isActive: boolean) => ({
  fontSize: '18px',
  marginBottom: '4px',
  color: isActive ? '#0057FF' : '#555',
});

export default CaptureModeTabs;
