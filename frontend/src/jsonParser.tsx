
export function JsonMessage(type: string, content: string, args?: Array<any>) {
    if (args && args.length > 0) {
        return { "type": type, "content": content, "args": args }
    }
    else {
        return { "type": type, "content": content }
    }
    
}


export class JsonParserError extends Error {
    // from https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}


export class JsonParser {
    /**
     * Check the __name__ tag of the serialized object
     * 
     * @param o The result of JSON.parse 
     * @returns String which is the name of the serialized object, or "" if there is no name
     */
    static askName(o: any): string {
        if (!('__name__' in o)) {
            //throw new JsonParserError("Missing json field: '__name__'");
            return '';
        }
        const value: any = o['__name__'];
        if (typeof(value) != 'string') {
            throw new JsonParserError("Json field '__name__' is of the wrong type: got '" + typeof(value) + "' but expected 'string'");
        }
        
        return value;
    }

    static askType(o: any): string {
        if (!('type' in o)) {
            return '';
        }
        const value: any = o['type'];
        if (typeof(value) != 'string') {
            throw new JsonParserError("Json field 'type' is of the wrong type: got '" + typeof(value) + "' but expected 'string'");
        }
        
        return value;
    }

    static requireAny(o: any, name: string): any {
        if (!(name in o)) {
            throw new JsonParserError("Missing json field: '" + name + "'");
        }
        return o[name];
    }

    static requireName(o: any, nameRequired: string) {
        if (!('__name__' in o)) {
            throw new JsonParserError("Missing json field: '" + name + "'");
        }
        const value: any = o['__name__'];
        if (typeof(value) != 'string') {
            throw new JsonParserError("Json field '__name__' is of the wrong type: got '" + typeof(value) + "' but expected 'string'");
        }
        
        if (value != nameRequired) {
            throw new JsonParserError("Json has incorrect object name, got '" + value + "' but expected '" + nameRequired + "'")
        }
    }

    static requireNumber(o: any, name: string): number {
        if (!(name in o)) {
            throw new JsonParserError("Missing json field: '" + name + "'");
        }
        const value: any = o[name];
        if (typeof(value) != 'number') {
            throw new JsonParserError("Json field '" + name + "' is of the wrong type: got '" + typeof(value) + "' but expected 'number'");
        }
        return value;
    }
    
    static requireString(o: any, name: string): string {
        if (!(name in o)) {
            throw new JsonParserError("Missing json field: '" + name + "'");
        }
        const value: any = o[name];
        if (typeof(value) != 'string') {
            throw new JsonParserError("Json field '" + name + "' is of the wrong type: got '" + typeof(value) + "' but expected 'string'");
        }
        return value;
    }

    static requireObject(o: any, name: string): object {
        if (!(name in o)) {
            throw new JsonParserError("Missing json field: '" + name + "'");
        }
        const value: any = o[name];
        if (typeof(value) != 'object') {
            throw new JsonParserError("Json field '" + name + "' is of the wrong type: got '" + typeof(value) + "' but expected 'object'");
        }
        return value;
    }

    static requireArray(o: any, name: string | number): Array<any> {
        if (!(name in o)) {
            throw new JsonParserError("Missing json field: '" + name + "'");
        }
        const value: any = o[name];
        if (typeof(value) != 'object' || value.__proto__.constructor.name != 'Array') {
            throw new JsonParserError("Json field '" + name + "' is of the wrong type: got '" + typeof(value) + "' but expected 'Array'");
        }
        return value;
    }

    static requireIntArray(o: any, name: string | number): Array<number> {
        if (!(name in o)) {
            throw new JsonParserError("Missing json field: '" + name + "'");
        }
        const value: any = o[name];
        if (typeof(value) != 'object' || value.__proto__.constructor.name != 'Array') {
            throw new JsonParserError("Json field '" + name + "' is of the wrong type: got '" + typeof(value) + "' but expected 'Array'");
        }
        const valI: Array<number> = value
        valI.forEach(e => {
            if (typeof e != 'number') {
                throw new JsonParserError("Json field '" + name + "' is of the wrong type: got element of type '" + typeof(e) + "' but expected 'Array<number>'");
            }
        });
        return value;
    }

    static requireStringArray(o: any, name: string | number): Array<string> {
        if (!(name in o)) {
            throw new JsonParserError("Missing json field: '" + name + "'");
        }
        const value: any = o[name];
        if (typeof(value) != 'object' || value.__proto__.constructor.name != 'Array') {
            throw new JsonParserError("Json field '" + name + "' is of the wrong type: got '" + typeof(value) + "' but expected 'Array'");
        }
        const valI: Array<string> = value
        valI.forEach(e => {
            if (typeof e != 'string') {
                throw new JsonParserError("Json field '" + name + "' is of the wrong type: got element of type '" + typeof(e) + "' but expected 'Array<string>'");
            }
        });
        return value;
    }

    static requireBool(o: any, name: string): boolean {
        if (!(name in o)) {
            throw new JsonParserError("Missing json field: '" + name + "'");
        }
        const value: any = o[name];
        if (typeof(value) != 'boolean') {
            throw new JsonParserError("Json field '" + name + "' is of the wrong type: got '" + typeof(value) + "' but expected 'boolean'");
        }
        return value;
    }

}