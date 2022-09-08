import * as cyfs from 'cyfs-sdk';
import { DEC_ID, APP_NAME } from '../../common/constant';
import { postRouterHandleObject, RouterArray } from '../types';
import { routers } from '../routers';
import { checkStack, waitStackOOD } from '../../common/cyfs_helper/stack_wraper';

class PostRouterReqPathRouterHandler implements cyfs.RouterHandlerPostObjectRoutine {
    protected m_routerObj: postRouterHandleObject;
    public constructor(routerObj: postRouterHandleObject) {
        this.m_routerObj = routerObj;
    }

    public call(
        param: cyfs.RouterHandlerPostObjectRequest
    ): Promise<cyfs.BuckyResult<cyfs.RouterHandlerPostObjectResult>> {
        const reqPath = param.request.common.req_path;
        if (reqPath === this.m_routerObj.reqPath) {
            return this.m_routerObj.router(param);
        } else {
            return Promise.resolve(
                cyfs.Ok({
                    action: cyfs.RouterHandlerAction.Pass
                })
            );
        }
    }
}

async function addRouters(stack: cyfs.SharedCyfsStack, routers: RouterArray): Promise<void> {
    for (const routerObj of routers) {
        const handleId = `post-${routerObj.reqPath}`;
        const r = await stack.router_handlers().add_post_object_handler(
            cyfs.RouterHandlerChain.Handler,
            handleId,
            1,
            `dec_id==${stack.dec_id!}`, // filter config,只允许当前App的请求通过
            cyfs.RouterHandlerAction.Pass,
            cyfs.Some(new PostRouterReqPathRouterHandler(routerObj))
        );

        if (r.err) {
            console.error(`add post handler (${handleId}) failed, err: ${r}`);
        } else {
            console.info(`add post handler (${handleId}) success.`);
        }
    }
    console.log(`added ${Object.entries(routers).length} routers success.`);
}

async function main() {
    // 日志记录
    cyfs.clog.enable_file_log({
        name: APP_NAME,
        dir: cyfs.get_app_log_dir(APP_NAME)
    });
    // 等待上线
    const waitR = await waitStackOOD(DEC_ID);
    if (waitR.err) {
        console.error(`service start failed when wait stack online, err: ${waitR}.`);
        return;
    }
    // 注册路由
    const stack = checkStack().check();
    addRouters(stack, routers);
    console.log('service is ready.');
}

main();
