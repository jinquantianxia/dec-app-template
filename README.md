# dec-app-template

A set of standardized dec-app project templates.

## CYFS project basic compilation command

-   Execute yarn install dependencies
-   Execute yarn proto-mac to compile proto files into js files, you need to execute yarn proto-mac-pre (mac) first
-   Execute yarn proto-windows to compile proto files into js files (windows)
-   Execute yarn dev to start the local front-end service, and you can view the modification effect in real time from the `cyfs browser`
-   Run tools/zone-simulator.exe to open the simulator. Note: If you only test the same zone interface, use sim1, if you need to test the cross-zone interface, you need to open sim2 again
-   execute yarn sim1 to start `sim1` running on the local emulator,
-   Execute yarn sim2 to start `sim2` running on the local emulator
-   execute yarn build to execute the build task
-   Execute yarn deploy to deploy `DEC App` to `OOD`, the user can install it, the mac system needs to execute yarn mac-deploy-pre first
-   execute yarn lint to execute eslint checks
-   execute yarn lint_fix to execute eslint autofix

## CYFS project directory structure description

-   Meta information of .cyfs project and Owner
-   cyfs.config.json is the configuration file for the Dec App project
-   service_package.cfg is the server configuration file of the Dec App project
-   move_deploy.js is the necessary file move operation before deploy
-   The deploy directory is the output directory of the project compilation, and the `cyfs` package refers to the files here
-   The dist directory is the storage directory for the front-end package files of the Dec App project
-   doc directory to store documents
-   src storage code directory

## Compile the proto file as Typescript in the mac environment

In the project root directory, execute the command as follows:

```shell
yarn proto-mac-pre
yarn proto-mac
```

**Note** Since the protoc executable program is directly executed, a pop-up window may prompt _cannot open "protoc" because the developer cannot be verified_, and the developer needs to set it according to the following path:
_System Preferences_ -> _Security & Privacy_ -> _Allow Apps Downloaded from_ -> Select _App Store and Approved Developers_ -> Click _Allow Still_
Follow this path to set it up and execute the command again.
After running, two files, obj_proto_pb.d.ts and obj_proto_pb.js, are generated in the src/common/objs folder. In the obj_proto_pb.d.ts declaration file, we see the type definition of the Order object.
