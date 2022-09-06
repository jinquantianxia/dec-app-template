import * as cyfs from 'cyfs-sdk';

export class AppInstaller {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    public constructor() {}

    public async init(): Promise<cyfs.BuckyResult<void>> {
        console.info(`eood app install success.`);

        return cyfs.Ok(undefined);
    }
}

async function main() {
    // TODO
    // 就是一个初始化操作，暂时没有相关需要
    console.info('eood app will open stack for install.');

    // await waitStackOOD();
}

main();
