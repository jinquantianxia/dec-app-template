import React from 'react';
import styles from './Welcome.module.less';

import { helloWorldSimple, helloWorld } from '@src/www/apis/hello';
import { Button } from 'antd';

export default function Welcome() {
    return (
        <div className={styles.box}>
            <Button onClick={() => helloWorld('Jack')} type="primary">
                Hello World
            </Button>
        </div>
    );
}
