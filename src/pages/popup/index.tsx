import { useEffect, useState } from 'react';
import styles from './style.less';

const Popup = () => {
  const [count, setCount] = useState(0)
  return (
    <div className={styles.app}>
      <h1 className={styles.title}>1111{count}</h1>
    </div>
  );
};

export default Popup;
