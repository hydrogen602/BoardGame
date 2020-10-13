import { assert, assertInt, square } from "../util";
import { JsonParser } from "../../../jsonParser";

class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

// offset x = 1.5x-0.5

function getN() {
    return 3;
}


export class Hex {

    private static sectionLength: number = 50

    static getSideLength() {
        return Hex.sectionLength;
    }

    //
    // apothem = s / 2 * tan(180/n)
    // where n is the number of sides (n=6)
    //
    // so apothem = s / 2 * tan(30) = s / (2 * (1 / sqrt(3)))
    // = s * sqrt(3) / 2
    //
    private static apothem: number = Hex.sectionLength * Math.sqrt(3) / 2;

    static getApothem() {
        return Hex.apothem;
    }

    private constructor() {}

    static pxUnshiftedToHexGrid(x: number, y: number): HexPoint {
        const row = Math.round(y / Hex.apothem);
        
        // x has to be unshifted
        const col = x / (Hex.sectionLength * 1.5);

        // col = col - (1/6); // (1/3) * (1/2); offset is 0 or 1/3, so subtract middle and round

        // return new HexPoint(Math.round(col), Math.round(row));

        // new approach -> look for which one is closer
        const colR = Math.ceil(col);
        const colL = Math.floor(col);

        const pR = Hex.hexGridToPxUnshifted(row, colR).x;
        const pL = Hex.hexGridToPxUnshifted(row, colL).x;

        if (Math.abs(x - pR) < Math.abs(x - pL)) {
            // closer to right point than left
            return new HexPoint(colR, row);
        }
        else {
            return new HexPoint(colL, row);
        }
    }

    static pxUnshiftedToDualHexGrid(x: number, y: number): Array<HexPoint> {
        const row = Math.round(y / Hex.apothem);
        
        // x has to be unshifted
        const col = x / (Hex.sectionLength * 1.5);

        const colR = Math.ceil(col);
        const colL = Math.floor(col);

        const rowErr = Math.abs((y / Hex.apothem) % 1);
        if (rowErr < 0.15 || rowErr > 0.85) {
            // horizontal mode
            const p1 = new HexPoint(colL, row);
            const p2 = new HexPoint(colR, row);

            if (p1.isNeighbor(p2)) {
                return [p1, p2];
            }
            else {
                return [];
            }
        }
        else if ((col % 1) > 0 && (col % 1) < 1/3) {
            // check for sloped lines
            const rowTop = Math.floor(y / Hex.apothem);
            const rowBottom = Math.ceil(y / Hex.apothem);

            let col = Hex.pxUnshiftedToHexGrid(x, y).x;

            const p1 = new HexPoint(col, rowTop);
            const p2 = new HexPoint(col, rowBottom);

            if (p1.isNeighbor(p2)) {
                return [p1, p2];
            }
            else {
                return [];
            }
        }
        return [];
    }

    static hexGridToPxUnshifted(row: number, col: number): AbsPoint {
        //
        //  /--\
        //  \--/
        //  

        // let x = col * (Hex.sectionLength + Hex.sectionLength * Math.sin(Math.PI/6));
        // Math.sin(Math.PI / 6) == 0.5 so...
        
        let x = col * Hex.sectionLength * 1.5;
    
        if (Math.abs(row % 2) == Math.abs(col % 2)) {
            x = x + Hex.sectionLength * 0.5; //Math.sin(Math.PI/6);
        }
    
        const y = Hex.apothem * row;
    
        return new AbsPoint(x, y);
    }

    static hexGridToPx(row: number, col: number): RelPoint {    
        return Hex.hexGridToPxUnshifted(row, col).toRelPoint();
    }

    static getCenterOfHex(row: number, col: number) {
        // assuming row, col is top left corner
        const p = Hex.hexGridToPxUnshifted(row, col);
        //  /--\
        //  \--/
        p.x += Hex.sectionLength / 2;
        p.y += Hex.apothem;
        return p;
    }

    static getHexCorners(row: number, col: number): Array<HexPoint> {
        return [
            new HexPoint(col, row),
            new HexPoint(col + 1, row),
            new HexPoint(col + 1, row + 1),
            new HexPoint(col + 1, row + 2),
            new HexPoint(col, row + 2),
            new HexPoint(col, row + 1)
        ];
    }

    static fillHex(row: number, col: number, ctx: CanvasRenderingContext2D) {
        let p = Hex.hexGridToPx(row, col);
        
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);

        // const ls = this.getHexCorners(row, col);
        // ls.forEach(p => {
        //     var tmp = p.toRelPoint();
        //     ctx.lineTo(tmp.x, tmp.y);
        // });

        p = Hex.hexGridToPx(row, col + 1);
        ctx.lineTo(p.x, p.y);
    
        p = Hex.hexGridToPx(row + 1, col + 1);
        ctx.lineTo(p.x, p.y);
    
        p = Hex.hexGridToPx(row + 2, col + 1);
        ctx.lineTo(p.x, p.y);
    
        p = Hex.hexGridToPx(row + 2, col);
        ctx.lineTo(p.x, p.y);
    
        p = Hex.hexGridToPx(row + 1, col);
        ctx.lineTo(p.x, p.y);        
    
        p = Hex.hexGridToPx(row, col);
        ctx.lineTo(p.x, p.y);
    
        ctx.fill()
    }
    
    static strokeHex(row: number, col: number, ctx: CanvasRenderingContext2D) {
        let p = Hex.hexGridToPx(row, col)
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
    
        p = Hex.hexGridToPx(row, col + 1);
        ctx.lineTo(p.x, p.y);
    
        p = Hex.hexGridToPx(row + 1, col + 1);
        ctx.lineTo(p.x, p.y);
    
        p = Hex.hexGridToPx(row + 2, col + 1);
        ctx.lineTo(p.x, p.y);
    
        p = Hex.hexGridToPx(row + 2, col);
        ctx.lineTo(p.x, p.y);
    
        p = Hex.hexGridToPx(row + 1, col);
        ctx.lineTo(p.x, p.y);
    
        p = Hex.hexGridToPx(row, col);
        ctx.lineTo(p.x, p.y);
    
        ctx.stroke()
    }

    static distanceFromNearestHexCorner(p: AbsPoint|RelPoint) {
        const abs = p.toAbsPoint(); // if already absolute, it returns a copy of itself
        const backConvertedHex = p.toHexPoint().toAbsPoint();

        return Math.sqrt(square(abs.x - backConvertedHex.x) + square(abs.y - backConvertedHex.y));
    }

}


// offset of map on screen in order to move around the map
export const currLocation = new Point(
    window.innerWidth / 2 - Hex.getSideLength() * (1.5 * getN() - 0.5), 
    window.innerHeight / 2 - Hex.getApothem() * getN()); // in px

export const centerOfScreen = new Point(
    window.innerWidth / 2 - Hex.getSideLength() * (1.5 * getN() - 0.5), 
    window.innerHeight / 2 - Hex.getApothem() * getN()); // in px

export const maxDistance = Hex.getSideLength() * (1.5 * getN() - 0.5) * 1.5;


export class HexPoint extends Point {
    constructor(col: number, row: number) {
        assertInt(col);
        assertInt(row);
        super(col, row);
    }

    static fromJson(data: object): HexPoint {
        JsonParser.requireName(data, 'HexPoint');

        const row = JsonParser.requireNumber(data, 'row');
        const col = JsonParser.requireNumber(data, 'col');

        return new HexPoint(col, row);
    }

    toJsonSerializable(): object {
        return {
            '__name__': 'HexPoint',
            'row': this.y,
            'col': this.x
        }
    }

    toAbsPoint(): AbsPoint {
        return Hex.hexGridToPxUnshifted(this.y, this.x);
    }

    toRelPoint(): RelPoint {
        return Hex.hexGridToPx(this.y, this.x);
    }

    isNeighbor(other: HexPoint): boolean {
        if (other.x == this.x && other.y == this.y + 1) {
            return true;
        }
        if (other.x == this.x && other.y == this.y - 1) {
            return true;
        }
        if (Math.abs(this.x % 2) == Math.abs(this.y % 2)) {
            // check right
            if (other.x == this.x + 1 && other.y == this.y) {
                return true;
            }
        }
        else {
            // check left
            if (other.x == this.x - 1 && other.y == this.y) {
                return true;
            }
        }

        return false;
    }

    isEqual(other: HexPoint): boolean {
        return (other.x == this.x && other.y == this.y);
    }
}

export class AbsPoint extends Point {
    constructor(x: number, y: number) {
        super(x, y);
    }

    toRelPoint(): RelPoint {
        return new RelPoint(this.x + currLocation.x, this.y + currLocation.y);
    }

    toAbsPoint(): AbsPoint {
        return new AbsPoint(this.x, this.y);
    }

    toHexPoint(): HexPoint {
        return Hex.pxUnshiftedToHexGrid(this.x, this.y);
    }

    toDualHexPoint(): Array<HexPoint> {
        return Hex.pxUnshiftedToDualHexGrid(this.x, this.y);
    }
}

export class RelPoint extends Point {
    constructor(x: number, y: number) {
        super(x, y);
    }

    toRelPoint(): RelPoint {
        return new RelPoint(this.x, this.y);
    }

    toAbsPoint(): AbsPoint {
        return new AbsPoint(this.x - currLocation.x, this.y - currLocation.y);
    }

    toHexPoint(): HexPoint {
        const p = this.toAbsPoint();
        return Hex.pxUnshiftedToHexGrid(p.x, p.y);
    }

    toDualHexPoint(): Array<HexPoint> {
        const p = this.toAbsPoint();
        return Hex.pxUnshiftedToDualHexGrid(p.x, p.y);
    }
}

