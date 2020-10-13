import * as React from "react";
import { Connection } from "../connection";
import { Canvas } from "./canvas"
import { GameMap } from "./canvasCode/map/GameMap";
import { JsonParser } from "../jsonParser";
import { StatusBar, PlayerList } from "./gameOverlays/statusBar";
import { Player } from "./canvasCode/mechanics/Player";
import { Turn } from "./canvasCode/mechanics/Turn";
import { Popup } from "./gameOverlays/popup";
import { RelPoint, AbsPoint, HexPoint, Hex } from "./canvasCode/graphics/Point";
import { Inventory } from "./canvasCode/mechanics/Inventory";
import { InventoryDisplay } from "./gameOverlays/inventoryDisplay";

interface IProps {
    conn: Connection
}

interface IState {
    gm: GameMap,
    gameStarted: boolean,
    currNotification: string | null,
    currError: string | null,
    playerList: Array<string>,
    currentTurn: Turn | null,
    inventory: Inventory | null,

    selectedLinePurchased: number | null,
    selectedPointPurchased: number | null,

    mayPlaceRobber: boolean
}

export class Game extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        props.conn.setJsonMessageHandler(this.onMessage.bind(this));

        this.state = {
            gm: new GameMap([], [], []),
            gameStarted: false,
            currNotification: null,
            currError: null,
            playerList: [],
            currentTurn: null,
            inventory: null,

            selectedLinePurchased: null,
            selectedPointPurchased: null,

            mayPlaceRobber: false,
        }
    }

    private onMessage(obj: object) {
        //console.log(obj);
        if (JsonParser.askName(obj) == 'Game') {
            this.props.conn.sendMessage('update', 'inventory', []);

            const gameMapJson = JsonParser.requireObject(obj, 'gameMap');

            const gameMap = GameMap.fromJson(gameMapJson);

            const gameStarted = JsonParser.requireBool(obj, 'gameStarted');

            const playerList = this.state.playerList;

            const players = JsonParser.requireArray(obj, 'players');
            for (const p of players) {
                if (!Player.doesPlayerExists(p)) {
                    const x = Player.fromJson(p);
                    if (!x) {
                        throw Error('This should not happen');
                    }
                    playerList.push(x.getName());
                }
            }

            this.setState({
                gm: gameMap,
                gameStarted: gameStarted,
                playerList: playerList
            });
        }

        else if (JsonParser.askName(obj) == 'Turn') {
            // should only be received on a new turn
            const turn = Turn.fromJson(obj);

            this.setState({
                currentTurn: turn,
                currNotification: `${turn.currentPlayer.getName()}'s turn`
            });

            if (turn.dieValue) {
                this.state.gm.dieRolled(turn.dieValue);
            }

            console.log(turn);
        }

        else if (JsonParser.askName(obj) == 'Inventory' || JsonParser.askName(obj) == 'ExpandedInventory') {
            this.setState({ 'inventory': Inventory.fromJson(obj) });
        }

        else if (JsonParser.askType(obj) == "notification") {
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

    mouseHandler(e: React.MouseEvent) {
        const p = new RelPoint(e.clientX, e.clientY);
        const r = Hex.distanceFromNearestHexCorner(p);
        const a = p.toAbsPoint();

        if (this.state.selectedPointPurchased != null) {            
            
            if (r < Hex.getSideLength() / 4) {
                // clicked on a corner
                const h = p.toHexPoint();
                console.log("new settlement");
                this.props.conn.send({'type': 'action', 'content': 'placeSettlement', 'args': [h.toJsonSerializable(), this.state.selectedPointPurchased]});
                
                this.setState({
                    selectedPointPurchased: null
                });
            }
        }
        else if (this.state.selectedLinePurchased != null) {
            const hArr = p.toDualHexPoint();            
            if (hArr.length == 2) { // hArr is empty if not over a line 
                const [a, b] = hArr;
                console.log("new road");
                this.props.conn.send({'type': 'action', 'content': 'placeRoad', 'args': [a.toJsonSerializable(), b.toJsonSerializable(), this.state.selectedLinePurchased]});
            
                this.setState({
                    selectedLinePurchased: null
                });
            }
        }
        else if (this.state.mayPlaceRobber) {
            for (const ti of this.state.gm.getTiles()) {
                if (ti.isInside(a)) {
                    
                    // robber movement time
                    console.log("move robber");
                    const hp = ti.getPos();

                    this.props.conn.send({'type': 'action', 'content': 'placeRobber', 'args': [hp.toJsonSerializable()]});
                
                    this.setState({
                        mayPlaceRobber: false
                    });

                    break;
                }
                
            }
        }
    }

    private onClickPurchasedPoint(index: number, ev: React.MouseEvent) {
        this.setState({
            selectedLinePurchased: null,
            selectedPointPurchased: index
        })
    }

    private onClickPurchasedLine(index: number, ev: React.MouseEvent) {
        this.setState({
            selectedLinePurchased: index,
            selectedPointPurchased: null
        })
    }

    render() {
        const defaultMsg = this.state.gameStarted ? "Game running" : "Game hasn't started yet"
        const msg = this.state.currNotification == null ? defaultMsg : this.state.currNotification
        return (
            <div>
                {(this.state.currError) ? <Popup msg={this.state.currError} callBack={() => {this.setState({ currError: null })}}/> : null}
                <StatusBar msg={msg}>
                    {(this.state.gameStarted) ? null : <button className="button" onClick={() => {this.props.conn.send({'debug': 'startGame'})}}>Start Game</button>}
                    {(this.state.currentTurn && this.state.currentTurn.currentPlayer.getName() == this.props.conn.getName()) ? <button className="button" onClick={() => {this.props.conn.send({'type': 'action', 'content': 'nextTurn'})}}>End Turn</button> : null}
                    {(this.state.currentTurn && this.state.currentTurn.dieValue) ? <p>{`Die Roll: ${this.state.currentTurn.dieValue}`}</p> : null}
                </StatusBar>

                <InventoryDisplay
                    inv={this.state.inventory}
                    onClickPurchasedLine={this.onClickPurchasedLine.bind(this)}
                    onClickPurchasedPoint={this.onClickPurchasedPoint.bind(this)}
                    sendMessage={this.props.conn.sendMessage}
                    hasGameStarted={this.state.gameStarted}
                />

                <PlayerList names={this.state.playerList} currentPlayer={(this.state.currentTurn) ? this.state.currentTurn.currentPlayer.getName() : null}/>
                <Canvas
                    gm={this.state.gm} onClick={this.mouseHandler.bind(this)}
                    mayPlaceRoad={this.state.selectedLinePurchased != null}
                    mayPlaceSettlement={this.state.selectedPointPurchased != null}
                />
            </div>
        )
    }
}  