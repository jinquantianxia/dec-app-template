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
    const { object, object_raw } = req.request.object;
    // 接收Order对象
    if (!object || object.obj_type() !== AppObjectType.ORDER) {
        const msg = 'obj_type err.';
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InvalidParam, msg));
    }
    const stack = checkStack().check();
    let OrderObject: CreateOrderRequestParam;
    // 解码
    const decoder = new OrderDecoder();
    const dr = decoder.from_raw(object_raw);
    if (dr.err) {
        const msg = `decode failed, ${dr}.`;
        console.error(msg);
        return dr;
    }
    OrderObject = dr.unwrap();

    const path = `/orders/${OrderObject.key}`;
    console.log(`will create order, ${OrderObject.key}`);

    // 创建pathOpEnv
    let pathOpEnv: cyfs.PathOpEnvStub;
    const r = await stack.root_state_stub().create_path_op_env();
    if (r.err) {
        const msg = `create_path_op_env failed, ${r}.`;
        console.error(msg);
        return r;
    }
    pathOpEnv = r.unwrap();

    // 路径上锁
    const paths = [path];
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

    const decId = stack.dec_id!;
    const nonObj = new cyfs.NONObjectInfo(
        OrderObject.desc().object_id(),
        OrderObject.encode_to_buf().unwrap()
    );
    // 更新对象
    const putR = await stack.non_service().put_object({
        common: {
            dec_id: decId,
            level: cyfs.NONAPILevel.NOC,
            // NDC 对应non的noc level，仅限本地操作，不会发起网络操作
            // NDN 对应non的non level，仅限同zone操作，可以指定一个zone内的target，不指定则代表本地协议栈
            // Router 对应non的router操作，有一系列的内部默认操作，target可以指定people等有权对象，这个受acl配置控制
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
    const objectId = nonObj.object_id;

    // 插入新对象
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
    const respObj: CreateOrderResponseParam = ResponseObject.create({
        err: 0,
        msg: 'ok',
        decId: stack.dec_id!,
        owner: checkStack().checkOwner()
    });

    // 跨zone通知
    // const stackWraper = checkStack();
    // const peopleId = '5r4MYfFVtnu7yAP5XSZGg8JsqZuzyqozH6oXCLMPb8h8'; // If here is the windows simulator environment, C:\cyfs\etc\zone-simulator\desc_list -> zone2 -> people, otherwise, you should use real poepleId.
    // await stackWraper.postObject(OrderObject, ResponseObjectDecoder, {
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
