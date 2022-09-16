// ObjectName: Order
import * as cyfs from 'cyfs-sdk';
import { AppObjectType } from '../types';
import * as protos from './obj_proto_pb';
// The first 16 bits of type are reserved by the system, and the type of the applied object should be greater than 32767
export const ORDER_OBJECT_TYPE = AppObjectType.ORDER;

export class UserDescTypeInfo extends cyfs.DescTypeInfo {
    public obj_type(): number {
        return ORDER_OBJECT_TYPE;
    }

    public sub_desc_type(): cyfs.SubDescType {
        // default
        return {
            owner_type: 'option',
            area_type: 'option',
            author_type: 'option',
            key_type: 'disable'
        };
    }
}

const ORDER_DESC_TYPE_INFO = new UserDescTypeInfo();

export class OrderDescContent extends cyfs.ProtobufDescContent {
    private m_key: string;
    private m_timestamp?: number;
    private m_price?: number;
    private m_buyer?: string;
    private m_status?: protos.OrderStatusMap[keyof protos.OrderStatusMap];
    public constructor(param: {
        key: string;
        timestamp?: number;
        price?: number;
        buyer?: string;
        status?: protos.OrderStatusMap[keyof protos.OrderStatusMap];
    }) {
        super();
        this.m_key = param.key;
        this.m_timestamp = param.timestamp;
        this.m_price = param.price;
        this.m_buyer = param.buyer;
        this.m_status = param.status;
    }

    public type_info(): cyfs.DescTypeInfo {
        return ORDER_DESC_TYPE_INFO;
    }

    public try_to_proto(): cyfs.BuckyResult<protos.Order> {
        const target = new protos.Order();
        target.setKey(this.m_key);
        if (this.m_timestamp) target.setTimestamp(this.m_timestamp);
        if (this.m_price) target.setPrice(this.m_price);
        if (this.m_buyer) target.setBuyer(this.m_buyer);
        if (this.m_status) target.setStatus(this.m_status);
        return cyfs.Ok(target);
    }

    public get key(): string {
        return this.m_key;
    }

    public get timestamp(): number | undefined {
        return this.m_timestamp;
    }

    public get price(): number | undefined {
        return this.m_price;
    }

    public get buyer(): string | undefined {
        return this.m_buyer;
    }

    public get status(): protos.OrderStatusMap[keyof protos.OrderStatusMap] | undefined {
        return this.m_status;
    }
}

export class OrderDescContentDecoder extends cyfs.ProtobufDescContentDecoder<
    OrderDescContent,
    protos.Order
> {
    public constructor() {
        super(protos.Order.deserializeBinary);
    }

    public type_info(): cyfs.DescTypeInfo {
        return ORDER_DESC_TYPE_INFO;
    }

    public try_from_proto(orderObject: protos.Order): cyfs.BuckyResult<OrderDescContent> {
        const key = orderObject.getKey();
        const timestamp = orderObject.getTimestamp();
        const price = orderObject.getPrice();
        const buyer = orderObject.getBuyer();
        const status = orderObject.getStatus();
        return cyfs.Ok(
            new OrderDescContent({
                key,
                timestamp,
                price,
                buyer,
                status
            })
        );
    }
}

export class OrderDesc extends cyfs.NamedObjectDesc<OrderDescContent> {
    // default
}

export class OrderDescDecoder extends cyfs.NamedObjectDescDecoder<OrderDescContent> {
    // default
}

export class OrderBodyContent extends cyfs.ProtobufBodyContent {
    public constructor() {
        super();
    }

    public try_to_proto(): cyfs.BuckyResult<protos.NoneObject> {
        return cyfs.Ok(new protos.NoneObject());
    }
}

export class OrderBodyContentDecoder extends cyfs.ProtobufBodyContentDecoder<
    OrderBodyContent,
    protos.NoneObject
> {
    public constructor() {
        super(protos.NoneObject.deserializeBinary);
    }

    public try_from_proto(value: protos.NoneObject): cyfs.BuckyResult<OrderBodyContent> {
        return cyfs.Ok(new OrderBodyContent());
    }
}

export class OrderBuilder extends cyfs.NamedObjectBuilder<OrderDescContent, OrderBodyContent> {
    // default
}

export class OrderId extends cyfs.NamedObjectId<OrderDescContent, OrderBodyContent> {
    public constructor(id: cyfs.ObjectId) {
        super(ORDER_OBJECT_TYPE, id);
    }
    // default
}

export class OrderIdDecoder extends cyfs.NamedObjectIdDecoder<OrderDescContent, OrderBodyContent> {
    public constructor() {
        super(ORDER_OBJECT_TYPE);
    }
    // default
}

export class Order extends cyfs.NamedObject<OrderDescContent, OrderBodyContent> {
    public static create(param: {
        key: string;
        timestamp?: number;
        price?: number;
        buyer?: string;
        status?: protos.OrderStatusMap[keyof protos.OrderStatusMap];
        decId: cyfs.ObjectId;
        owner: cyfs.ObjectId;
    }): Order {
        const descContent = new OrderDescContent(param);
        const bodyContent = new OrderBodyContent();
        const builder = new OrderBuilder(descContent, bodyContent);
        return builder.dec_id(param.decId).owner(param.owner).build(Order);
    }

    public get key(): string {
        return this.desc().content().key;
    }

    public get timestamp(): number | undefined {
        return this.desc().content().timestamp;
    }

    public get price(): number | undefined {
        return this.desc().content().price;
    }

    public get buyer(): string | undefined {
        return this.desc().content().buyer;
    }

    public get status(): protos.OrderStatusMap[keyof protos.OrderStatusMap] | undefined {
        return this.desc().content().status;
    }
}

export class OrderDecoder extends cyfs.NamedObjectDecoder<
    OrderDescContent,
    OrderBodyContent,
    Order
> {
    public constructor() {
        super(new OrderDescContentDecoder(), new OrderBodyContentDecoder(), Order);
    }
}
