import * as cyfs from 'cyfs-sdk';

export const DEC_ID_BASE58 = '9tGpLNnfhjHxqiTKDCpgAipBVh4qjCDjxYGsUEy5p5EZ'; // cyfs.config.json -> app_id

export const DEC_ID = cyfs.ObjectId.from_base_58(DEC_ID_BASE58).unwrap();

export const APP_NAME = 'demo'; // cyfs.config.json -> app_name
