import * as cyfs from 'cyfs-sdk';
import { OrderDecoder } from '../../common/objs/order';
import { checkStack } from '../../common/cyfs_helper/stack_wraper';
import { AppObjectType } from '../../common/types';
import { toNONObjectInfo, makeBuckyErr } from '../../common/cyfs_helper/kits';

export async function retrieveOrderRouter(
    req: cyfs.RouterHandlerPostObjectRequest
): Promise<cyfs.BuckyResult<cyfs.RouterHandlerPostObjectResult>> {
    // 解析出请求对象，判断请求对象是否是 Order 对象
    const { object, object_raw } = req.request.object;
    if (!object || object.obj_type() !== AppObjectType.ORDER) {
        const msg = `obj_type err.`;
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InvalidParam, msg));
    }

    // 使用 OrderDecoder 解码出 Order 对象
    const orderDecoder = new OrderDecoder();
    const dr = orderDecoder.from_raw(object_raw);
    if (dr.err) {
        const msg = `decode failed, ${dr}.`;
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, msg));
    }
    const orderObject = dr.unwrap();

    // 创建pathOpEnv,用来对RootState上的对象进行事务操作
    let pathOpEnv: cyfs.PathOpEnvStub;
    const stack = checkStack().check();
    const createRet = await stack.root_state_stub().create_path_op_env();
    if (createRet.err) {
        const msg = `create_path_op_env failed, ${createRet}.`;
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InternalError, msg));
    }
    pathOpEnv = createRet.unwrap();

    // 确定要查询的 Order 对象的存储路径并对该路径上锁
    const queryOrderPath = `/orders/${orderObject.key}`;
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

    // 使用 pathOpEnv 的 get_by_path 方法从 Order 对象的存储路径中获取 Order 对象的 object_id
    const idR = await pathOpEnv.get_by_path(queryOrderPath);
    if (idR.err) {
        const errMsg = `get_by_path (${queryOrderPath}) failed, ${idR}`;
        pathOpEnv.abort();
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }
    const id = idR.unwrap();
    if (!id) {
        const errMsg = `objectId not found after get_by_path (${queryOrderPath}), ${idR}`;
        pathOpEnv.abort();
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }

    // 使用 get_object 方法，以 Order 对象的 object_id 为参数从 RootState 上获取到 Order 对象对应的 cyfs.NONGetObjectOutputResponse 对象
    const gr = await stack.non_service().get_object({
        common: { level: cyfs.NONAPILevel.NOC, flags: 0 },
        object_id: id
    });
    if (gr.err) {
        const errMsg = `get_object from non_service failed, path(${queryOrderPath}), ${idR}`;
        pathOpEnv.abort();
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }

    // 释放锁后，对 Uint8Array 格式的 Order 对象进行解码，得到最终的 Order对象
    pathOpEnv.abort();
    const orderResult = gr.unwrap().object.object_raw;
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
    // 将解码后得到的 Order 对象返回给前端
    return Promise.resolve(
        cyfs.Ok({
            action: cyfs.RouterHandlerAction.Response,
            response: cyfs.Ok({
                object: toNONObjectInfo(orderObj)
            })
        })
    );
}
