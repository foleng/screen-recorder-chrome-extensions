import { createStore } from '@/extensions/store';

type RecordingState = 'IDLE' | 'PENDING' | 'RECORDING' | 'PAUSED' | 'STOPPED';

type RecordingEvent = 'START' | 'PAUSE' | 'RESUME' | 'STOP' | 'IDLE' | 'CANCEL' | 'CONFIRM';

export interface StateMachine {
  currentState: RecordingState;
  transition: (event: RecordingEvent) => void;
  on: (listener: (state: string) => void) => void;
}

type StateTransitions = {
  [K in RecordingState]: {
    [E in RecordingEvent]?: () => void;
  };
};

const store = createStore<{
  recordingState: RecordingState;
}>(
  () => ({
    recordingState: 'IDLE',
  }),
  {
    storageKey: 'recordingState',
    syncToStorage: true,
  },
);

const recordingStateMachine = async (): Promise<StateMachine> => {
  await store.ready();
  console.log('store', store.getState());
  // 修改 stateProxy 的实现
  const stateProxy = {
    _currentState: store.getState()?.recordingState ?? 'IDLE',
    get currentState(): RecordingState {
      // 直接从 store 获取最新状态
      return store.getState()?.recordingState ?? 'IDLE';
    },
    set currentState(value: RecordingState) {
      this._currentState = value;
      store.setState((state) => ({
        ...state,
        recordingState: value,
      }));
    }
  };

  // 定义状态转换规则
  const transitions: StateTransitions = {
    IDLE: {
      START: () => {
        console.log('准备开始录音');
        stateProxy.currentState = 'PENDING';
      },
    },
    PENDING: {
      CONFIRM: () => {
        console.log('用户确认分享');
        stateProxy.currentState = 'RECORDING';
      },
      CANCEL: () => {
        console.log('用户取消分享');
        stateProxy.currentState = 'IDLE';
      }
    },
    RECORDING: {
      PAUSE: () => {
        console.log('暂停录音');
        stateProxy.currentState = 'PAUSED';
      },
      STOP: () => {
        console.log('停止录音');
        stateProxy.currentState = 'STOPPED';
      },
    },
    PAUSED: {
      RESUME: () => {
        console.log('恢复录音');
        stateProxy.currentState = 'RECORDING';
      },
      STOP: () => {
        console.log('停止录音');
        stateProxy.currentState = 'STOPPED';
      },
    },
    STOPPED: {
      START: () => {
        console.log('重新开始录音');
        stateProxy.currentState = 'PENDING';
      },
      IDLE: () => {
        console.log('重置状态');
        stateProxy.currentState = 'IDLE';
      }
    },
  };

  const transition = (event: RecordingEvent) => {
    const stateTransitions = transitions[stateProxy.currentState as RecordingState];
    if (stateTransitions && stateTransitions[event]) {
      stateTransitions[event]();
    } else {
      console.warn(
        `无法在当前状态 ${stateProxy.currentState} 执行事件 ${event}`,
      );
    }
  };

  // 监听录制状态
  const on = (listener: (state: string) => void): void => {
    store.subscribe((state) => {
      if (state.recordingState) {
        listener(state.recordingState);
      }
    });
  };

  return {
    get currentState() {
      // 直接从 store 获取最新状态
      return store.getState()?.recordingState ?? 'IDLE';
    },
    transition,
    on,
  };
};

export default recordingStateMachine;
