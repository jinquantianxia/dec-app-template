import * as cyfs from 'cyfs-sdk';
import { OrderDecoder } from '../../common/objs/order';
import { checkStack } from '../../common/cyfs_helper/stack_wraper';
import { AppObjectType } from '../../common/types';
import { toNONObjectInfo, makeBuckyErr } from '../../common/cyfs_helper/kits';

export async function retrieveOrderRouter(
    req: cyfs.RouterHandlerPostObjectRequest
): Promise<cyfs.BuckyResult<cyfs.RouterHandlerPostObjectResult>> {
    const { object, object_raw } = req.request.object;

    // 接受Order对象
    if (!object || object.obj_type() !== AppObjectType.ORDER) {
        const msg = `obj_type err.`;
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InvalidParam, msg));
    }
    const stack = checkStack().check();

    // 解码
    const orderDecoder = new OrderDecoder();
    const dr = orderDecoder.from_raw(object_raw);
    if (dr.err) {
        const msg = `decode failed, ${dr}.`;
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, msg));
    }
    const orderObject = dr.unwrap();

    const queryOrderPath = `/orders/${orderObject.key}`;

    // 创建pathOpEnv
    let pathOpEnv: cyfs.PathOpEnvStub;
    const createRet = await stack.root_state_stub().create_path_op_env();
    if (createRet.err) {
        const msg = `create_path_op_env failed, ${createRet}.`;
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InternalError, msg));
    }
    pathOpEnv = createRet.unwrap();

    // 路径上锁
    const paths = [queryOrderPath];
    console.log(`will lock paths ${JSON.stringify(paths)}`);
    const lockR = await pathOpEnv.lock(paths, cyfs.JSBI.BigInt(30000));
    if (lockR.err) {
        const errMsg = `lock failed, ${lockR}`;
        console.error(errMsg);
        pathOpEnv.abort();
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }

    // 上锁成功
    console.log(`lock ${JSON.stringify(paths)} success.`);

    // 从路径获取对象
    const idR = await pathOpEnv.get_by_path(queryOrderPath);
    if (idR.err) {
        const errMsg = `get_by_path (${queryOrderPath}) failed, ${idR}`;
        pathOpEnv.abort();
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }
    const id = idR.unwrap();
    if (!id) {
        const errMsg = `unwrap failed after get_by_path (${queryOrderPath}), ${idR}`;
        pathOpEnv.abort();
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }

    // 获取对象
    const gr = await stack.non_service().get_object({
        common: { level: cyfs.NONAPILevel.NOC, flags: 0 },
        object_id: id
    });
    if (gr.err) {
        const errMsg = `get_object from non_service failed, path(${queryOrderPath}), ${idR}`;
        pathOpEnv.abort();
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }

    // 释放锁
    pathOpEnv.abort();
    const orderResult = gr.unwrap().object.object_raw;

    // 解码
    const decoder = new OrderDecoder();
    const r = decoder.from_raw(orderResult);
    if (r.err) {
        const msg = `decode failed, ${r}.`;
        console.error(msg);
        return Promise.resolve(
            makeBuckyErr(cyfs.BuckyErrorCode.Failed, 'decode order obj from raw excepted.')
        );
    }
    const orderObj = r.unwrap();
    return Promise.resolve(
        cyfs.Ok({
            action: cyfs.RouterHandlerAction.Response,
            response: cyfs.Ok({
                object: toNONObjectInfo(orderObj)
            })
        })
    );
}
