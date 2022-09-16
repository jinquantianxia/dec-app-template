// ObjectName: ResponseObject
import * as cyfs from 'cyfs-sdk';
import { AppObjectType } from '../types';
import * as protos from './obj_proto_pb';
// The first 16 bits of type are reserved by the system, and the type of the applied object should be greater than 32767
export const RESPONSE_OBJECT_TYPE = AppObjectType.RESPONSE_OBJECT;

export class ResponseObjectDescTypeInfo extends cyfs.DescTypeInfo {
    public obj_type(): number {
        return RESPONSE_OBJECT_TYPE;
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

const RESPONSE_TYPE_INFO = new ResponseObjectDescTypeInfo();

export class ResponseObjectDescContent extends cyfs.ProtobufDescContent {
    private m_err: number;
    private m_msg: string;
    public constructor(err: number, msg: string) {
        super();
        this.m_err = err;
        this.m_msg = msg;
    }

    public type_info(): cyfs.DescTypeInfo {
        return RESPONSE_TYPE_INFO;
    }

    public try_to_proto(): cyfs.BuckyResult<protos.ResponseObject> {
        const target = new protos.ResponseObject();
        target.setErr(this.m_err);
        target.setMsg(this.m_msg);

        return cyfs.Ok(target);
    }

    public get err(): number {
        return this.m_err;
    }

    public get msg(): string {
        return this.m_msg;
    }
}

export class ResponseObjectDescContentDecoder extends cyfs.ProtobufDescContentDecoder<
    ResponseObjectDescContent,
    protos.ResponseObject
> {
    public constructor() {
        super(protos.ResponseObject.deserializeBinary);
    }

    public type_info(): cyfs.DescTypeInfo {
        return RESPONSE_TYPE_INFO;
    }

    public try_from_proto(
        ResponseObject: protos.ResponseObject
    ): cyfs.BuckyResult<ResponseObjectDescContent> {
        const err = ResponseObject.getErr();
        const msg = ResponseObject.getMsg();
        return cyfs.Ok(new ResponseObjectDescContent(err, msg));
    }
}

export class ResponseObjectDesc extends cyfs.NamedObjectDesc<ResponseObjectDescContent> {
    // default
}

export class ResponseObjectDescDecoder extends cyfs.NamedObjectDescDecoder<ResponseObjectDescContent> {
    // default
}

export class ResponseObjectBodyContent extends cyfs.ProtobufBodyContent {
    public constructor() {
        super();
    }

    public try_to_proto(): cyfs.BuckyResult<protos.NoneObject> {
        return cyfs.Ok(new protos.NoneObject());
    }
}

export class ResponseObjectBodyContentDecoder extends cyfs.ProtobufBodyContentDecoder<
    ResponseObjectBodyContent,
    protos.NoneObject
> {
    public constructor() {
        super(protos.NoneObject.deserializeBinary);
    }

    public try_from_proto(value: protos.NoneObject): cyfs.BuckyResult<ResponseObjectBodyContent> {
        return cyfs.Ok(new ResponseObjectBodyContent());
    }
}

export class ResponseObjectBuilder extends cyfs.NamedObjectBuilder<
    ResponseObjectDescContent,
    ResponseObjectBodyContent
> {
    // default
}

export class ResponseObjectId extends cyfs.NamedObjectId<
    ResponseObjectDescContent,
    ResponseObjectBodyContent
> {
    public constructor(id: cyfs.ObjectId) {
        super(RESPONSE_OBJECT_TYPE, id);
    }
    // default
}

export class ResponseObjectIdDecoder extends cyfs.NamedObjectIdDecoder<
    ResponseObjectDescContent,
    ResponseObjectBodyContent
> {
    public constructor() {
        super(RESPONSE_OBJECT_TYPE);
    }
    // default
}

export class ResponseObject extends cyfs.NamedObject<
    ResponseObjectDescContent,
    ResponseObjectBodyContent
> {
    public static create(param: {
        err: number;
        msg: string;
        decId: cyfs.ObjectId;
        owner: cyfs.ObjectId;
    }): ResponseObject {
        const descContent = new ResponseObjectDescContent(param.err, param.msg);
        const bodyContent = new ResponseObjectBodyContent();
        const builder = new ResponseObjectBuilder(descContent, bodyContent);
        return builder.dec_id(param.decId).owner(param.owner).build(ResponseObject);
    }

    public get err(): number {
        return this.desc().content().err;
    }

    public get msg(): string {
        return this.desc().content().msg;
    }
}

export class ResponseObjectDecoder extends cyfs.NamedObjectDecoder<
    ResponseObjectDescContent,
    ResponseObjectBodyContent,
    ResponseObject
> {
    public constructor() {
        super(
            new ResponseObjectDescContentDecoder(),
            new ResponseObjectBodyContentDecoder(),
            ResponseObject
        );
    }
}
