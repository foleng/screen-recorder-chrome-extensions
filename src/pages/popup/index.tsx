import React, { useEffect } from 'react';
import styles from './style.less';
import store from "@/extensions/store";

const Popup = () => {
  useEffect(() => {

// 获取状态并显示
const state = store.getState();
document.getElementById('stateDisplay').textContent = `Name: ${state.user.name}, Age: ${state.user.age}`;

// 订阅状态变化
store.subscribe((state) => {
  document.getElementById('stateDisplay').textContent = `Name: ${state.user.name}, Age: ${state.user.age}`;
});

    return () => {

    };
  }, []);
  return (
    <div className={styles.app}>
      <h1 className={styles.title}>pop222up page</h1>
    </div>
  );
};

export default Popup;
