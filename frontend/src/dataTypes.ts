import { JsonParser } from "./jsonParser";

export interface ConnectionData {
    name: string,
    host: string,
    port: number,
    token: string | null
}

export function connectionDataFromJson(o: object): ConnectionData {
    return {
        name: JsonParser.requireString(o, 'name'),
        host: JsonParser.requireString(o, 'host'),
        port: JsonParser.requireNumber(o, 'port'),
        token: JsonParser.requireString(o, 'token')
    }
}