import store from '../store';

type RecordingState = 'IDLE' | 'RECORDING' | 'PAUSED' | 'STOPPED';

type RecordingEvent = 'START' | 'PAUSE' | 'RESUME' | 'STOP';

interface StateMachine {
  currentState: RecordingState;
  transition: (event: RecordingEvent) => void;
}

type StateTransitions = {
  [K in RecordingState]: {
    [E in RecordingEvent]?: () => void
  }
}

const recordingStateMachine = (): StateMachine => {
  // 使用代理来跟踪 currentState 的变化
  const stateProxy = new Proxy(
    { currentState: 'IDLE' as RecordingState },
    {
      set(target, prop, value) {
        target[prop as keyof typeof target] = value;
        // 当状态改变时，同步到 store
        store.setState({ recordingState: value });
        return true;
      }
    }
  );

  // 定义状态转换规则
  const transitions: StateTransitions = {
    'IDLE': {
      'START': () => {
        console.log('开始录音');
        stateProxy.currentState = 'RECORDING';
      }
    },
    'RECORDING': {
      'PAUSE': () => {
        console.log('暂停录音');
        stateProxy.currentState = 'PAUSED';
      },
      'STOP': () => {
        console.log('停止录音');
        stateProxy.currentState = 'STOPPED';
      }
    },
    'PAUSED': {
      'RESUME': () => {
        console.log('恢复录音');
        stateProxy.currentState = 'RECORDING';
      },
      'STOP': () => {
        console.log('停止录音');
        stateProxy.currentState = 'STOPPED';
      }
    },
    'STOPPED': {
      'START': () => {
        console.log('重新开始录音');
        stateProxy.currentState = 'RECORDING';
      }
    }
  };

  const transition = (event: RecordingEvent) => {
    const stateTransitions = transitions[stateProxy.currentState];
    if (stateTransitions && stateTransitions[event]) {
      stateTransitions[event]();
    } else {
      console.warn(`无法在当前状态 ${stateProxy.currentState} 执行事件 ${event}`);
    }
  };

  return {
    get currentState() {
      return stateProxy.currentState;
    },
    transition
  };
};

export default recordingStateMachine;
