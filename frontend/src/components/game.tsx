import * as React from "react";
import { Connection } from "../connection";
import { JsonParser } from "../jsonParser";
import { StatusBar, PlayerList } from "./gameOverlays/statusBar";
import { Popup } from "./gameOverlays/popup";
import { Board } from "./board";

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
    color: string | null,
    currTurn: string
}

export class Game extends React.Component<IProps, IState> {
    name: string;

    constructor(props: IProps) {
        super(props);
        props.conn.setJsonMessageHandler(this.onMessage.bind(this));

        this.name = props.conn.getName();

        this.state = {
            board: null,
            gameStarted: false,
            currNotification: null,
            currError: null,
            playerList: [],
            currentTurn: null,
            color: null,
            currTurn: ""
        }
    }

    private onMessage(obj: object) {
        console.log('Debug:', obj);
        //console.log('version: a1')

        if ('ResponseFailure' in obj) {
            const errMsg = JsonParser.requireString(obj, 'ResponseFailure');
            console.error(errMsg);

            this.setState({
                currError: errMsg
            });
        }
        else {
            if ("message" in obj) {
                const msg = JsonParser.requireString(obj, 'message');
                console.log(msg);

                this.setState({
                    currNotification: msg
                });

                setTimeout(() => {
                    if (this.state.currNotification == msg) {
                        this.setState({ currNotification: null });
                    }
                }, 10000);
            }
            if ("color" in obj) {
                const c = JsonParser.requireString(obj, 'color')
                if (c == 'white') {
                    this.setState({
                        gameStarted: true
                    })
                }
                //console.log('color:', c)
                this.setState({
                    color: c
                })
            }
            if ('turn' in obj) {
                const t = JsonParser.requireString(obj, 'turn');
                this.setState({
                    currTurn: t
                })
            }
            if ('board' in obj) {
                const b = JsonParser.requireArray(obj, 'board');
                const arr: Array<Array<string>> = [];
                for (let i = 0; i < b.length; i++) {
                    arr.push(JsonParser.requireStringArray(b, i));
                }

                if (!this.state.gameStarted) {
                    for (const row of arr) {
                        for (const elem of row) {
                            if (elem.length > 0) {
                                this.setState({ gameStarted: true });
                                break;
                            }
                        }
                    }
                }

                this.setState({
                    board: arr
                })
            }
        }
    }

    onSquareClick(row: number, col: number) {
        this.props.conn.send({
            type: "move",
            locationX: col,
            locationY: row
        });
    }

    render() {
        const defaultMsg = this.state.gameStarted ? ( `${this.state.currTurn}'s Turn` ) : "Game hasn't started yet"
        const msg = this.state.currNotification == null ? defaultMsg : this.state.currNotification
        return (
            <div>
                {(this.state.currError) ? <Popup msg={this.state.currError} callBack={() => {this.setState({ currError: null })}}/> : null}
                <StatusBar msg={msg}>
                    {(this.state.gameStarted) ? null : <button className="button" onClick={() => {this.props.conn.send({'debug': 'startGame'})}}>Start Game</button>}
                </StatusBar>

                <div>{(this.state.board) ? <Board table={this.state.board} callback={this.onSquareClick.bind(this)}/> : 'board not yet loaded'}</div>
            </div>
        )
    }
}  