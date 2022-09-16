// ObjectName: HelloResponseObject
import * as cyfs from 'cyfs-sdk';
import { AppObjectType } from '../types';
import * as protos from './obj_proto_pb';
// The first 16 bits of type are reserved by the system, and the type of the applied object should be greater than 32767
export const HELLO_RESPONSE_OBJECT_TYPE = AppObjectType.HELLO_RESPONSE;

export class HelloResponseObjectDescTypeInfo extends cyfs.DescTypeInfo {
    public obj_type(): number {
        return HELLO_RESPONSE_OBJECT_TYPE;
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

const HELLO_RESPONSE_TYPE_INFO = new HelloResponseObjectDescTypeInfo();

export class HelloResponseObjectDescContent extends cyfs.ProtobufDescContent {
    private m_greet: string;
    public constructor(greet: string) {
        super();
        this.m_greet = greet;
    }

    public type_info(): cyfs.DescTypeInfo {
        return HELLO_RESPONSE_TYPE_INFO;
    }

    public try_to_proto(): cyfs.BuckyResult<protos.HelloResponseObject> {
        const target = new protos.HelloResponseObject();
        target.setGreet(this.m_greet);

        return cyfs.Ok(target);
    }

    public get greet(): string {
        return this.m_greet;
    }
}

export class HelloResponseObjectDescContentDecoder extends cyfs.ProtobufDescContentDecoder<
    HelloResponseObjectDescContent,
    protos.HelloResponseObject
> {
    public constructor() {
        super(protos.HelloResponseObject.deserializeBinary);
    }

    public type_info(): cyfs.DescTypeInfo {
        return HELLO_RESPONSE_TYPE_INFO;
    }

    public try_from_proto(
        HelloResponseObject: protos.HelloResponseObject
    ): cyfs.BuckyResult<HelloResponseObjectDescContent> {
        const greet = HelloResponseObject.getGreet();
        return cyfs.Ok(new HelloResponseObjectDescContent(greet));
    }
}

export class HelloResponseObjectDesc extends cyfs.NamedObjectDesc<HelloResponseObjectDescContent> {
    // default
}

export class HelloResponseObjectDescDecoder extends cyfs.NamedObjectDescDecoder<HelloResponseObjectDescContent> {
    // default
}

export class HelloResponseObjectBodyContent extends cyfs.ProtobufBodyContent {
    public constructor() {
        super();
    }

    public try_to_proto(): cyfs.BuckyResult<protos.NoneObject> {
        return cyfs.Ok(new protos.NoneObject());
    }
}

export class HelloResponseObjectBodyContentDecoder extends cyfs.ProtobufBodyContentDecoder<
    HelloResponseObjectBodyContent,
    protos.NoneObject
> {
    public constructor() {
        super(protos.NoneObject.deserializeBinary);
    }

    public try_from_proto(
        value: protos.NoneObject
    ): cyfs.BuckyResult<HelloResponseObjectBodyContent> {
        return cyfs.Ok(new HelloResponseObjectBodyContent());
    }
}

export class HelloResponseObjectBuilder extends cyfs.NamedObjectBuilder<
    HelloResponseObjectDescContent,
    HelloResponseObjectBodyContent
> {
    // default
}

export class HelloResponseObjectId extends cyfs.NamedObjectId<
    HelloResponseObjectDescContent,
    HelloResponseObjectBodyContent
> {
    public constructor(id: cyfs.ObjectId) {
        super(HELLO_RESPONSE_OBJECT_TYPE, id);
    }
    // default
}

export class HelloResponseObjectIdDecoder extends cyfs.NamedObjectIdDecoder<
    HelloResponseObjectDescContent,
    HelloResponseObjectBodyContent
> {
    public constructor() {
        super(HELLO_RESPONSE_OBJECT_TYPE);
    }
    // default
}

export class HelloResponseObject extends cyfs.NamedObject<
    HelloResponseObjectDescContent,
    HelloResponseObjectBodyContent
> {
    public static create(param: {
        greet: string;
        decId: cyfs.ObjectId;
        owner: cyfs.ObjectId;
    }): HelloResponseObject {
        const descContent = new HelloResponseObjectDescContent(param.greet);
        const bodyContent = new HelloResponseObjectBodyContent();
        const builder = new HelloResponseObjectBuilder(descContent, bodyContent);
        return builder.dec_id(param.decId).owner(param.owner).build(HelloResponseObject);
    }

    public get greet(): string {
        return this.desc().content().greet;
    }
}

export class HelloResponseObjectDecoder extends cyfs.NamedObjectDecoder<
    HelloResponseObjectDescContent,
    HelloResponseObjectBodyContent,
    HelloResponseObject
> {
    public constructor() {
        super(
            new HelloResponseObjectDescContentDecoder(),
            new HelloResponseObjectBodyContentDecoder(),
            HelloResponseObject
        );
    }
}
