const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const { ensureDirSync } = require('cyfs-sdk');

function copyFileWithLog(src, dest) {
    console.info(`will copy from ${src} to ${dest}`);
    fs.copyFileSync(src, dest);
    console.info(`copy done from ${src} to ${dest}`);
}

function copyDirectory(src, dest) {
    const subFiles = fs.readdirSync(src);
    ensureDirSync(dest);

    subFiles.forEach((name) => {
        const srcFullPath = path.join(src, name);
        const fileState = fs.statSync(srcFullPath);
        const destFullPath = path.join(dest, name);

        if (fileState.isFile()) {
            if (name.slice(name.length - 7) !== '.js.map') {
                copyFileWithLog(srcFullPath, destFullPath);
            }
        } else {
            copyDirectory(srcFullPath, destFullPath);
        }
    });
}

function main() {
    copyFileWithLog('cyfs.config.json', 'deploy/cyfs.config.json');
    copyFileWithLog('service_package.cfg', 'deploy/service_package.cfg');
    copyFileWithLog('package.json', 'deploy/package.json');
    copyDirectory('.cyfs', 'deploy/.cyfs');
    copyFileWithLog('src/common/objs/obj_proto_pb.js', 'deploy/src/common/objs/obj_proto_pb.js');
    fsExtra.removeSync('deploy/src/www');
    copyDirectory('dist', 'deploy/src/www/dist');
}

main();
