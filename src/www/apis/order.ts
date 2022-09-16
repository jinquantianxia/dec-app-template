// demo apis

import * as cyfs from 'cyfs-sdk';
import { checkStack } from '@src/common/cyfs_helper/stack_wraper';
import { ROUTER_PATHS } from '@src/common/routers';
import { Order, OrderDecoder } from '@src/common/objs/order';
import { ResponseObject, ResponseObjectDecoder } from '@src/common/objs/response_object';
import { OrderObject } from '@www/types/order';

// create order
export async function createOrder(order: OrderObject) {
    const stackWraper = checkStack();
    // Create an Order object
    const orderObj = Order.create(order);
    // make a request
    const ret = await stackWraper.postObject(orderObj, ResponseObjectDecoder, {
        reqPath: ROUTER_PATHS.CREATE_ORDER,
        decId: stackWraper.decId
    });
    if (ret.err) {
        console.error(`reponse err, ${ret}`);
        return null;
    }
    // Parse out the ResponseObject object
    const r = ret.unwrap();
    if (r) {
        const retObj = {
            err: r.err,
            msg: r.msg
        };
        console.log(`reponse, ${retObj}`);
        return JSON.stringify(retObj);
    }
    return null;
}

// retrieve order
export async function retrieveOrder(key: string) {
    const stackWraper = checkStack();
    // Create an Order object, containing only the key value
    const obj = Order.create({ key, decId: stackWraper.decId!, owner: stackWraper.checkOwner() });
    // make a request
    const ret = await stackWraper.postObject(obj, OrderDecoder, {
        reqPath: ROUTER_PATHS.RETRIEVE_ORDER,
        decId: stackWraper.decId
    });
    if (ret.err) {
        console.error(`reponse error, ${ret}`);
        return null;
    }
    // Parse the Order object
    const r = ret.unwrap();
    if (r) {
        const orderObj = {
            key: r.key,
            timestamp: r.timestamp,
            price: r.price,
            buyer: r.buyer,
            status: r.status
        };
        console.log(`reponse, ${JSON.stringify(orderObj)}`);
        return orderObj;
    }
    return null;
}

// update order
export async function updateOrder(order: OrderObject) {
    const stack = checkStack();
    // Create an Order object
    const orderObj = Order.create(order);
    // make a request
    const ret = await stack.postObject(orderObj, ResponseObjectDecoder, {
        reqPath: ROUTER_PATHS.UPDATE_ORDER,
        decId: stack.decId
    });
    if (ret.err) {
        console.error(`reponse err, ${ret}`);
        return null;
    }
    // Parse out the ResponseObject object
    const r = ret.unwrap();
    if (r) {
        const retObj = {
            err: r.err,
            msg: r.msg
        };
        console.log(`reponse, ${retObj}`);
        return JSON.stringify(retObj);
    }

    return null;
}

// delete order
export async function deleteOrder(key: string) {
    const stackWraper = checkStack();
    // Create an Order object, containing only the key value
    const obj = Order.create({ key, decId: stackWraper.decId!, owner: stackWraper.checkOwner() });
    // make a request
    const ret = await stackWraper.postObject(obj, ResponseObjectDecoder, {
        reqPath: ROUTER_PATHS.DELETE_ORDER,
        decId: stackWraper.decId
    });
    if (ret.err) {
        console.error(`reponse err, ${ret}`);
        return null;
    }
    // Parse out the ResponseObject object
    const r = ret.unwrap();
    if (r) {
        const retObj = {
            err: r.err,
            msg: r.msg
        };
        console.log(`reponse, ${retObj}`);
        return JSON.stringify(retObj);
    }
    return null;
}

// paging list orders under path /orders
export async function listOrdersByPage(pageIndex: number) {
    const stack = checkStack();
    // Get your own OwnerId
    const selfObjectId = stack.checkOwner();
    // Get an instance of cyfs.GlobalStateAccessStub
    const access = stack.check().root_state_access_stub(selfObjectId);
    // Use the list method to list all objects under /orders
    const lr = await access.list('/orders', pageIndex, 10);

    if (lr.err) {
        if (lr.val.code !== cyfs.BuckyErrorCode.NotFound) {
            console.error(`list-subdirs in(/orders) io failed, ${lr}`);
        } else {
            console.warn(`list-subdirs in(/orders) not found, ${lr}`);
        }
        return [];
    }

    const list = lr.unwrap();
    const keyList = list.map((item) => item.map!.key);
    return keyList;
}
