import { HexPoint, RelPoint, Hex } from "../graphics/Point";
import { defined } from "../util";
import { Player } from "../mechanics/Player";
import { JsonParser, JsonParserError } from "../../../jsonParser";

export class Settlement {
    private p: HexPoint | null;
    private owner: Player;

    private _isCity: boolean = false;

    constructor(location: HexPoint | null, owner: Player) {
        this.p = location;
        this.owner = owner;
        //defined(this.p);
        defined(this.owner);

        //this.owner.addSettlement(this);
    }

    getHexPoint() {
        return this.p;
    }

    isCity() {
        return this._isCity;
    }

    upgrade() {
        if (this._isCity) {
            throw "This already is a city"
        }
        this._isCity = true;
    }

    isHere(h: HexPoint | null) {
        if (!this.p || !h) {
            return false;
        }

        return h.isEqual(this.p);
    }

    // production(r: ResourceType) {
    //     if (this._isCity) {
    //         this.owner.giveResource(r, 2); // 2 if city
    //     }
    //     else {
    //         this.owner.giveResource(r, 1);
    //     }
        
    // }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.p) {
            return;
        }
        
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.fillStyle = this.owner.getColor();
        const relLoc = this.p.toRelPoint();

        // is city
        if (this._isCity) {
            const apo = Hex.getSideLength() / 3.5 + 2;

            //      xStep
            //     |---
            // apo | /
            //     |/
            //
            // tan(30) = xStep / apo

            const xStep = 0.5773502691896257 * apo; //Math.tan(Math.PI / 6) * apo;
            ctx.beginPath();
            ctx.moveTo(relLoc.x + xStep, relLoc.y - apo);
            ctx.lineTo(relLoc.x + 2 * xStep, relLoc.y);
            ctx.lineTo(relLoc.x + xStep, relLoc.y + apo);
            ctx.lineTo(relLoc.x - xStep, relLoc.y + apo);
            ctx.lineTo(relLoc.x - 2 * xStep, relLoc.y);
            ctx.lineTo(relLoc.x - xStep, relLoc.y - apo);
            ctx.closePath();

            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(relLoc.x + xStep, relLoc.y - apo);
            ctx.lineTo(relLoc.x + 2 * xStep, relLoc.y);
            ctx.lineTo(relLoc.x + xStep, relLoc.y + apo);
            ctx.lineTo(relLoc.x - xStep, relLoc.y + apo);
            ctx.lineTo(relLoc.x - 2 * xStep, relLoc.y);
            ctx.lineTo(relLoc.x - xStep, relLoc.y - apo);
            ctx.closePath();

            ctx.stroke();
        }
        else {
            ctx.beginPath();
        
            ctx.arc(relLoc.x, relLoc.y, Hex.getSideLength() / 4, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.beginPath();
            
            ctx.arc(relLoc.x, relLoc.y, Hex.getSideLength() / 4 - 2, 0, 2 * Math.PI);
            ctx.fill();
        }

    }

    static stroke(loc: RelPoint, ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, Hex.getSideLength() / 4, 0, 2 * Math.PI);
        ctx.stroke();
    }

    static strokeCity(relLoc: RelPoint, ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        const apo = Hex.getSideLength() / 3 + 2;
        const xStep = Math.tan(Math.PI / 6) * apo;

        ctx.beginPath();
        ctx.moveTo(relLoc.x + xStep, relLoc.y - apo);
        ctx.lineTo(relLoc.x + 2 * xStep, relLoc.y);
        ctx.lineTo(relLoc.x + xStep, relLoc.y + apo);
        ctx.lineTo(relLoc.x - xStep, relLoc.y + apo);
        ctx.lineTo(relLoc.x - 2 * xStep, relLoc.y);
        ctx.lineTo(relLoc.x - xStep, relLoc.y - apo);
        ctx.closePath();

        ctx.stroke();
    }

    static fromJson(data: object): Settlement {
        const name = JsonParser.askName(data);
        if (name != 'Settlement' && name != 'City') {
            throw new JsonParserError(`Wrong name, got ${name} instead of Settlement or City`);
        }

        const owner = Player.fromJson(JsonParser.requireObject(data, 'owner'), true);

        const tmp = JsonParser.requireObject(data, 'position');
        const position = (tmp) ? HexPoint.fromJson(tmp) : null;

        if (!owner) {
            console.error(owner);
            throw Error('Unknown player');
        }

        const s = new Settlement(position, owner);

        if (name == 'City') {
            s._isCity = true;
        }

        return s;
    }
}