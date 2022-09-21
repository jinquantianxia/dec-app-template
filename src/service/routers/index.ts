import { RouterArray } from '../types';
import { helloWorld } from './hello_world';
import { ROUTER_PATHS } from '@src/common/routers';

export const routers: RouterArray = [
    {
        reqPath: ROUTER_PATHS.TEST_HELLO, // test api
        router: helloWorld
    }
];
