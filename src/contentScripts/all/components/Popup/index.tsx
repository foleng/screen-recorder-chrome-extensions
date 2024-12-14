import React, { useMemo, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import MediaControlTabs, {
  MediaControlTabsProps,
  MediaType,
  options,
} from '../MediaControlTabs';
import { MessageService, MessageTypeEnum } from '@/extensions/handlers/types';

const RecorderPopup: React.FC = () => {
  const [activeKey, setActiveKey] = useState<MediaControlTabsProps['value']>(MediaType.Screen);
  const [visible, setVisible] = useState(false);

  const Content = useMemo(() => {
    return options.find((item) => item.value === activeKey)?.component;
  }, [activeKey]);

  useEffect(() => {
    // 添加监听器并获取清理函数
    const removeListener = MessageService.onMessage(
      MessageTypeEnum.SHOW_RECORDER_POPUP,
      (message) => {
        setVisible(true);
        return false;
      }
    );

    // 组件卸载时清理监听器
    return removeListener;
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <Draggable
      defaultPosition={{x: 0, y: 0}}
      handle=".draggable-header" cancel=".no-drag">
      <div
        style={{
          width: 300,
          padding: 20,
          borderRadius: 12,
          backgroundColor: '#fff',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          fontFamily: 'Arial, sans-serif',
          cursor: 'default',
        }}
      >
        {/* 可拖拽的头部 */}
        <div
          className="draggable-header"
          style={{
            marginBottom: 12,
            cursor: 'move',
            fontWeight: 'bold',
            fontSize: 16,
            textAlign: 'center',
          }}
        >
          Recorder Popup
        </div>

        {/* 选项卡组件 */}
        <MediaControlTabs onChange={setActiveKey} />

        {/* 渲染动态内容 */}
        <div className="no-drag">
          {Content ? <Content /> : null}
        </div>
      </div>
    </Draggable>
  );
};

export default RecorderPopup;

