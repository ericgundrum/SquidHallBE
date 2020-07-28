import { Schema, type } from "@colyseus/schema";

export class Position extends Schema {
    @type("number") r: number = 0;
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
}

export class Player extends Schema {
    @type(Position) position = new Position();
    @type("string") wp_uid;

    constructor () {
        super();
    }
}
