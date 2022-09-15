import * as cyfs from 'cyfs-sdk';
import { TestHelloResponseParam } from '../../common/routers';
import { AppObjectType } from '../../common/types';
import { HelloResponseObject } from '../../common/objs/hello_response_object';
import { HelloRequestObjectDecoder } from '../../common/objs/hello_request_object';
import { checkStack } from '../../common/cyfs_helper/stack_wraper';
import { toNONObjectInfo, makeBuckyErr } from '../../common/cyfs_helper/kits';

export async function helloWorld(
    req: cyfs.RouterHandlerPostObjectRequest
): Promise<cyfs.BuckyResult<cyfs.RouterHandlerPostObjectResult>> {
    const { object, object_raw } = req.request.object;
    if (!object || object.obj_type() !== AppObjectType.HELLO_REQUEST) {
        const msg = `obj_type err.`;
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InvalidParam, msg));
    }

    // 解析HelloRequestObject
    const decoder = new HelloRequestObjectDecoder();
    const r = decoder.from_raw(object_raw);
    if (r.err) {
        const msg = `decode failed, ${r}.`;
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InvalidParam, msg));
    }
    // 取出字符串
    const name = r.unwrap().name;

    // 组装新字符串响应
    const greet = `Hello ${name}, welcome to CYFS World!`;
    const stackWraper = checkStack();
    const helloResponseObj: TestHelloResponseParam = HelloResponseObject.create({
        greet,
        decId: stackWraper.check().dec_id!,
        owner: stackWraper.checkOwner()
    });
    return Promise.resolve(
        cyfs.Ok({
            action: cyfs.RouterHandlerAction.Response,
            response: cyfs.Ok({
                object: toNONObjectInfo(helloResponseObj)
            })
        })
    );
}
