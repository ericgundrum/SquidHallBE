import { Room, Client } from "colyseus";

import { StateHandler } from "./StateHandler";
import { Player } from "../entities/Player";

export class GameRoom extends Room<StateHandler> {
    maxClients = 512;

    onCreate (options) {
        this.setSimulationInterval(() => this.onUpdate());
        this.setState(new StateHandler());
        this.setSeatReservationTime(30);

        this.onMessage("pos", (client, message) => {
            const player: Player = this.state.players[client.sessionId];
            player.position.r = message.r
            player.position.x = message.x
            player.position.y = message.y
            player.position.z = message.z
        });
    }

    onJoin (client, options) {
        const player = new Player(options.badge);
        player.position.r = 0;
        player.position.x = 0;
        player.position.y = 0;
        player.position.z = 0;

        this.state.players[client.sessionId] = player;
    }

    onUpdate () {
//        for (const sessionId in this.state.players) {
//            const player: Player = this.state.players[sessionId];
//            player.position.x += player.pressedKeys.x * 0.1;
//            player.position.z -= player.pressedKeys.y * 0.1;
//        }
    }

    onLeave (client: Client) {
        delete this.state.players[client.sessionId];
    }

    onDispose () {
    }

}
