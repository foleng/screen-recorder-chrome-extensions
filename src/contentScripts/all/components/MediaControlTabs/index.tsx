import { MediaType } from '@/extensions/recorder';
import { AppstoreOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import React, { useState } from 'react';
import Record from '../Record';
import styles from './index.less';
import Videos from "../Videos";

export interface MediaControlTabsProps {
  value?: MediaType; // 当前激活的选项
  onChange?: (value: MediaType) => void; // 切换选项时的回调
}

export const options = [
  {
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <VideoCameraOutlined style={{ marginRight: '8px' }} />
        Record
      </div>
    ),
    value: MediaType.Screen,
    component: Record,
  },
  {
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <AppstoreOutlined style={{ marginRight: '8px' }} />
        Your videos
      </div>
    ),
    value: MediaType.Videos,
    component: Videos,
  },
];

const MediaControlTabs: React.FC<MediaControlTabsProps> = ({}) => {
  const [activeTab, setActiveTab] = useState<string>(MediaType.Screen);

  const ActiveComponent = options.find(
    (option) => option.value === activeTab,
  )?.component;

  return (
    <div className={styles.mediaControlTabs}>
      <Segmented
        className={styles.segmented}
        value={activeTab} // 使用外部传入的值
        onChange={(val) => setActiveTab(val as MediaType)} // 调用外部的 onChange 回调
        options={options}
        style={{ padding: '6px' }}
      />
      <div className={styles.activeComponent}>
        {ActiveComponent ? <ActiveComponent /> : null}
      </div>
    </div>
  );
};

export default MediaControlTabs;
