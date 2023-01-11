import * as cyfs from 'cyfs-sdk';
import * as check_cmd from './check_cmd';
import { DEC_ID_BASE58, APP_NAME } from '../../common/constant';

async function main() {
    cyfs.clog.enable_file_log({
        name: APP_NAME,
        dir: cyfs.get_app_log_dir(APP_NAME)
    });
    console.info('employee app entry, DEC_ID = ', DEC_ID_BASE58);

    // 利用check_cmd_and_exec来确保进程提供正确的运行互斥和App Manager需要的功能
    // 这个name最好用DECId的字符串，避免和其他App进程冲突
    const install = check_cmd.check_cmd_and_exec(DEC_ID_BASE58);
    if (install) {
        // 如果执行'node service.js --install'，check_cmd_and_exec返回的install为true，这里一般做一些首次安装，或升级后初始化的工作
        // 在这个阶段，check_cmd_and_exec不会保持和检查进程锁，这个初始化完毕后要主动退出进程
        // check并初始化一下环境
        // const r = await new EmployeeInstall().init();
        // const exitCode = r.err ? -1 : 0;
        // console.info(`employee app will exit for install, exitCode=${exitCode}`);
        // process.exit(exitCode);
    }
    // 如果执行node service.js --start，或不带参数，install为false，走正常的启动流程
}

main();
