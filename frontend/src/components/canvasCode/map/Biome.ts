import { defined } from "../util";

export class Biome {
    private color: string;

    protected constructor(color: string) {
        this.color = color;
    }

    public getColor() {
        defined(this.color);
        return this.color;
    }
}

export const Desert = new (class Desert extends Biome {
    constructor() {
        super('yellow');
    }
})();

export const Grassland = new (class Grassland extends Biome {
    constructor() {
        super('limegreen');
    }
})();

export const Forest = new (class Forest extends Biome {
    constructor() {
        super('forestgreen');
    }
})();

export const Mountain = new (class Mountain extends Biome {
    constructor() {
        super('dimgray');
    }
})();

export const Farmland = new (class Farmland extends Biome {
    constructor() {
        super('goldenrod');
    }
})();

export const Quarry = new (class Quarry extends Biome {
    constructor() {
        super('firebrick');
    }
})();

export const biomes: Array<Biome> = [Desert, Grassland, Forest, Mountain, Farmland, Quarry];

export function getBiomeByName(name: string): Biome {
    switch (name) {
        case 'desert':
            return Desert;
        case 'grassland':
            return Grassland;
        case 'forest':
            return Forest;
        case 'mountain':
            return Mountain;
        case 'farmland':
            return Farmland;
        case 'quarry':
            return Quarry;
    
        default:
            throw new Error("KeyError: Could not find biome named '" + name + "'")
    }
}

// export const biomeDistributionArray = function() {
//     let tmp_biomeDistributionArray: Array<Biome> = [];
//     biomes.forEach((e: Biome) => {
//         for (let i = 0; i < e.getAbundance(); i++) {
//             tmp_biomeDistributionArray.push(e);
//         }
//     });
//     return tmp_biomeDistributionArray;
// }();
