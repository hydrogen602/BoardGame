import * as React from "react";
import { ConnectionData } from "../dataTypes";
import { onProductionServer } from "../util"

interface IState {
    name: string,
    host: string,
    port: string,
    gameID: string

    onAWS: boolean
}

interface IProp {
    callback: (data: ConnectionData) => void
}

export class LoginForm extends React.Component<IProp, IState> {
    constructor(props: IProp) {
        super(props);

        let name = '';
        let host = '';
        let port = '';
        let gameID = '';

        const oldData = localStorage.getItem('login');
        if (oldData) {
            const oldState = JSON.parse(oldData);
            if (oldState['name']) { name = oldState['name']; }
            if (oldState['host']) { host = oldState['host']; }
            if (oldState['port']) { port = oldState['port']; }
            if (oldState['gameID']) { gameID = oldState['gameID']; }
        }

        const onAWS = onProductionServer();

        this.state = {
            name: name,
            host: (onAWS) ? "projects.jonathanrotter.com" : 'localhost', //host, <- hard coded for debugging
            port: (onAWS) ? "5000" : '5000', //port,
            onAWS: onAWS,
            gameID: gameID
        }


        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }


    handleChange(event: React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.name == "name") {
            this.setState({ name: event.currentTarget.value });
        }
        else if (event.currentTarget.name == "host") {
            this.setState({ host: event.currentTarget.value });
        }
        else if (event.currentTarget.name == "port") {
            this.setState({ port: event.currentTarget.value });
        }
        else if (event.currentTarget.name == 'gameID') {
            this.setState({ gameID: event.currentTarget.value });
        }
    }

    handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        const port = parseInt(this.state.port);
        if (this.state.name != '' && this.state.host != '' && port.toString() != "NaN" && port > 0 && this.state.gameID != '') {
            console.log("yeet", this.state);

            localStorage.setItem('login', JSON.stringify(this.state))

            this.props.callback({
                name: this.state.name,
                host: this.state.host,
                port: port,
                token: null,
                gameID: this.state.gameID
            });
        }

        event.preventDefault();
    }

    render() {
        return (
            <div>
                <form id="loginForm" className="center window" onSubmit={this.handleSubmit}>
                    <input required name="name" type="text" placeholder="Name" value={this.state.name} onChange={this.handleChange}></input>
                    {(this.state.onAWS) ? null : <input required name="host" type="text" placeholder="Hostname" value={this.state.host} onChange={this.handleChange}></input>}
                    {(this.state.onAWS) ? null : <input required name="port" type="number" placeholder="Port" value={this.state.port} onChange={this.handleChange}></input>}
                    <input required name="gameID" type="text" placeholder="GameID" value={this.state.gameID} onChange={this.handleChange}></input>
                    <button className="button">Join Game</button>
                </form>
            </div>
        )
    }
}