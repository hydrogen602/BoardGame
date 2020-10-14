import * as React from "react";
import { Connection } from "../connection";
import { JsonParser } from "../jsonParser";
import { StatusBar, PlayerList } from "./gameOverlays/statusBar";
import { Popup } from "./gameOverlays/popup";

interface IProps {
    conn: Connection
}

interface IState {
    board: Array<Array<string>> | null,
    gameStarted: boolean,
    currNotification: string | null,
    currError: string | null,
    playerList: Array<string>,
    currentTurn: string | null,
}

export class Game extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        props.conn.setJsonMessageHandler(this.onMessage.bind(this));

        this.state = {
            board: null,
            gameStarted: false,
            currNotification: null,
            currError: null,
            playerList: [],
            currentTurn: null
        }
    }

    private onMessage(obj: object) {
        //console.log(obj);
        if (JsonParser.askType(obj) == "notification") {
            const msg = JsonParser.requireString(obj, 'content');

            this.setState({
                currNotification: msg
            });

            setTimeout(() => {
                if (this.state.currNotification == msg) {
                    this.setState({ currNotification: null });
                }
            }, 10000);
        }

        else if (JsonParser.askType(obj) == "error") {
            const errMsg = JsonParser.requireString(obj, 'content');

            this.setState({
                currError: errMsg
            });
        }
    }

    render() {
        const defaultMsg = this.state.gameStarted ? "Game running" : "Game hasn't started yet"
        const msg = this.state.currNotification == null ? defaultMsg : this.state.currNotification
        return (
            <div>
                {(this.state.currError) ? <Popup msg={this.state.currError} callBack={() => {this.setState({ currError: null })}}/> : null}
                <StatusBar msg={msg}>
                    {(this.state.gameStarted) ? null : <button className="button" onClick={() => {this.props.conn.send({'debug': 'startGame'})}}>Start Game</button>}
                </StatusBar>


            </div>
        )
    }
}  