import React from 'react';
import styles from './Welcome.module.less';

import { helloWorldSimple } from '@src/www/apis/hello';
import { Button } from 'antd';

export default function Welcome() {
    return (
        <div className={styles.box}>
            <Button onClick={() => helloWorldSimple('Jack')} type="primary">
                Hello World
            </Button>
        </div>
    );
}
