import { ROUTER_PATHS } from '@src/common/routers';
import { HelloRequestObject } from '@src/common/objs/hello_request_object';
import { HelloResponseObjectDecoder } from '@src/common/objs/hello_response_object';
import { checkStack } from '@src/common/cyfs_helper/stack_wraper';
import * as cyfs from 'cyfs-sdk';
import { stack } from '../initialize';

// test/hello
export async function helloWorldSimple(name: string) {
    const stackWraper = checkStack();
    const helloObject = HelloRequestObject.create({
        name,
        decId: stackWraper.decId!,
        owner: stackWraper.checkOwner()
    });
    const ret = await stackWraper.postObject(helloObject, HelloResponseObjectDecoder, {
        reqPath: ROUTER_PATHS.TEST_HELLO,
        decId: stackWraper.decId,
        target: stackWraper.checkOwner()
    });
    if (ret.err) {
        console.error(`reponse err, ${ret}`);
        return null;
    }
    const helloResponseObject = ret.unwrap();
    console.log(`test api success, response: ${helloResponseObject?.greet}`);
    alert(helloResponseObject?.greet);
}

export async function helloWorld(name: string) {
    // cyfs.config.json -> app_id
    const decId = cyfs.ObjectId.from_base_58(
        '9tGpLNnfhjHxqiTKDCpgAipBVh4qjCDjxYGsUEy5p5EZ'
    ).unwrap();
    // mac-> ~/Library/cyfs/etc/zone-simulator/desc_list -> zone1 -> peopleId
    // windows -> C:\cyfs\etc\zone-simulator\desc_list -> zone1 -> peopleId
    const owner = cyfs.ObjectId.from_base_58(
        '5r4MYfFerMy9R84TQjM6BZZjr19WkMgKkeCVJwtCpK2e'
    ).unwrap();
    // 创建 HelloRequestObject 请求对象
    const helloObject = HelloRequestObject.create({
        name,
        decId,
        owner
    });
    // 发起请求
    const ret = await stack.non_service().post_object({
        common: {
            req_path: '/test/hello',
            dec_id: decId,
            level: cyfs.NONAPILevel.Router,
            flags: 0
        },
        object: new cyfs.NONObjectInfo(
            helloObject.desc().object_id(),
            helloObject.encode_to_buf().unwrap()
        )
    });
    if (ret.err) {
        console.error(`test api failed, ${ret}`);
        return ret;
    }
    const nonObject = ret.unwrap();
    // 使用 HelloResponseObjectDecoder 解析 HelloResponseObject 对象
    const r = new HelloResponseObjectDecoder().from_raw(nonObject.object!.object_raw);
    if (r.err) {
        console.error(`test api failed, ${ret}`);
        return ret;
    }
    // 解析后的 HelloResponseObject 对象
    const helloResponseObject = r.unwrap();
    console.log(`test api success, response: ${helloResponseObject?.greet}`);
    // 读取 HelloResponseObject 对象的 greet 值
    alert(helloResponseObject?.greet);
}
