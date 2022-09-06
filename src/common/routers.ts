import * as cyfs from 'cyfs-sdk';
import { Order } from './objs/order';
import { ResponseObject } from './objs/response_object';
import { HelloRequestObject } from './objs/hello_request_object';
import { HelloResponseObject } from './objs/hello_response_object';

export const enum ROUTER_PATHS {
    TEST_HELLO = '/test/hello',
    CREATE_ORDER = '/order/create',
    RETRIEVE_ORDER = '/order/retrieve',
    UPDATE_ORDER = '/order/update',
    DELETE_ORDER = '/order/delete',
    CREATE_ORDER_REQ = '/order/create_req'
}

// /test/hello request and response params
export type TestHelloRequestParam = HelloRequestObject;
export type TestHelloResponseParam = HelloResponseObject;

// /order/create request and response params
export type CreateOrderRequestParam = Order;
export type CreateOrderResponseParam = ResponseObject;

// /order/retrieve request and response params
export type RetrieveOrderRequestParam = Order;
export type RetrieveOrderResponseParam = Order;

// /order/update request and response params
export type UpdateOrderRequestParam = Order;
export type UpdateOrderResponseParam = ResponseObject;

// /order/delete request and response params
export type DeleteOrderRequestParam = Order;
export type DeleteOrderResponseParam = ResponseObject;

// /order/create_req request and response params
export type CreateOrderReqRequestParam = Order;
export type CreateOrderReqResponseParam = ResponseObject;
