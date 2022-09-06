import * as cyfs from 'cyfs-sdk';
import { checkStack } from '../../common/cyfs_helper/stack_wraper';
import { AppObjectType } from '../../common/types';
import { DeleteOrderRequestParam, DeleteOrderResponseParam } from '../../common/routers';
import { ResponseObject } from '../../common/objs/response_object';
import { toNONObjectInfo, makeBuckyErr } from '../../common/cyfs_helper/kits';
import { OrderDecoder } from '../../common/objs/order';

export async function deleteOrderRouter(
    req: cyfs.RouterHandlerPostObjectRequest
): Promise<cyfs.BuckyResult<cyfs.RouterHandlerPostObjectResult>> {
    const { object, object_raw } = req.request.object;

    // 接收Order对象
    if (!object || object.obj_type() !== AppObjectType.ORDER) {
        const msg = `obj_type err.`;
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InvalidParam, msg));
    }

    // 解码
    const decoder = new OrderDecoder();
    const r = decoder.from_raw(object_raw);
    if (r.err) {
        const msg = `decode failed, ${r}.`;
        console.error(msg);
        return r;
    }
    const reqObj = r.unwrap();
    const queryOrderPath = `/orders/${reqObj.key}`;

    // 创建pathOpEnv
    let pathOpEnv: cyfs.PathOpEnvStub;
    const stack = checkStack().check();
    let createRet = await stack.root_state_stub().create_path_op_env();
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
    const objectId = idR.unwrap();
    if (!objectId) {
        const errMsg = `unwrap failed after get_by_path (${queryOrderPath}) failed, ${idR}`;
        pathOpEnv.abort();
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }

    // 删除对象
    const rm = await pathOpEnv.remove_with_path(queryOrderPath, objectId);
    console.log(`remove_with_path(${queryOrderPath}, ${objectId.to_base_58()}), ${rm}`);
    if (rm.err) {
        console.error(`commit remove_with_path(${queryOrderPath}, ${objectId}), ${rm}.`);
        pathOpEnv.abort();
        return rm;
    }

    // 事务提交
    const ret = await pathOpEnv.commit();
    if (ret.err) {
        const errMsg = `commit failed, ${ret}`;
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    } else {
        const respObj: DeleteOrderResponseParam = ResponseObject.create({
            err: 0,
            msg: 'ok',
            decId: stack.dec_id!,
            owner: checkStack().checkOwner()
        });
        return Promise.resolve(
            cyfs.Ok({
                action: cyfs.RouterHandlerAction.Response,
                response: cyfs.Ok({
                    object: toNONObjectInfo(respObj)
                })
            })
        );
    }
}
