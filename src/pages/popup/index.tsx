import store from '@/extensions/store';
import { useEffect, useState } from 'react';
import styles from './style.less';

const Popup = () => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    // 订阅状态变化
    store.subscribe((state) => {
      console.log("state", state);
      setCount(state?.count)
    });

    return () => {};
  }, []);
  return (
    <div className={styles.app}>
      <h1 className={styles.title}>1111{count}</h1>
    </div>
  );
};

export default Popup;
