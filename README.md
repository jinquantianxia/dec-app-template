# dec-app-template

一套标准化的 dec-app 项目模板。

## CYFS 项目基本编译命令

-   执行 yarn 安装依赖
-   执行 yarn proto-mac 编译 proto 文件为 js 文件，需要先执行 yarn proto-mac-pre (mac)
-   执行 yarn proto-windows 编译 proto 文件为 js 文件(windows)
-   执行 yarn dev 启动本地前端服务，从`cyfs 浏览器`可以实时查看修改效果
-   运行 tools/zone-simulator.exe，打开模拟器。注意：如果只是同 Zone 接口测试，使用 sim1 即可，如果需要测试跨 Zone 接口，需再打开 sim2
-   执行 yarn sim1 启动运行于本地模拟器上的`sim1`,
-   执行 yarn sim2 启动运行于本地模拟器上的`sim2`
-   执行 yarn build 执行构建任务
-   执行 yarn deploy 部署`DEC App`到`OOD`，用户可安装，mac 系统需要先执行 yarn mac-deploy-pre
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

## mac 环境下编译 proto 文件为 Typescript

在项目根目录下，执行指令如下：

```shell
yarn proto-mac-pre
yarn proto-mac
```

**注意** 由于是直接执行的 protoc 执行程序，可能会弹窗提示 _无法打开“protoc”，因为无法验证开发者_，需要开发者按照以下路径去设置：
_系统偏好设置_ -> _安全性与隐私_ -> _允许从以下位置下载的 App_ -> 选择 _App Store 和认可的开发者_ -> 点击 _仍然允许_
按照这个路径设置好，重新执行指令即可。
运行完毕，在 src/common/objs 文件夹下，生成了 obj_proto_pb.d.ts 和 obj_proto_pb.js 这两个文件。在 obj_proto_pb.d.ts 声明文件中，我们看到了 Order 对象的类型定义。
