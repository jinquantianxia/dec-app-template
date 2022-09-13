import * as cyfs from 'cyfs-sdk';
import { OrderDecoder } from '../../common/objs/order';
import { ResponseObject, ResponseObjectDecoder } from '../../common/objs/response_object';
import { checkStack } from '../../common/cyfs_helper/stack_wraper';
import { toNONObjectInfo, makeBuckyErr } from '../../common/cyfs_helper/kits';
import { AppObjectType } from '../../common/types';
import {
    ROUTER_PATHS,
    CreateOrderRequestParam,
    CreateOrderResponseParam
} from '../../common/routers';

export async function createOrderRouter(
    req: cyfs.RouterHandlerPostObjectRequest
): Promise<cyfs.BuckyResult<cyfs.RouterHandlerPostObjectResult>> {
    // 解析出请求对象，判断请求对象是否是 Order 对象
    const { object, object_raw } = req.request.object;
    if (!object || object.obj_type() !== AppObjectType.ORDER) {
        const msg = 'obj_type err.';
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InvalidParam, msg));
    }

    // 使用 OrderDecoder 解码出 Order 对象
    const decoder = new OrderDecoder();
    const dr = decoder.from_raw(object_raw);
    if (dr.err) {
        const msg = `decode failed, ${dr}.`;
        console.error(msg);
        return dr;
    }
    const orderObject = dr.unwrap();

    // 创建pathOpEnv,用来对RootState上的对象进行事务操作
    let pathOpEnv: cyfs.PathOpEnvStub;
    const stack = checkStack().check();
    const r = await stack.root_state_stub().create_path_op_env();
    if (r.err) {
        const msg = `create_path_op_env failed, ${r}.`;
        console.error(msg);
        return r;
    }
    pathOpEnv = r.unwrap();

    // 确定新 Order 对象将要存储的路径并对该路径上锁
    const path = `/orders/${orderObject.key}`;
    console.log(`will create order, ${orderObject.key}`);
    const paths = [path];
    console.log(`will lock paths ${JSON.stringify(paths)}`);
    const lockR = await pathOpEnv.lock(paths, cyfs.JSBI.BigInt(30000));
    if (lockR.err) {
        const errMsg = `lock failed, ${lockR}`;
        console.error(errMsg);
        pathOpEnv.abort();
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }
    console.log(`lock ${JSON.stringify(paths)} success.`);

    // 利用 Order 对象信息创建对应的 NONObjectInfo 对象，通过put_object操作，把 NONObjectInfo 对象新增到 RootState 上
    const decId = stack.dec_id!;
    const nonObj = new cyfs.NONObjectInfo(
        orderObject.desc().object_id(),
        orderObject.encode_to_buf().unwrap()
    );
    const putR = await stack.non_service().put_object({
        common: {
            dec_id: decId,
            level: cyfs.NONAPILevel.NOC, // 仅限本地操作，不会发起网络操作
            flags: 0
        },
        object: nonObj
    });
    if (putR.err) {
        pathOpEnv.abort();
        const errMsg = `commit put-object failed, ${putR}.`;
        console.error(errMsg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }

    // 使用 NONObjectInfo 的 object_id 进行创建新 Order 对象的事务操作
    const objectId = nonObj.object_id;
    const rp = await pathOpEnv.insert_with_path(path, objectId);
    if (rp.err) {
        pathOpEnv.abort();
        const errMsg = `commit insert_with_path(${path}, ${objectId}), ${rp}.`;
        console.error(errMsg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }

    // 事务提交
    const ret = await pathOpEnv.commit();
    if (ret.err) {
        const errMsg = `commit failed, ${ret}.`;
        console.error(errMsg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }
    // 事务操作成功
    console.log('create new order success.');

    // 创建 ResponseObject 对象作为响应参数并将结果发给前端
    const respObj: CreateOrderResponseParam = ResponseObject.create({
        err: 0,
        msg: 'ok',
        decId: stack.dec_id!,
        owner: checkStack().checkOwner()
    });

    // 跨zone通知，通知指定的用户OOD
    // const stackWraper = checkStack();
    // // If here is the windows simulator environment, C:\cyfs\etc\zone-simulator\desc_list -> zone2 -> people,
    // // If here is the mac simulator environment, /Users/<username>/Library/Application Support/cyfs/etc/zone-simulator/desc_list -> zone2 -> people,
    // // otherwise, you should use real poepleId.
    // const peopleId = '5r4MYfFVtnu7yAP5XSZGg8JsqZuzyqozH6oXCLMPb8h8';
    // await stackWraper.postObject(orderObject, ResponseObjectDecoder, {
    //     reqPath: ROUTER_PATHS.CREATE_ORDER_REQ,
    //     decId: stack.dec_id!,
    //     target: cyfs.PeopleId.from_base_58(peopleId).unwrap().object_id // Here is the difference between the same zone and cross zone.
    // });
    return Promise.resolve(
        cyfs.Ok({
            action: cyfs.RouterHandlerAction.Response,
            response: cyfs.Ok({
                object: toNONObjectInfo(respObj)
            })
        })
    );
}
