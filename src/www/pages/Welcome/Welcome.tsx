import React, { useEffect, useState } from 'react';
import styles from './Welcome.module.less';
import {
    createOrder,
    retrieveOrder,
    updateOrder,
    deleteOrder,
    listOrdersByPage
} from '@src/www/apis/order';
import { helloWorldSimple } from '@src/www/apis/hello';
import { Button, Input, Switch, message } from 'antd';
import { OrderObject, OrderStatus } from '@www/types/order';
import { checkStack } from '@src/common/cyfs_helper/stack_wraper';

export default function Welcome() {
    const [output, setOutput] = useState('output:');
    const [orderKey, setOrderKey] = useState('1');
    const [orderTimestamp, setOrderTimestamp] = useState(0);
    const [orderPrice, setOrderPrice] = useState(0);
    const [orderBuyer, setOrderBuyer] = useState('Tom');
    const [orderStatus, setOrderStatus] = useState(true);
    useEffect(() => {
        const timer = setInterval(() => {
            setOrderTimestamp(new Date().getTime());
        }, 3000);
        return () => clearInterval(timer);
    }, []);
    function isOrderKeyValid(): boolean {
        if (!orderKey) return false;
        return true;
    }
    const handleCreateOrder = async () => {
        const isValid = isOrderKeyValid();
        if (isValid) {
            const stackWraper = checkStack();
            const order: OrderObject = {
                key: orderKey,
                timestamp: orderTimestamp,
                price: orderPrice,
                buyer: orderBuyer,
                status: orderStatus ? OrderStatus.OPEN : OrderStatus.CLOSED,
                decId: stackWraper.decId!,
                owner: stackWraper.checkOwner()
            };
            const ret = await createOrder(order);
            setOutput(ret as string);
        } else {
            message.error('Invalid order key!');
        }
    };
    const handleRetrieveOrder = async () => {
        const isValid = isOrderKeyValid();
        if (isValid) {
            const ret = await retrieveOrder(orderKey);
            setOutput(JSON.stringify(ret));
        } else {
            message.error('Invalid order key!');
        }
    };
    const handleUpdateOrder = async () => {
        const stackWraper = checkStack();
        const order: OrderObject = {
            key: orderKey,
            timestamp: orderTimestamp,
            price: orderPrice,
            buyer: orderBuyer,
            status: orderStatus ? OrderStatus.OPEN : OrderStatus.CLOSED,
            decId: stackWraper.check().dec_id!,
            owner: stackWraper.checkOwner()
        };
        const ret = await updateOrder(order);
        setOutput(ret as string);
    };
    const handleDeleteOrder = async () => {
        const isValid = isOrderKeyValid();
        if (isValid) {
            const ret = await deleteOrder(orderKey);
            setOutput(ret as string);
        } else {
            message.error('Invalid order key!');
        }
    };
    const handleListOrdersByPage = async () => {
        const pageIndex = 0;
        const ret = await listOrdersByPage(pageIndex);
        setOutput(ret.toString());
    };

    const handleOrderKeyChange = (key: string) => {
        setOrderKey(key);
    };

    const handleOrderPriceChange = (price: number) => {
        setOrderPrice(price);
    };

    const handleOrderBuyerChange = (buyer: string) => {
        setOrderBuyer(buyer);
    };

    const handleOrderStatusChange = (checked: boolean) => {
        setOrderStatus(checked);
    };
    return (
        <div className={styles.box}>
            <h1>Order Management System DEMO</h1>
            <div className={styles.mainBox}>
                <div className={styles.inputBox}>
                    <div className={styles.itemBox}>
                        <div className={styles.itemTitle}>key</div>
                        <Input
                            defaultValue="1"
                            className={styles.input}
                            value={orderKey}
                            onChange={(e) => handleOrderKeyChange(e.target.value)}
                        />
                    </div>
                    <div className={styles.itemBox}>
                        <div className={styles.itemTitle}>timestamp</div>
                        <Input className={styles.input} value={orderTimestamp} disabled={true} />
                    </div>
                    <div className={styles.itemBox}>
                        <div className={styles.itemTitle}>price</div>
                        <Input
                            className={styles.input}
                            value={orderPrice}
                            type="number"
                            onChange={(e) => handleOrderPriceChange(Number(e.target.value))}
                        />
                    </div>
                    <div className={styles.itemBox}>
                        <div className={styles.itemTitle}>buyer</div>
                        <Input
                            className={styles.input}
                            value={orderBuyer}
                            onChange={(e) => handleOrderBuyerChange(e.target.value)}
                        />
                    </div>
                    <div className={styles.itemBox}>
                        <div className={styles.itemTitle}>status</div>
                        <div className={styles.input}>
                            <Switch
                                checked={orderStatus}
                                checkedChildren="OPEN"
                                unCheckedChildren="CLOSE"
                                onChange={handleOrderStatusChange}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.operateBox}>
                    <div className={styles.outBox}>{output}</div>
                    <div className={styles.btns}>
                        <Button onClick={() => helloWorldSimple('Jack')} type="primary">
                            Hello World
                        </Button>
                        <Button onClick={handleCreateOrder}>Create Order</Button>
                        <Button onClick={handleRetrieveOrder}>Retrieve Order</Button>
                        <Button onClick={handleUpdateOrder}>Update Order</Button>
                        <Button onClick={handleDeleteOrder}>Delete Order</Button>
                        <Button onClick={handleListOrdersByPage}>List Order Keys</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
