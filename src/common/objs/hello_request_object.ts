// ObjectName: HelloRequestObject
import * as cyfs from 'cyfs-sdk';
import { AppObjectType } from '../types';
import * as protos from './obj_proto_pb';
// The first 16 bits of type are reserved by the system, and the type of the applied object should be greater than 32767
export const HELLO_REQUEST_OBJECT_TYPE = AppObjectType.HELLO_REQUEST;

export class HelloRequestObjectDescTypeInfo extends cyfs.DescTypeInfo {
    public obj_type(): number {
        return HELLO_REQUEST_OBJECT_TYPE;
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

const HELLO_REQUEST_TYPE_INFO = new HelloRequestObjectDescTypeInfo();

export class HelloRequestObjectDescContent extends cyfs.ProtobufDescContent {
    private m_name: string;
    public constructor(name: string) {
        super();
        this.m_name = name;
    }

    public type_info(): cyfs.DescTypeInfo {
        return HELLO_REQUEST_TYPE_INFO;
    }

    public try_to_proto(): cyfs.BuckyResult<protos.HelloRequestObject> {
        const target = new protos.HelloRequestObject();
        target.setName(this.m_name);

        return cyfs.Ok(target);
    }

    public get name(): string {
        return this.m_name;
    }
}

export class HelloRequestObjectDescContentDecoder extends cyfs.ProtobufDescContentDecoder<
    HelloRequestObjectDescContent,
    protos.HelloRequestObject
> {
    public constructor() {
        super(protos.HelloRequestObject.deserializeBinary);
    }

    public type_info(): cyfs.DescTypeInfo {
        return HELLO_REQUEST_TYPE_INFO;
    }

    public try_from_proto(
        HelloRequestObject: protos.HelloRequestObject
    ): cyfs.BuckyResult<HelloRequestObjectDescContent> {
        const name = HelloRequestObject.getName();
        return cyfs.Ok(new HelloRequestObjectDescContent(name));
    }
}

export class HelloRequestObjectDesc extends cyfs.NamedObjectDesc<HelloRequestObjectDescContent> {
    // default
}

export class HelloRequestObjectDescDecoder extends cyfs.NamedObjectDescDecoder<HelloRequestObjectDescContent> {
    // default
}

export class HelloRequestObjectBodyContent extends cyfs.ProtobufBodyContent {
    public constructor() {
        super();
    }

    public try_to_proto(): cyfs.BuckyResult<protos.NoneObject> {
        return cyfs.Ok(new protos.NoneObject());
    }
}

export class HelloRequestObjectBodyContentDecoder extends cyfs.ProtobufBodyContentDecoder<
    HelloRequestObjectBodyContent,
    protos.NoneObject
> {
    public constructor() {
        super(protos.NoneObject.deserializeBinary);
    }

    public try_from_proto(
        value: protos.NoneObject
    ): cyfs.BuckyResult<HelloRequestObjectBodyContent> {
        return cyfs.Ok(new HelloRequestObjectBodyContent());
    }
}

export class HelloRequestObjectBuilder extends cyfs.NamedObjectBuilder<
    HelloRequestObjectDescContent,
    HelloRequestObjectBodyContent
> {
    // default
}

export class HelloRequestObjectId extends cyfs.NamedObjectId<
    HelloRequestObjectDescContent,
    HelloRequestObjectBodyContent
> {
    public constructor(id: cyfs.ObjectId) {
        super(HELLO_REQUEST_OBJECT_TYPE, id);
    }
    // default
}

export class HelloRequestObjectIdDecoder extends cyfs.NamedObjectIdDecoder<
    HelloRequestObjectDescContent,
    HelloRequestObjectBodyContent
> {
    public constructor() {
        super(HELLO_REQUEST_OBJECT_TYPE);
    }
    // default
}

export class HelloRequestObject extends cyfs.NamedObject<
    HelloRequestObjectDescContent,
    HelloRequestObjectBodyContent
> {
    public static create(param: {
        name: string;
        decId: cyfs.ObjectId;
        owner: cyfs.ObjectId;
    }): HelloRequestObject {
        const descContent = new HelloRequestObjectDescContent(param.name);
        const bodyContent = new HelloRequestObjectBodyContent();
        const builder = new HelloRequestObjectBuilder(descContent, bodyContent);
        return builder.dec_id(param.decId).owner(param.owner).build(HelloRequestObject);
    }

    public get name(): string {
        return this.desc().content().name;
    }
}

export class HelloRequestObjectDecoder extends cyfs.NamedObjectDecoder<
    HelloRequestObjectDescContent,
    HelloRequestObjectBodyContent,
    HelloRequestObject
> {
    public constructor() {
        super(
            new HelloRequestObjectDescContentDecoder(),
            new HelloRequestObjectBodyContentDecoder(),
            HelloRequestObject
        );
    }
}
