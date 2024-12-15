import React, { useMemo, useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import MediaControlTabs, {
  MediaControlTabsProps,
  MediaType,
  options,
} from '../MediaControlTabs';
import { MessageTypeEnum } from '@/extensions/handlers/types';
import MessageService from "@/extensions/handlers/MessageService";
import style from './index.less';

const RecorderPopup: React.FC = () => {
  const [activeKey, setActiveKey] = useState<MediaControlTabsProps['value']>(MediaType.Screen);
  const [visible, setVisible] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });

  const Content = useMemo(() => {
    return options.find((item) => item.value === activeKey)?.component;
  }, [activeKey]);

  useEffect(() => {
    const removeListener = MessageService.onMessage(
      MessageTypeEnum.SHOW_RECORDER_POPUP,
      (message) => {
        setVisible(true);
        return false;
      }
    );

    return removeListener;
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className={style.wrap}>
      {/* 蒙层 */}
      <div
        className={style.overlay}
        onClick={() => setVisible(false)}
      />

      <Draggable
        nodeRef={dragRef}
        position={position}
        onDrag={(e, data) => {
          setPosition({ x: data.x, y: data.y });
        }}
        bounds="parent"
        handle=".draggable-header"
      >
        <div
          ref={dragRef}
          className={style.popupContainer}
        >
          {/* 可拖拽的头部 */}
          <div className={`${style.header} draggable-header`}>
            Recorder Popup
          </div>

          {/* 选项卡组件 */}
          <MediaControlTabs onChange={setActiveKey} />

          {/* 渲染动态内容 */}
          <div className={style.content}>
            {Content ? <Content /> : null}
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default RecorderPopup;

