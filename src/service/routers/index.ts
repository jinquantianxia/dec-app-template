import { RouterArray } from '../types';
import { helloWorld } from './hello_world';
import { createOrderRouter } from './create_order';
import { retrieveOrderRouter } from './retrieve_order';
import { updateOrderRouter } from './update_order';
import { deleteOrderRouter } from './delete_order';
import { createOrderReqRouter } from './create_order_req';
import { ROUTER_PATHS } from '@src/common/routers';

export const routers: RouterArray = [
    {
        reqPath: ROUTER_PATHS.TEST_HELLO, // test api
        router: helloWorld
    },
    {
        reqPath: ROUTER_PATHS.CREATE_ORDER, // create order api
        router: createOrderRouter
    },
    {
        reqPath: ROUTER_PATHS.RETRIEVE_ORDER, // retrieve order api
        router: retrieveOrderRouter
    },
    {
        reqPath: ROUTER_PATHS.UPDATE_ORDER, // update order api
        router: updateOrderRouter
    },
    {
        reqPath: ROUTER_PATHS.DELETE_ORDER, // delete order api
        router: deleteOrderRouter
    },
    {
        reqPath: ROUTER_PATHS.CREATE_ORDER_REQ, // create order cross zone notify api
        router: createOrderReqRouter
    }
];
