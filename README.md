# dec-app-template

一套标准化的 dec-app 项目模板。

## CYFS 项目基本编译命令

-   执行 yarn 安装依赖
-   执行 yarn dev 启动本地前端服务，从`cyfs 浏览器`可以实时查看修改效果
-   运行 tool/zone-simulator.exe，打开模拟器环境。注意：如果只是同 Zone 接口测试，使用 sim1 即可，如果需要测试跨 Zone 接口，需再打开 sim2
-   执行 yarn sim1 启动运行于本地模拟器上的`sim1`,
-   执行 yarn sim2 启动运行于本地模拟器上的`sim2`
-   执行 yarn build 执行构建任务
-   执行 yarn deploy 部署`DEC App`到`OOD`，用户可安装
-   执行 yarn lint 执行 eslint 检查
-   执行 yarn lint_fix 执行 eslint 自动修复

## CYFS 项目目录结构说明

-   .cyfs 项目和 Owner 的元信息
-   cyfs.config.json 是 Dec App 项目的配置文件
-   service_package.cfg 是 Dec App 项目的服务端配置文件
-   move_deploy.js 是 deploy 前必要的文件移动操作
-   deploy 目录是项目编译的输出目录，`cyfs`打包即是引用这里的文件
-   dist 目录是 Dec App 项目前端打包文件存放目录
-   doc 目录存放文档
-   src 存放代码目录
