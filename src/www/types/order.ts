import * as cyfs from 'cyfs-sdk';
export interface OrderObject {
    key: string;
    decId: cyfs.ObjectId;
    owner: cyfs.ObjectId;
    timestamp?: number;
    price?: number;
    buyer?: string;
    status?: OrderStatus;
}

export const enum OrderStatus {
    CLOSED = 0,
    OPEN = 1
}
