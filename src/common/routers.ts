import * as cyfs from 'cyfs-sdk';
import { HelloRequestObject } from './objs/hello_request_object';
import { HelloResponseObject } from './objs/hello_response_object';

export const enum ROUTER_PATHS {
    TEST_HELLO = '/test/hello'
}

// /test/hello request and response params
export type TestHelloRequestParam = HelloRequestObject;
export type TestHelloResponseParam = HelloResponseObject;
