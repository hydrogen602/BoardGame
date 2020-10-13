import { HexPoint, AbsPoint } from "../graphics/Point";
import { Tile } from "./Tile";
import { Settlement } from "./Settlement";
import { Road } from "./Road";
import { JsonParser } from "../../../jsonParser";
import { assertInt } from "../util";

export class GameMap {
    private tilesArr: Array<Tile>;
    private settlementsArr: Array<Settlement>;
    private roadsArr: Array<Road>;

    // offset of map on screen in order to move around the map
    // currLocation: RelPoint;

    constructor(tilesArr: Array<Tile>, settlementsArr: Array<Settlement>, roadsArr: Array<Road>) {
        this.tilesArr = tilesArr;
        this.settlementsArr = settlementsArr;
        this.roadsArr = roadsArr;
    }

    static fromJson(data: object): GameMap {
        JsonParser.requireName(data, 'GameMap');

        let tmp: Array<any> = JsonParser.requireArray(data, 'tiles');

        const tilesArr: Array<Tile> = [];
        for (const t of tmp) {
            tilesArr.push(Tile.fromJson(t));
        }

        tmp = JsonParser.requireArray(data, 'points');
        
        const settlementsArr: Array<Settlement> = [];
        for (const s of tmp) {
            settlementsArr.push(Settlement.fromJson(s));
        }

        tmp = JsonParser.requireArray(data, 'lines');
        const roadsArr: Array<Road> = [];
        for (const r of tmp) {
            roadsArr.push(Road.fromJson(r));
        }

        return new GameMap(tilesArr, settlementsArr, roadsArr);
    }

    getTiles() {
        return this.tilesArr;
    }

    getSettlements() {
        return this.settlementsArr;
    }

    getRoads() {
        return this.roadsArr;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;

        this.tilesArr.forEach(e => {
            e.draw(ctx);
        });

        this.tilesArr.forEach(e => {
            e.draw2(ctx);
        });

        this.roadsArr.forEach(r => {
            r.draw(ctx);
        });

        this.settlementsArr.forEach(s => {
            s.draw(ctx);
        });
    }

    dieRolled(value: number) {
        assertInt(value);

        this.tilesArr.forEach(tile => {
            tile.activateIfDiceValueMatchesElseDeactivate(value);
        });
    }
}
