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
  const defaultPosition = { x: 100, y: 100 };

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
      <div
        className={style.overlay}
        onClick={() => setVisible(false)}
      />

      <Draggable
        nodeRef={dragRef}
        defaultPosition={defaultPosition}
        handle=".draggable-header"
        bounds="body"
        scale={1}
        grid={[1, 1]}
        enableUserSelectHack={false}
        positionOffset={{ x: 0, y: 0 }}
        defaultClassName={style.draggable}
      >
        <div
          ref={dragRef}
          className={style.popupContainer}
        >
          <div className={`${style.header} draggable-header`}>
            <div className={style.dragHandle}>Recorder Popup</div>
          </div>

          <MediaControlTabs onChange={setActiveKey} />

          <div className={style.content}>
            {Content ? <Content /> : null}
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default React.memo(RecorderPopup);

