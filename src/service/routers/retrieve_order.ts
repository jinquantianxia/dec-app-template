import * as cyfs from 'cyfs-sdk';
import { OrderDecoder } from '../../common/objs/order';
import { checkStack } from '../../common/cyfs_helper/stack_wraper';
import { AppObjectType } from '../../common/types';
import { toNONObjectInfo, makeBuckyErr } from '../../common/cyfs_helper/kits';

export async function retrieveOrderRouter(
    req: cyfs.RouterHandlerPostObjectRequest
): Promise<cyfs.BuckyResult<cyfs.RouterHandlerPostObjectResult>> {
    // Parse out the request object and determine whether the request object is an Order object
    const { object, object_raw } = req.request.object;
    if (!object || object.obj_type() !== AppObjectType.ORDER) {
        const msg = `obj_type err.`;
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InvalidParam, msg));
    }

    // Use OrderDecoder to decode the Order object
    const orderDecoder = new OrderDecoder();
    const dr = orderDecoder.from_raw(object_raw);
    if (dr.err) {
        const msg = `decode failed, ${dr}.`;
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, msg));
    }
    const orderObject = dr.unwrap();

    // Create pathOpEnv to perform transaction operations on objects on RootState
    let pathOpEnv: cyfs.PathOpEnvStub;
    const stack = checkStack().check();
    const createRet = await stack.root_state_stub().create_path_op_env();
    if (createRet.err) {
        const msg = `create_path_op_env failed, ${createRet}.`;
        console.error(msg);
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.InternalError, msg));
    }
    pathOpEnv = createRet.unwrap();

    // Determine the storage path of the Order object to be queried and lock the path
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

    // Locked successfully
    console.log(`lock ${JSON.stringify(paths)} success.`);

    // Use the get_by_path method of pathOpEnv to get the object_id of the Order object from the storage path of the Order object
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

    // Use the get_object method to obtain the cyfs.NONGetObjectOutputResponse object corresponding to the Order object from RootState with the object_id of the Order object as a parameter
    const gr = await stack.non_service().get_object({
        common: { level: cyfs.NONAPILevel.NOC, flags: 0 },
        object_id: id
    });
    if (gr.err) {
        const errMsg = `get_object from non_service failed, path(${queryOrderPath}), ${idR}`;
        pathOpEnv.abort();
        return Promise.resolve(makeBuckyErr(cyfs.BuckyErrorCode.Failed, errMsg));
    }

    // After releasing the lock, decode the Order object in Uint8Array format to get the final Order object
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
    // Return the decoded Order object to the front end
    return Promise.resolve(
        cyfs.Ok({
            action: cyfs.RouterHandlerAction.Response,
            response: cyfs.Ok({
                object: toNONObjectInfo(orderObj)
            })
        })
    );
}
