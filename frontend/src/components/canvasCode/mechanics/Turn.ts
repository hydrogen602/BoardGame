import { defined, assertInt } from "../util";
import { JsonParser } from "../../../jsonParser";
import { Player } from "./Player";

export class Turn {

    public roundNum: number;
    public currentPlayer: Player;
    public dieValue: number | null;

    constructor(roundNum: number, currentPlayer: Player, dieValue: number | null) {
        this.roundNum = roundNum;
        this.currentPlayer = currentPlayer;
        this.dieValue = dieValue;

        defined(this.roundNum);
        defined(this.currentPlayer);
        //defined(this.dieValue); may be null

        assertInt(this.roundNum);
        if (this.dieValue) {
            assertInt(this.dieValue);
        }
    }

    static fromJson(obj: object): Turn {
        const playerTag = JsonParser.requireObject(obj, 'currentPlayer');

        const player = Player.fromJson(playerTag, true);

        const dieVal = (JsonParser.requireAny(obj, 'dieValue')) ? JsonParser.requireNumber(obj, 'dieValue') : null;

        if (player) {
            return new Turn(
                JsonParser.requireNumber(obj, 'roundNum'),
                player,
                dieVal
            );
        }
        else {
            console.error(playerTag);
            throw Error('Unknown player!');
        }
    }
}