import { HexPoint, RelPoint } from "../graphics/Point";
import { defined } from "../util";
import { Player } from "../mechanics/Player";
import { JsonParser } from "../../../jsonParser";

export class Road {
    private p1: HexPoint | null;
    private p2: HexPoint | null;
    // two endpoints of the line

    private owner: Player;

    constructor(p1: HexPoint | null, p2: HexPoint | null, owner: Player) {
        this.p1 = p1;
        this.p2 = p2;
        this.owner = owner;

        // defined(p1);
        // defined(p2);
        defined(owner);

        //this.owner.addRoad(this);
    }

    isEqual(p1: HexPoint | null, p2: HexPoint | null): boolean {
        if (!p1 || !p2 || !this.p1 || !this.p2) {
            return false;
        }

        if (p1.isEqual(this.p1) && p2.isEqual(this.p2)) {
            return true;
        }
        if (p1.isEqual(this.p2) && p2.isEqual(this.p1)) {
            return true;
        }
        return false;
    }

    isAdjacent(p: HexPoint | null): boolean {
        if (!p  || !this.p1 || !this.p2) {
            return false;
        }

        if (p.isEqual(this.p1) || p.isEqual(this.p2)) {
            return true;
        }
        return false;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.p1 || !this.p2) {
            return;
        }

        ctx.strokeStyle = "black";
        ctx.lineWidth = 14;
        ctx.beginPath();
        const tmp1 = this.p1.toRelPoint();
        const tmp2 = this.p2.toRelPoint();
        ctx.moveTo(tmp1.x, tmp1.y);
        ctx.lineTo(tmp2.x, tmp2.y);
        ctx.stroke();

        ctx.strokeStyle = this.owner.getColor();
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(tmp1.x, tmp1.y);
        ctx.lineTo(tmp2.x, tmp2.y);
        ctx.stroke();
    }

    static stroke(tmp1: RelPoint, tmp2: RelPoint, ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(tmp1.x, tmp1.y);
        ctx.lineTo(tmp2.x, tmp2.y);
        ctx.stroke();
    }

    static fromJson(data: object): Road {
        const name = JsonParser.requireName(data, 'Road');

        const owner = Player.fromJson(JsonParser.requireObject(data, 'owner'), true);

        let tmp = JsonParser.requireObject(data, 'point1');
        const point1 = (tmp) ? HexPoint.fromJson(tmp) : null;
        
        tmp = JsonParser.requireObject(data, 'point2');
        const point2 = (tmp) ? HexPoint.fromJson(tmp) : null;

        if (!owner) {
            console.error(owner);
            throw Error('Unknown player');
        }

        const r = new Road(point1, point2, owner);

        return r;
    }
}