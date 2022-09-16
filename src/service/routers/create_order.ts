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
    // Parse out the request object and determine whether the request object is an Order object
    const { object, object_raw } = req.request.object;
    if (!object || object.obj_type() !== AppObjectType.ORDER) {
        const msg = 'obj_type err.';
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InvalidParam, msg));
    }

    // Use OrderDecoder to decode the Order object
    const decoder = new OrderDecoder();
    const dr = decoder.from_raw(object_raw);
    if (dr.err) {
        const msg = `decode failed, ${dr}.`;
        console.error(msg);
        return dr;
    }
    const orderObject = dr.unwrap();

    // Create pathOpEnv to perform transaction operations on objects on RootState
    let pathOpEnv: cyfs.PathOpEnvStub;
    const stack = checkStack().check();
    const r = await stack.root_state_stub().create_path_op_env();
    if (r.err) {
        const msg = `create_path_op_env failed, ${r}.`;
        console.error(msg);
        return r;
    }
    pathOpEnv = r.unwrap();

    // Determine the path where the new Order object will be stored and lock the path
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

    // Use the Order object information to create the corresponding NONObjectInfo object, and add the NONObjectInfo object to the RootState through the put_object operation
    const decId = stack.dec_id!;
    const nonObj = new cyfs.NONObjectInfo(
        orderObject.desc().object_id(),
        orderObject.encode_to_buf().unwrap()
    );
    const putR = await stack.non_service().put_object({
        common: {
            dec_id: decId,
            level: cyfs.NONAPILevel.NOC, // Local operation only, no network operation will be initiated
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

    // Use the object_id of NONObjectInfo for the transaction operation of creating a new Order object
    const objectId = nonObj.object_id;
    const rp = await pathOpEnv.insert_with_path(path, objectId);
    if (rp.err) {
        pathOpEnv.abort();
        const errMsg = `commit insert_with_path(${path}, ${objectId}), ${rp}.`;
        console.error(errMsg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }

    // transaction commit
    const ret = await pathOpEnv.commit();
    if (ret.err) {
        const errMsg = `commit failed, ${ret}.`;
        console.error(errMsg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }
    // Transaction operation succeeded
    console.log('create new order success.');

    // Create a ResponseObject object as a response parameter and send the result to the front end
    const respObj: CreateOrderResponseParam = ResponseObject.create({
        err: 0,
        msg: 'ok',
        decId: stack.dec_id!,
        owner: checkStack().checkOwner()
    });

    // Cross-zone notification, notify the specified user OOD
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
