import * as cyfs from 'cyfs-sdk';
import { OrderDecoder } from '../../common/objs/order';
import { checkStack } from '../../common/cyfs_helper/stack_wraper';
import { AppObjectType } from '../../common/types';
import { toNONObjectInfo } from '../../common/cyfs_helper/kits';
import { ResponseObject } from '../../common/objs/response_object';
import { CreateOrderReqResponseParam } from '../../common/routers';

export async function createOrderReqRouter(
    req: cyfs.RouterHandlerPostObjectRequest
): Promise<cyfs.BuckyResult<cyfs.RouterHandlerPostObjectResult>> {
    const stack = checkStack().check();
    const owner = stack.local_device().desc().owner()!.unwrap();
    console.log(`current target -----> ${req.request.common.target?.to_base_58()}`);
    if (!owner.equals(req.request.common.target!)) {
        console.log(`should transfer to -> ${req.request.common.target}`);
        return Promise.resolve(
            cyfs.Ok({
                action: cyfs.RouterHandlerAction.Pass
            })
        );
    }

    // Parse out the request object and determine whether the request object is an Order object
    const { object, object_raw } = req.request.object;
    if (!object || object.obj_type() !== AppObjectType.ORDER) {
        const msg = 'obj_type err.';
        console.error(msg);
        return Promise.resolve(
            cyfs.Err(new cyfs.BuckyError(cyfs.BuckyErrorCode.InvalidParam, msg))
        );
    }
    // Use OrderDecoder to decode the Order object
    const decoder = new OrderDecoder();
    const dr = decoder.from_raw(object_raw);
    if (dr.err) {
        const msg = `decode failed, ${dr}.`;
        console.error(msg);
        return dr;
    }
    const OrderObject = dr.unwrap();

    console.log(`will create order, ${OrderObject.key}`);

    // Create pathOpEnv to perform transaction operations on objects on RootState
    let pathOpEnv: cyfs.PathOpEnvStub;
    const r = await stack.root_state_stub().create_path_op_env();
    if (r.err) {
        const msg = `create_path_op_env failed, ${r}.`;
        console.error(msg);
        return r;
    }
    pathOpEnv = r.unwrap();

    // Determine the path where the new Order object will be stored and lock the path
    const path = `/orders/${OrderObject.key}`;
    const paths = [path];
    console.log(`will lock paths ${JSON.stringify(paths)}`);
    const lockR = await pathOpEnv.lock(paths, cyfs.JSBI.BigInt(30000));
    if (lockR.err) {
        const errMsg = `lock failed, ${lockR}`;
        console.error(errMsg);
        pathOpEnv.abort();
        return Promise.resolve(cyfs.Err(new cyfs.BuckyError(cyfs.BuckyErrorCode.Failed, errMsg)));
    }

    // Locked successfully
    console.log(`lock ${JSON.stringify(paths)} success.`);

    // Use the Order object information to create the corresponding NONObjectInfo object, and add the NONObjectInfo object to the RootState through the put_object operation
    const decId = stack.dec_id!;
    const nonObj = new cyfs.NONObjectInfo(
        OrderObject.desc().object_id(),
        OrderObject.encode_to_buf().unwrap()
    );
    const putR = await stack.non_service().put_object({
        common: {
            dec_id: decId,
            level: cyfs.NONAPILevel.NOC,
            flags: 0
        },
        object: nonObj
    });
    if (putR.err) {
        pathOpEnv.abort();
        const errMsg = `commit put-object failed, ${putR}.`;
        console.error(errMsg);
        return Promise.resolve(cyfs.Err(new cyfs.BuckyError(cyfs.BuckyErrorCode.Failed, errMsg)));
    }

    // Use the object_id of NONObjectInfo for the transaction operation of creating a new Order object
    const objectId = nonObj.object_id;
    const rp = await pathOpEnv.insert_with_path(path, objectId);
    if (rp.err) {
        pathOpEnv.abort();
        const errMsg = `commit insert_with_path(${path}, ${objectId}), ${rp}.`;
        console.error(errMsg);
        return Promise.resolve(cyfs.Err(new cyfs.BuckyError(cyfs.BuckyErrorCode.Failed, errMsg)));
    }

    // transaction commit
    const ret = await pathOpEnv.commit();
    if (ret.err) {
        const errMsg = `commit failed, ${ret}.`;
        console.error(errMsg);
        return Promise.resolve(cyfs.Err(new cyfs.BuckyError(cyfs.BuckyErrorCode.Failed, errMsg)));
    }

    // Transaction operation succeeded
    console.log('create new order success.');

    // Create a ResponseObject object as a response parameter and respond back with the result
    const respObj: CreateOrderReqResponseParam = ResponseObject.create({
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
