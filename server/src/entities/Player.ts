import { Schema, type } from "@colyseus/schema";

export class Position extends Schema {
    @type("number") r: number = 0;
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
}

export class Badge extends Schema {
    @type("string") uid;
    @type("string") name;

    constructor (badge) {
        super();
        if(badge) {
            this.uid = badge.uid;
            this.name = badge.name;
        }
    }
}

export class Player extends Schema {
    @type(Position) position = new Position();
    @type(Badge) badge;

    constructor (badge) {
        super();
        this.badge = new Badge(badge);
    }
}
