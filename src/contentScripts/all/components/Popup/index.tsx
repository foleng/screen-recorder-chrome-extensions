import { popupStore, useStore } from '@/extensions/store';
import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import MediaControlTabs from '../MediaControlTabs';
import style from './index.less';

const RecorderPopup: React.FC = () => {
  const dragRef = useRef<HTMLDivElement>(null);
  const visible = useStore(popupStore, (state) => state.visible);
  const position = useStore(popupStore, (state) => state.position);
  const [isMounted, setIsMounted] = useState(false);

  // 确保组件在DOM准备好后再渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!visible || !isMounted) return null;

  // 处理拖拽停止事件，保存位置到store
  const handleStop = (e: any, data: any) => {
    popupStore.setState({ position: { x: data.x, y: data.y } });
  };

  return (
    <div className={style.wrap}>
      <div
        className={style.overlay}
        onClick={() => popupStore.setState({ visible: false })}
      />

      <Draggable
        nodeRef={dragRef}
        bounds="body"
        handle=".draggable-header"
        defaultPosition={position}
        onStop={handleStop}
      >
        <div ref={dragRef} className={style.popupContainer}>
          <div className={`${style.header} draggable-header`}>
            <div className={style.dragHandle}>Recorder Popup</div>
          </div>

          <MediaControlTabs />

          <div className={style.content}>{/* ... 其他代码保持不变 ... */}</div>
        </div>
      </Draggable>
    </div>
  );
};

export default React.memo(RecorderPopup);
