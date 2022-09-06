import * as cyfs from 'cyfs-sdk';
import { OrderDecoder } from '../../common/objs/order';
import { checkStack } from '../../common/cyfs_helper/stack_wraper';
import { AppObjectType } from '../../common/types';
import { UpdateOrderRequestParam, UpdateOrderResponseParam } from '../../common/routers';
import { ResponseObject } from '../../common/objs/response_object';
import { toNONObjectInfo, makeBuckyErr } from '../../common/cyfs_helper/kits';

export async function updateOrderRouter(
    req: cyfs.RouterHandlerPostObjectRequest
): Promise<cyfs.BuckyResult<cyfs.RouterHandlerPostObjectResult>> {
    const { object, object_raw } = req.request.object;

    // 接收Order对象
    if (!object || object.obj_type() !== AppObjectType.ORDER) {
        const msg = 'obj_type err.';
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InvalidParam, msg));
    }
    const stack = checkStack().check();
    const decId = stack.dec_id!;
    let orderObject: UpdateOrderRequestParam;

    // 解码
    const decoder = new OrderDecoder();
    const r = decoder.from_raw(object_raw);
    if (r.err) {
        const msg = `decode failed, ${r}.`;
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InvalidParam, msg));
    }
    orderObject = r.unwrap();

    const queryOrderPath = `/orders/${orderObject.key}`;

    // 创建pathOpEnv
    let pathOpEnv: cyfs.PathOpEnvStub;
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
    const id = idR.unwrap();
    if (!id) {
        const errMsg = `unwrap failed after get_by_path (${queryOrderPath}) failed, ${idR}`;
        pathOpEnv.abort();
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }

    const nonObj = new cyfs.NONObjectInfo(
        orderObject.desc().object_id(),
        orderObject.encode_to_buf().unwrap()
    );

    // 更新对象
    const putR = await stack.non_service().put_object({
        common: {
            dec_id: decId,
            level: cyfs.NONAPILevel.NOC,
            flags: 0
        },
        object: nonObj
    });
    if (putR.err) {
        console.error(`commit put-object failed, ${putR}.`);
        pathOpEnv.abort();
        return putR;
    }
    const objectId = nonObj.object_id;

    // 更新对象
    const rs = await pathOpEnv.set_with_path(queryOrderPath, objectId!, id, true);
    console.log(
        `set_with_path(${queryOrderPath}, ${objectId!.to_base_58()}, ${id.to_base_58()}, true), ${rs}`
    );
    if (rs.err) {
        console.error(`commit set_with_path(${queryOrderPath},${objectId},${id}), ${rs}.`);
        pathOpEnv.abort();
        return rs;
    }
    // 事务提交
    const ret = await pathOpEnv.commit();
    if (ret.err) {
        const errMsg = `commit failed, ${ret}`;
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    } else {
        const respObj: UpdateOrderResponseParam = ResponseObject.create({
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
