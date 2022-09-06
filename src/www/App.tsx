import React, { useEffect } from 'react';
import styles from './App.module.less';
import { init } from '@www/initialize';
import Welcome from '@www/pages/Welcome/Welcome';

export default function App() {
    useEffect(() => {
        init();
    }, []);
    return (
        <div className={styles.app}>
            <Welcome />
        </div>
    );
}
