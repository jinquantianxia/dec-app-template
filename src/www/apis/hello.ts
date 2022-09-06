import { ROUTER_PATHS } from '@src/common/routers';
import { HelloRequestObject } from '@src/common/objs/hello_request_object';
import { HelloResponseObjectDecoder } from '@src/common/objs/hello_response_object';
import { checkStack } from '@src/common/cyfs_helper/stack_wraper';

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
        decId: stackWraper.decId
    });
    if (ret.err) {
        console.error(`reponse err, ${ret}`);
        return null;
    }
    const helloResponseObject = ret.unwrap();
    console.log(`test api success, response: ${helloResponseObject?.greet}`);
    alert(helloResponseObject?.greet);
}
