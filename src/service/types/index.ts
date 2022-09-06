import * as cyfs from 'cyfs-sdk';
export type RouterArray = Array<{
    reqPath: string;
    router: postRouterHandle;
}>;

export type postRouterHandle = (
    req: cyfs.RouterHandlerPostObjectRequest
) => Promise<cyfs.BuckyResult<cyfs.RouterHandlerPostObjectResult>>;

export interface postRouterHandleObject {
    reqPath: string;
    router: postRouterHandle;
}


