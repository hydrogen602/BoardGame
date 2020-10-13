import { JsonParser, JsonMessage } from "./jsonParser";
import { connectionDataFromJson, ConnectionData } from "./dataTypes"

/**
 * sets sessionStorage 'connection' to a json representation of ConnectionData
 */
export class Connection {

    private ws: WebSocket | null;

    private failedAttempts: number;

    private verifiedConnection: boolean; // Hi - Hello echo verifies connection

    private data: ConnectionData;

    private onWebSockFailure: (ev: Event) => void;
    private onWebSockOpen: (ev: Event) => void;

    private jsonMessageHandler: (obj: MessageEvent) => void;

    private connectedOnce: boolean;

    constructor(data: ConnectionData, onWebSockFailure: (ev: Event) => void, onWebSockOpen: (ev: Event) => void) {
        if (data.port.toString() == 'NaN') {
            throw Error("yeet the port"); 
        }
        
        this.data = {
            host: encodeURIComponent(data.host),
            name: encodeURIComponent(data.name),
            color: encodeURIComponent(data.color),
            port: data.port,
            token: (data.token) ? data.token : null
        }
        
        this.onWebSockFailure = onWebSockFailure;
        this.onWebSockOpen = onWebSockOpen;

        this.connectedOnce = false;
        this.failedAttempts = 0;

        this.verifiedConnection = false;

        this.jsonMessageHandler = (a: any) => { throw Error("jsonMessageHandler not set"); };
        this.ws = null;

        this.sendMessage = this.sendMessage.bind(this);
        
        this.connect();
    }

    /**
     * 
     * @param onWebSockFailure a callback for handling errors
     * @param onWebSockOpen a callback for handling a successful connection
     * 
     * @returns a Connection object if connection data is found in sessionStorage, else null
     */
    static regainOldConnectionIfExists(onWebSockFailure: (ev: Event) => void, onWebSockOpen: (ev: Event) => void): Connection | null {
        const result = sessionStorage.getItem('connection');
        if (result) {
            const dat = connectionDataFromJson(JSON.parse(result)); // json parsing shouldn't fail
            return new Connection(dat, onWebSockFailure, onWebSockOpen);
        }
        else {
            return null;
        }
    }

    getName() {
        return this.data.name;
    }

    private getUrl() {
        if (this.data.token != null) {
            return `wss://${this.data.host}:${this.data.port}/${this.data.name}/${this.data.token}/${this.data.color}`
        }
        else {
            return `wss://${this.data.host}:${this.data.port}/${this.data.name}/${this.data.color}`
        }    
    }

    private connect() {
        this.ws = new WebSocket(this.getUrl());

        this.ws.onerror = this.onerror.bind(this);
        this.ws.onclose = this.onclose.bind(this);
        this.ws.onmessage = this.onmessage.bind(this);
        this.ws.onopen = this.onopen.bind(this);

        this.verifiedConnection = false;
    }

    private onclose(ev: CloseEvent) {
        console.log("WS closed", ev);
        this.verifiedConnection = false;
        
        if (ev.code >= 4000 && ev.code < 4100) {
            // my error codes
            console.log("Connection failed due to:", ev.reason);
            this.onWebSockFailure(ev);
        }
        else if (this.connectedOnce) {
            if (this.failedAttempts > 5) {
                return;
            }

            setTimeout(() => {
                //newNotification('Reconnecting...');
                this.connect();
            }, 3000);
        }
    }

    private onerror(ev: Event) {
        console.log("WS errored", ev);
        this.verifiedConnection = false;

        this.failedAttempts += 1
        if (!this.connectedOnce) {
            this.onWebSockFailure(ev);
        }
    }

    private onmessage(ev: MessageEvent) {
        if (ev.data == "Hello") {
            console.log("Successful Echo, Server is alive!");
            this.verifiedConnection = true;
        }
        else {
            try {
                const obj = JSON.parse(ev.data);

                //console.log("got msg:", obj);

                if ('token' in obj) {
                    const token: string = JsonParser.requireString(obj, 'token');
                    if (!this.data.token) {
                        // remember the token
                        console.log('Got token', token);
                        this.data.token = token;

                        sessionStorage.setItem('connection', JSON.stringify(this.data));
                    }
                    return;
                }

                this.jsonMessageHandler(obj);

            } catch (e) {
                if (e.name == 'SyntaxError') {
                    console.log('Got invalid JSON')
                }
                else {
                    console.log('Error:', e);
                    console.log('Error data:', e.data);
                    throw(e);
                }
            }
        }
    }

    private onopen(ev: Event) {
        console.log("WS opened", ev);
        this.failedAttempts = 0;
        this.onWebSockOpen(ev);
        this.connectedOnce = true;

        if (this.ws) {
            this.ws.send('Hi');
            this.ws.send('history');
        }
        else {
            throw Error('this shouldn\'t happen');
        }
    }

    public setJsonMessageHandler(f:(ev: MessageEvent) => void) {
        this.jsonMessageHandler = f;
    }

    /**
     * The function handles the JSON.stringify
     * 
     * @param o An object to send.
     */
    public send(o: object) {
        const msg = JSON.stringify(o);
        if (this.ws) {
            this.ws.send(msg);
        }
        else {
            console.log('Disconnected');
        }
    }

    /**
     * For sending a message to the server
     * 
     * @param type
     * @param content 
     * @param args 
     */
    public sendMessage(type: string, content: string, args?: Array<any>) {
        this.send(JsonMessage(type, content, args));
    }

    public getHistory() {
        if (this.ws) {
            this.ws.send('history');
        }
        else {
            console.log('Disconnected');
        }
    }
}