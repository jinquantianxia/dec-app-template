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
    // deviceNo: 使用默认的 SimulatorDeviceNo.FIRST 即可
    useSimulator(SimulatorZoneNo.FIRST, SimulatorDeviceNo.FIRST);
    // MetaClient 选择 "nightly"
    MetaClient.init(MetaClient.EnvTarget.NIGHTLY);
    await waitStackRuntime(DEC_ID);
}
