import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import MediaControlTabs from '../MediaControlTabs';
import { useStore, popupStore } from '@/extensions/store';
import style from './index.less';

const RecorderPopup: React.FC = () => {
  const dragRef = useRef<HTMLDivElement>(null);
  const visible = useStore(popupStore, state => state.visible);
  const position = useStore(popupStore, state => state.position);
  // const setPosition = useStore(popupStore, state => state.setPosition);

  if (!visible) return null;

  return (
    <div className={style.wrap}>
      <div
        className={style.overlay}
        onClick={() => popupStore.setState({ visible: false })}
      />

      <Draggable
        nodeRef={dragRef}
        position={position}
        // onDrag={(e, data) => setPosition({ x: data.x, y: data.y })}
        bounds="body"
        handle=".draggable-header"
      >
        <div
          ref={dragRef}
          className={style.popupContainer}
        >
          <div className={`${style.header} draggable-header`}>
            <div className={style.dragHandle}>Recorder Popup</div>
          </div>

          <MediaControlTabs />

          <div className={style.content}>
            {/* ... 其他代码保持不变 ... */}
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default React.memo(RecorderPopup);

