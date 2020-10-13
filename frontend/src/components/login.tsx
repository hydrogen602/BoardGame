import * as React from "react";
import { ConnectionData } from "../dataTypes";
import { ColorBox } from "./colorBox";

interface IState {
    name: string,
    host: string,
    port: string,
    color: string,
    pickingColor: boolean,

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
        let color = '';

        const oldData = localStorage.getItem('login');
        if (oldData) {
            const oldState = JSON.parse(oldData);
            if (oldState['name']) { name = oldState['name']; }
            if (oldState['host']) { host = oldState['host']; }
            if (oldState['port']) { port = oldState['port']; }
            if (oldState['color']) { color = oldState['color']; }

        }

        const onAWS = "https://game.jonathanrotter.com/" == document.URL

        this.state = {
            name: name,
            host: (onAWS) ? "game.jonathanrotter.com" : host,
            port: (onAWS) ? "5000" : port,
            color: color,
            pickingColor: false,
            onAWS: onAWS
        }


        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    onColorClick(color: string, ev: React.MouseEvent) {
        this.setState({
            color: color,
            pickingColor: false
        });
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
    }

    handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        const port = parseInt(this.state.port);
        if (this.state.name != '' && this.state.host != '' && port.toString() != "NaN" && port > 0 && this.state.color != '') {
            console.log("yeet", this.state);

            localStorage.setItem('login', JSON.stringify(this.state))

            this.props.callback({
                name: this.state.name,
                host: this.state.host,
                port: port,
                color: this.state.color,
                token: null
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
                    
                    <input required readOnly name="color" type="string" placeholder="Color" value={this.state.color} onFocus={() => {this.setState({ pickingColor: true })}}></input>

                    <button className="button">Join Game</button>
                </form>
                {(this.state.pickingColor) ? <ColorBox onClick={this.onColorClick.bind(this)}/> : null }
            </div>
        )
    }
}