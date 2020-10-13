import { Biome, Desert, getBiomeByName } from "./Biome";
import { defined, assertInt } from "../util";
import { HexPoint, AbsPoint, Hex } from "../graphics/Point"
import { JsonParserError, JsonParser } from "../../../jsonParser"
// import { Settlement } from "./Settlement";
// import { Config } from "../Config";

export class Tile {
    private p: HexPoint;
    private landType: Biome;
    private diceValue: number;
    private center: AbsPoint;

    private active: boolean = false; // whether this round's die roll matches this tile
    private isDisabledByRobber: boolean;

    constructor(location: HexPoint, landType: Biome, diceValue: number, isDisabledByRobber: boolean) {
        this.diceValue = diceValue;
        this.landType = landType;
        this.p = location;
        this.isDisabledByRobber = isDisabledByRobber;

        this.center = Hex.getCenterOfHex(location.y, location.x); // flip on purpose

        defined(this.diceValue);
        defined(this.landType);
        defined(this.p);
        defined(this.center);
    }

    static fromJson(data: object): Tile {
        JsonParser.requireName(data, 'Tile');

        const diceValue = JsonParser.requireNumber(data, 'diceValue');
        const location = HexPoint.fromJson(JsonParser.requireObject(data, 'location'));
        const biome = getBiomeByName(JsonParser.requireString(data, 'biome'));

        const isDisabledByRobber = JsonParser.requireBool(data, 'isDisabledByRobber');

        return new Tile(location, biome, diceValue, isDisabledByRobber);
    }

    // getDiceValue() {
    //     return this.diceValue;
    // }

    // getLandType() {
    //     return this.landType;
    // }

    getPos() {
        return this.p;
    }

    // // activate if die matches this tile. Also does production
    // activateIfDiceValueMatches(value: number, settlements: Array<Settlement>) {
    //     assertInt(value);
    //     if (value == this.diceValue && !this.isDisabledByRobber) { // no profits if the robber is around
    //         this.active = true;
            
    //         // find neighboring settlements and award resource
    //         Hex.getHexCorners(this.p.y, this.p.x).forEach(c => {
    //             settlements.forEach(s => {
    //                 if (s.isHere(c)) {
    //                     s.production(this.landType.getResourceType());
    //                 }
    //             })
    //         })
            
    //     }
    // }

    activateIfDiceValueMatchesElseDeactivate(value: number) {
        assertInt(value);
        if (value == this.diceValue && !this.isDisabledByRobber && this.landType != Desert) { // no profits if the robber is around
            this.active = true;
        }
        else {
            this.active = false;
        }
    }

    highlightIfActive(ctx: CanvasRenderingContext2D) {
        if (this.active && !this.isDisabledByRobber) {
            this.highlight(ctx);
        }
    }

    highlight(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;
        Hex.strokeHex(this.p.y, this.p.x, ctx);
    }

    // arriveRobber() {
    //     this.isDisabledByRobber = true;
    // }

    // departRobber() {
    //     this.isDisabledByRobber = false;
    // }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.landType.getColor();

        Hex.fillHex(this.p.y, this.p.x, ctx);

        const relCenter = this.center.toRelPoint();

        if (this.landType != Desert) {
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "black";
            ctx.fillText(this.diceValue.toString(), relCenter.x, relCenter.y);
        }
        
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;

        Hex.strokeHex(this.p.y, this.p.x, ctx);
    }

    /**
     * Call this function after draw() has
     * been called on all tiles
     * 
     * @param ctx CanvasRenderingContext2D
     */
    draw2(ctx: CanvasRenderingContext2D) {
        if (this.isDisabledByRobber) {
            this.strokeRobber(ctx);
        }

        this.highlightIfActive(ctx);
    }

    strokeRobber(ctx: CanvasRenderingContext2D) {
        const relCenter = this.center.toRelPoint();

        const apo = Hex.getSideLength() / 3.5 + 2;
        const xStep = 0.5773502691896257 * apo; // Math.tan(Math.PI / 6) * apo;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(relCenter.x + xStep, relCenter.y - apo);
        ctx.lineTo(relCenter.x + 2 * xStep, relCenter.y);
        ctx.lineTo(relCenter.x + xStep, relCenter.y + apo);
        ctx.lineTo(relCenter.x - xStep, relCenter.y + apo);
        ctx.lineTo(relCenter.x - 2 * xStep, relCenter.y);
        ctx.lineTo(relCenter.x - xStep, relCenter.y - apo);
        ctx.closePath();

        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(relCenter.x + xStep, relCenter.y - apo);
        ctx.lineTo(relCenter.x - xStep, relCenter.y + apo);
        ctx.closePath();

        ctx.stroke();

        ctx.beginPath();
        ctx.lineTo(relCenter.x - xStep, relCenter.y - apo);
        ctx.lineTo(relCenter.x + xStep, relCenter.y + apo);
        ctx.closePath();

        ctx.stroke();
    }

    // this method is from http://www.playchilla.com/how-to-check-if-a-point-is-inside-a-hexagon
    isInside(pos: AbsPoint): boolean
    {
        // vertical = apothem
        const q2x: number = Math.abs(pos.x - this.center.x);
        const q2y: number = Math.abs(pos.y - this.center.y);

        const vert = Hex.getApothem();
        const hori = Hex.getSideLength() / 2;

        if (q2x > hori*2 || q2y > vert) return false;
        return vert * 2 * hori - vert * q2x - 2* hori * q2y >= 0;
    }
}
