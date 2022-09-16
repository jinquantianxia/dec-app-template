// 启动初始化入口
import * as cyfs from 'cyfs-sdk';
import { DEC_ID, APP_NAME } from '../common/constant';
import {
    waitStackRuntime,
    useSimulator,
    SimulatorZoneNo,
    SimulatorDeviceNo
} from '../common/cyfs_helper/stack_wraper';
import * as MetaClient from '../common/cyfs_helper/meta_client';

export async function init() {
    // zoneNo: FIRST -> simulator1, SECOND -> simulator2, REAL -> production environment
    // deviceNo: Just use the default SimulatorDeviceNo.FIRST
    useSimulator(SimulatorZoneNo.FIRST, SimulatorDeviceNo.FIRST);
    // MetaClient choose "nightly"
    MetaClient.init(MetaClient.EnvTarget.NIGHTLY);
    await waitStackRuntime(DEC_ID);
}
