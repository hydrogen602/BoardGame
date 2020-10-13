import * as React from "react";

import { LoginForm } from "./login";
import { Spinner } from "./spinner";

import { Connection } from "../connection";
import { Game } from "./game";
import { ColorBox } from "./colorBox";
import { ConnectionData } from "../dataTypes";

const atLogin = 0
const atConnecting = 1
const atGame = 2

interface IState {
    progressState: number,
    failedConn: boolean,
    dat: ConnectionData | null,
    conn: Connection | null
}

export class UI extends React.Component<{}, IState> {
    
    constructor(props: {}) {
        super(props);

        const maybe = Connection.regainOldConnectionIfExists(this.onWebSockFailure.bind(this), this.onWebSockOpen.bind(this));
        if (maybe) {
            console.log('regained old connection');
        }
        else {
            console.log('no old connection found');
        }
        
        this.state = {
            progressState: (maybe) ? atConnecting : atLogin,
            failedConn: false,
            dat: null,
            conn: (maybe) ? maybe : null,
        };

        this.loginSubmitCallback = this.loginSubmitCallback.bind(this);
    }

    loginSubmitCallback(data: ConnectionData) {
        this.setState({
            dat: data,
            progressState: atConnecting,
            failedConn: false,
            conn: new Connection(data, this.onWebSockFailure.bind(this), this.onWebSockOpen.bind(this))
        });
    }

    private onWebSockFailure(ev: Event) {
        console.log("back to login")
        this.setState({
            progressState: atLogin,
            failedConn: true
        })
    }

    private onWebSockOpen(ev: Event) {
        this.setState({
            progressState: atGame,
            failedConn: false
        })
    }

    render() {
        if (this.state.progressState == atLogin) {
            if (this.state.failedConn) {
                return (
                    <div>
                        <LoginForm callback={this.loginSubmitCallback} />
                        <img id="whoopsie" src="whoopsie-01.png" alt="whoopsie"></img>
                    </div>
                    );
            }
            else {
                return (
                    <div>
                        <LoginForm callback={this.loginSubmitCallback} />
                    </div>
                );
            }
            
        }
        else if (this.state.progressState == atConnecting) {
            return (
                <div className="window center" style={{width: "6em"}}>
                    <p style={{margin: 'auto', paddingBottom: '0.5em', color: 'white'}}>Connecting...</p>
                    <Spinner shown={true}/>
                </div>
                );
        }
        else if (this.state.progressState == atGame) {
            if (!this.state.conn) {
                throw Error("this shouldn't happen");
            }
            return (
                <Game conn={this.state.conn}/>
            )
        }
        else {
            return <p>Hi, {(this.state.dat) ? this.state.dat.name : null}</p>
        }
    }

}