//import { ResourceType } from "./dataTypes";
import { defined, assertInt, assert } from "../util";
import { JsonParser, JsonParserError } from "../../../jsonParser";
import { Settlement } from "../map/Settlement";
import { Road } from "../map/Road";

// my own inventory system cause map is limited

// requirements - map based/ like
// get - set - update
// verify enough resources

export class Inventory {
    
    private content: Map<string, number>;
    private pointFeatures: Array<Settlement>;
    private lineFeatures: Array<Road>;

    // private static conversionMap = new Map([
    //     ['Wheat', ResourceType.Wheat],
    //     ['Sheepie', ResourceType.Sheep],
    //     ['Lumber', ResourceType.Lumber],
    //     ['Ore', ResourceType.Ore],
    //     ['Brick', ResourceType.Brick],
    //     ['NoResource', ResourceType.NoResource]
    // ])

    constructor() {
        this.content = new Map();

        this.pointFeatures = [];
        this.lineFeatures = [];
    }

    keys() {
        return this.content.keys();
    }

    get(k: string): number {
        const tmp = this.content.get(k);
        defined(tmp);
        return <number>tmp;
    }

    getPointFeatures(): Array<Settlement> {
        return this.pointFeatures.slice();
    }

    getLineFeatures(): Array<Road> {
        return this.lineFeatures.slice();
    }

    static fromJson(data: object): Inventory {
        const name = JsonParser.askName(data);
        if (name != 'ExpandedInventory' && name != 'Inventory') {
            throw new JsonParserError(`Wrong name, got ${name} instead of ExpandedInventory or Inventory`);
        }

        const inv = new Inventory();

        const invData = JsonParser.requireObject(data, 'inventory');

        for (const resourceName in invData) {
            const count = JsonParser.requireNumber(invData, resourceName);
            assertInt(count);
            inv.content.set(resourceName, count);
        }

        if (name == 'ExpandedInventory') {
            const settlementArr = JsonParser.requireArray(data, 'pointFeatures');
            for (const it of settlementArr) {
                inv.pointFeatures.push(Settlement.fromJson(it));
            }

            const roadArr = JsonParser.requireArray(data, 'lineFeatures');
            for (const it of roadArr) {
                inv.lineFeatures.push(Road.fromJson(it));
            }
        }

        return inv;
    }
}
