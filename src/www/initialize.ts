// Start the initialization entry
import * as cyfs from 'cyfs-sdk';
import { DEC_ID, APP_NAME } from '../common/constant';
import {
    waitStackRuntime,
    useSimulator,
    SimulatorZoneNo,
    SimulatorDeviceNo
} from '../common/cyfs_helper/stack_wraper';
import * as MetaClient from '../common/cyfs_helper/meta_client';

// export async function init() {
//     // zoneNo: FIRST -> simulator1, SECOND -> simulator2, REAL -> production environment
//     // deviceNo: Just use the default SimulatorDeviceNo.FIRST
//     useSimulator(SimulatorZoneNo.FIRST, SimulatorDeviceNo.FIRST);
//     // MetaClient choose "nightly"
//     MetaClient.init(MetaClient.EnvTarget.BETA);
//     await waitStackRuntime(DEC_ID);
// }

export let stack: cyfs.SharedCyfsStack;

export async function init() {
    // 模拟器zone1-ood1的http-port
    const service_http_port = 21000;
    // 模拟器zone1-ood1的ws-port
    const ws_port = 21001;
    // cyfs.config.json -> app_id
    const decId = cyfs.ObjectId.from_base_58(
        '9tGpLNnfhjHxqiTKDCpgAipBVh4qjCDjxYGsUEy5p5EZ'
    ).unwrap();
    // 打开模拟器SharedCyfsStack所需参数
    const param = cyfs.SharedCyfsStackParam.new_with_ws_event_ports(
        service_http_port,
        ws_port,
        decId
    );
    if (param.err) {
        console.error(`init SharedCyfsStackParam failed, ${param}`);
        return;
    }
    // 打开SharedCyfsStack
    stack = cyfs.SharedCyfsStack.open(param.unwrap());
    // 等待Stack上线
    while (true) {
        const r = await stack.wait_online(cyfs.JSBI.BigInt(1000000));
        if (r.err) {
            console.error(`wait online err: ${r.val}`);
        } else {
            console.info('online success.');
            break;
        }
    }
}
